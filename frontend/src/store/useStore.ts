import { create } from 'zustand';
import { api } from '../services/api';

interface ResumeData {
  resume_id: string;
  filename: string;
  parsed_content: {
    personal_info: {
      name: string;
      email: string;
      phone: string;
      location: string;
      links: string[];
    };
    experience: Array<{
      company: string;
      title: string;
      start_date: string;
      end_date: string;
      descriptions: string[];
    }>;
    education: Array<{
      institution: string;
      degree: string;
      major: string;
      graduation_date: string;
    }>;
    skills: string[];
  };
}

interface AnalysisData {
  analysis_id: string;
  ats_score: number;
  breakdown: {
    semantic_match: number;
    hard_skills_match: number;
    structural_score: number;
  };
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

interface InterviewData {
  interview_id: string;
  questions: Array<{
    question: string;
    category: string;
    expected_answer: string;
  }>;
}

interface CoverLetterData {
  cover_letter_id: string;
  content: string;
  tone: string;
}

interface AppState {
  resume: ResumeData | null;
  analysis: AnalysisData | null;
  interviews: InterviewData | null;
  coverLetter: CoverLetterData | null;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  currentJobDescription: string;
  activeView: 'home' | 'results';

  setView: (view: 'home' | 'results') => void;
  uploadResume: (file: File) => Promise<void>;
  runAnalysis: (jobText: string) => Promise<void>;
  generateCoverLetter: (jobText: string, tone?: string) => Promise<void>;
  clearNotifications: () => void;
  resetStore: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  resume: null,
  analysis: null,
  interviews: null,
  coverLetter: null,
  isLoading: false,
  error: null,
  successMessage: null,
  currentJobDescription: '',
  activeView: 'home',

  setView: (view) => set({ activeView: view }),

  clearNotifications: () => set({ error: null, successMessage: null }),

  uploadResume: async (file: File) => {
    set({ isLoading: true, error: null, successMessage: null });
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      set({ 
        resume: response.data, 
        isLoading: false, 
        successMessage: `Successfully parsed & uploaded: ${file.name}` 
      });
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Failed to upload and parse resume.';
      set({ error: message, isLoading: false });
    }
  },

  runAnalysis: async (jobText: string) => {
    const { resume } = get();
    if (!resume) {
      set({ error: 'Please upload a resume first.' });
      return;
    }

    set({ isLoading: true, error: null, successMessage: null, currentJobDescription: jobText });
    try {
      // Execute requests in parallel to reduce loading latency on user dashboard
      const [analysisRes, interviewRes, coverLetterRes] = await Promise.all([
        api.post('/analysis/match', {
          resume_id: resume.resume_id,
          job_text: jobText,
        }),
        api.post('/interviews/generate', {
          resume_id: resume.resume_id,
          job_text: jobText,
        }),
        api.post('/generator/cover-letter', {
          resume_id: resume.resume_id,
          job_text: jobText,
          tone: 'professional', // Default tone at first generation
        })
      ]);

      set({
        analysis: analysisRes.data,
        interviews: interviewRes.data,
        coverLetter: coverLetterRes.data,
        isLoading: false,
        successMessage: 'ATS match analysis and AI generations completed successfully.',
        activeView: 'results'
      });
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Analysis processing failed. Check API configurations.';
      set({ error: message, isLoading: false });
    }
  },

  generateCoverLetter: async (jobText: string, tone: string = 'professional') => {
    const { resume, currentJobDescription } = get();
    if (!resume) {
      set({ error: 'No active resume found.' });
      return;
    }

    set({ isLoading: true, error: null, successMessage: null });
    try {
      const response = await api.post('/generator/cover-letter', {
        resume_id: resume.resume_id,
        job_text: jobText || currentJobDescription,
        tone,
      });

      set({
        coverLetter: response.data,
        isLoading: false,
        successMessage: `Cover letter updated with ${tone} tone.`
      });
    } catch (err: any) {
      const message = err.response?.data?.detail || err.message || 'Failed to update cover letter tone.';
      set({ error: message, isLoading: false });
    }
  },

  resetStore: () => set({ 
    resume: null, 
    analysis: null, 
    interviews: null, 
    coverLetter: null, 
    error: null,
    successMessage: null,
    currentJobDescription: '',
    activeView: 'home' 
  }),
}));
