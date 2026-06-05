import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  ArrowLeft, CheckCircle2, AlertTriangle, Lightbulb, 
  Mail, MessageSquare, FileText, Copy, Check, RotateCcw,
  Sparkles, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

export const Results: React.FC = () => {
  const { 
    analysis, interviews, coverLetter, resume, resetStore, 
    generateCoverLetter, isLoading, error, successMessage, clearNotifications 
  } = useStore();
  const [activeRightTab, setActiveRightTab] = useState<'cover-letter' | 'interview' | 'resume-data'>('cover-letter');
  const [letterTone, setLetterTone] = useState('professional');
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [activeInterviewIdx, setActiveInterviewIdx] = useState<number | null>(null);

  if (!analysis || !resume) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-400">No active analysis reports found. Please return home and scan your resume.</p>
      </div>
    );
  }

  const handleCopyLetter = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter.content);
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    }
  };

  const handleToneChange = async (newTone: string) => {
    setLetterTone(newTone);
    await generateCoverLetter('', newTone); 
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto px-6 py-8 md:py-12 bg-[#030712] min-h-screen">
      {/* Background radial glows */}
      <div className="absolute top-0 right-10 w-[350px] h-[350px] rounded-full bg-indigo-950/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-5 w-[300px] h-[300px] rounded-full bg-purple-950/10 blur-[90px] pointer-events-none" />

      {/* Top back selector bar (Notion/Linear style) */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-900/60 z-10">
        <button
          onClick={resetStore}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors font-semibold uppercase tracking-wider"
        >
          <ArrowLeft size={14} />
          Go back to editor
        </button>
        <div className="flex items-center gap-2 bg-slate-900/30 border border-slate-850 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-mono">
          <FileText size={13} className="text-indigo-400" />
          <span>parsed:</span>
          <strong className="text-slate-200 truncate max-w-[150px]">{resume.filename}</strong>
        </div>
      </div>

      {/* Dynamic Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-950/10 border border-red-900/30 rounded-xl flex items-center justify-between text-red-400 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} />
            <span className="font-medium">{error}</span>
          </div>
          <button onClick={clearNotifications} className="text-slate-500 hover:text-slate-350 text-[10px] uppercase font-bold tracking-wider px-2">Dismiss</button>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-emerald-950/10 border border-emerald-900/30 rounded-xl flex items-center justify-between text-emerald-400 text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={14} />
            <span className="font-medium">{successMessage}</span>
          </div>
          <button onClick={clearNotifications} className="text-slate-500 hover:text-slate-350 text-[10px] uppercase font-bold tracking-wider px-2">Dismiss</button>
        </div>
      )}

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        
        {/* Left Side: Score & Match analytics */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Score Card (Stripe Dashboard style) */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-900/10 relative overflow-hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">ATS Compatibility</h3>
            
            <div className="flex flex-col gap-6">
              {/* Circular gauge */}
              <div className="flex items-center justify-center gap-6">
                <div className="relative flex items-center justify-center h-24 w-24 rounded-full border border-slate-850/60 bg-slate-950/30 shadow-inner">
                  <span className="text-2xl font-extrabold text-white tracking-tight">{analysis.ats_score}%</span>
                  <svg className="absolute top-[-3px] left-[-3px] w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="45"
                      fill="transparent"
                      stroke="#4f46e5"
                      strokeWidth="3.5"
                      strokeDasharray="283"
                      strokeDashoffset={283 - (283 * analysis.ats_score) / 100}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-slate-200">Overall Match</span>
                  <span className="text-[10px] text-slate-500 font-medium">Calculated across skill matrix & experience logs.</span>
                </div>
              </div>

              {/* Progress bars breakdown */}
              <div className="flex flex-col gap-3.5 border-t border-slate-900/60 pt-4 font-mono text-[10px] text-slate-400">
                <div>
                  <div className="flex justify-between mb-1 uppercase tracking-wide">
                    <span>Semantic Context</span>
                    <span className="text-slate-200">{analysis.breakdown.semantic_match}%</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${analysis.breakdown.semantic_match}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 uppercase tracking-wide">
                    <span>Hard Skills Core</span>
                    <span className="text-slate-200">{analysis.breakdown.hard_skills_match}%</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${analysis.breakdown.hard_skills_match}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1 uppercase tracking-wide">
                    <span>CV Layout Struct</span>
                    <span className="text-slate-200">{analysis.breakdown.structural_score}%</span>
                  </div>
                  <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: `${analysis.breakdown.structural_score}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skills checklist card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-900/10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Core Skills Audit</h3>
            
            <div className="flex flex-col gap-6">
              <div>
                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <CheckCircle2 size={13} />
                  Matched Keywords ({analysis.matched_skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matched_skills.map((skill, idx) => (
                    <span key={idx} className="text-[9px] font-bold bg-emerald-950/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900/40">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                  <AlertTriangle size={13} />
                  Missing Keywords ({analysis.missing_skills.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missing_skills.map((skill, idx) => (
                    <span key={idx} className="text-[9px] font-bold bg-pink-950/20 text-pink-400 px-2 py-0.5 rounded border border-pink-900/40">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations checklist (Notion layout) */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-900/10">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-1.5">
              <Lightbulb size={14} className="text-indigo-400" />
              CV Improvement Checklist
            </h3>
            <ul className="flex flex-col gap-3">
              {analysis.recommendations.map((rec, idx) => (
                <li key={idx} className="flex gap-2 text-xs text-slate-400 leading-relaxed items-start">
                  <span className="h-4.5 w-4.5 bg-indigo-950/40 text-indigo-400 font-mono text-[9px] flex items-center justify-center rounded border border-indigo-900/50 mt-0.5 shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-[11px]">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Side: Tab based editor tools */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Tab Selector (Stripe animated-like line styling) */}
          <div className="flex border-b border-slate-900 gap-6">
            <button
              onClick={() => setActiveRightTab('cover-letter')}
              className={`flex items-center gap-2 py-3 px-1 text-xs font-bold tracking-wider uppercase border-b-2 transition-all ${
                activeRightTab === 'cover-letter'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Mail size={13} />
              Cover Letter Draft
            </button>
            <button
              onClick={() => setActiveRightTab('interview')}
              className={`flex items-center gap-2 py-3 px-1 text-xs font-bold tracking-wider uppercase border-b-2 transition-all ${
                activeRightTab === 'interview'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <MessageSquare size={13} />
              Interview prep guide
            </button>
            <button
              onClick={() => setActiveRightTab('resume-data')}
              className={`flex items-center gap-2 py-3 px-1 text-xs font-bold tracking-wider uppercase border-b-2 transition-all ${
                activeRightTab === 'resume-data'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <FileText size={13} />
              Resume content structure
            </button>
          </div>

          {/* Active Tab panel container */}
          <div className="min-h-[450px]">
            
            {/* Tab 1: Cover Letter Panel */}
            {activeRightTab === 'cover-letter' && coverLetter && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-900/10 flex flex-col gap-4">
                
                {/* Tone settings controller */}
                <div className="flex items-center justify-between border-b border-slate-900/60 pb-3.5 flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Selected Tone:</span>
                    <div className="flex gap-1 bg-slate-950/40 p-0.5 rounded-lg border border-slate-900">
                      {['professional', 'enthusiastic', 'confident', 'minimalist'].map((t) => (
                        <button
                          key={t}
                          disabled={isLoading}
                          onClick={() => handleToneChange(t)}
                          className={`text-[9px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded transition-colors ${
                            coverLetter.tone === t
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/20'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <button
                    onClick={handleCopyLetter}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/40 hover:bg-slate-850/60 text-indigo-400 hover:text-indigo-350 text-[10px] font-bold rounded-lg border border-slate-850 transition-colors"
                  >
                    {copiedLetter ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    {copiedLetter ? 'Copied' : 'Copy Text'}
                  </button>
                </div>

                {/* Preformatted editor view */}
                <div className="relative">
                  {isLoading && (
                    <div className="absolute inset-0 bg-[#030712]/70 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center text-xs text-indigo-400 gap-3 border border-slate-900 z-20">
                      <RefreshCw size={18} className="animate-spin text-indigo-500" />
                      <span className="font-semibold tracking-wider uppercase text-[9px]">Re-drafting with OpenAI...</span>
                    </div>
                  )}
                  <pre className="w-full bg-[#02050a]/40 border border-slate-900 rounded-xl p-6 text-[11px] md:text-xs font-mono text-slate-300 leading-relaxed overflow-x-auto whitespace-pre-wrap min-h-[350px]">
                    {coverLetter.content}
                  </pre>
                </div>
              </div>
            )}

            {/* Tab 2: Interview Prep Panel */}
            {activeRightTab === 'interview' && interviews && (
              <div className="flex flex-col gap-4">
                <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-900/10">
                  <div className="mb-6">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <Sparkles size={14} className="text-purple-400 animate-pulse" />
                      Target Assessment Guide
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Click to expand expectations and suggested response frameworks.
                    </p>
                  </div>

                  {/* Accordion List */}
                  <div className="flex flex-col gap-3">
                    {interviews.questions.map((item, idx) => {
                      const isExpanded = activeInterviewIdx === idx;
                      return (
                        <div key={idx} className="border border-slate-900/80 rounded-xl bg-slate-950/20 overflow-hidden transition-all">
                          <button
                            onClick={() => setActiveInterviewIdx(isExpanded ? null : idx)}
                            className="w-full p-4 flex justify-between items-start text-left hover:bg-slate-900/20 transition-colors gap-4"
                          >
                            <div className="flex flex-col gap-2">
                              <span className="text-[8px] font-extrabold uppercase tracking-widest bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-850 w-max">
                                {item.category}
                              </span>
                              <p className="text-xs font-semibold text-slate-200 leading-relaxed">{item.question}</p>
                            </div>
                            <span className="text-[10px] text-slate-500 hover:text-slate-300 font-bold uppercase tracking-wider select-none shrink-0 mt-1">
                              {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="p-4 bg-slate-950/40 border-t border-slate-900/60 text-[11px] text-slate-450 leading-relaxed flex flex-col gap-2 border-b-2 border-indigo-500/10">
                              <p className="font-bold text-slate-350 tracking-wide uppercase text-[9px]">Suggested Response Strategy:</p>
                              <p className="pl-2 border-l-2 border-indigo-500/30 text-slate-400">{item.expected_answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Parsed Resume Content Structure */}
            {activeRightTab === 'resume-data' && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-900 bg-slate-900/10 flex flex-col gap-6">
                <div>
                  <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Extracted Metadata</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-slate-900/60 p-4 rounded-xl bg-slate-950/20 text-xs text-slate-400 font-medium">
                    <p>Candidate: <strong className="text-slate-200 ml-1">{resume.parsed_content.personal_info.name || "N/A"}</strong></p>
                    <p>Email: <strong className="text-slate-200 ml-1">{resume.parsed_content.personal_info.email || "N/A"}</strong></p>
                    <p>Phone: <strong className="text-slate-200 ml-1">{resume.parsed_content.personal_info.phone || "N/A"}</strong></p>
                    <p>Location: <strong className="text-slate-200 ml-1">{resume.parsed_content.personal_info.location || "N/A"}</strong></p>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Employment History</h4>
                  <div className="flex flex-col gap-4">
                    {resume.parsed_content.experience.map((exp, idx) => (
                      <div key={idx} className="border-l border-slate-800 pl-4 py-1.5 flex flex-col gap-2">
                        <div className="flex justify-between items-baseline flex-wrap gap-2">
                          <p className="text-xs font-bold text-slate-200">{exp.title} <span className="text-slate-500 font-medium">at</span> {exp.company}</p>
                          <p className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">{exp.start_date} - {exp.end_date}</p>
                        </div>
                        <ul className="list-disc list-inside text-[10px] text-slate-450 leading-relaxed flex flex-col gap-1.5 pl-2">
                          {exp.descriptions.map((desc, i) => (
                            <li key={i} className="marker:text-slate-600">{desc}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3">Education credentials</h4>
                  <div className="flex flex-col gap-3">
                    {resume.parsed_content.education.map((edu, idx) => (
                      <div key={idx} className="text-xs text-slate-400 border border-slate-900/60 p-4 rounded-xl bg-slate-950/20 flex flex-col gap-1">
                        <p className="font-bold text-slate-350">{edu.degree} in {edu.major}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{edu.institution} — Graduation: {edu.graduation_date}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
