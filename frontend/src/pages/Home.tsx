import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Upload, FileText, Sparkles, Check, AlertTriangle, ArrowRight, RefreshCw, FileCode2 } from 'lucide-react';

export const Home: React.FC = () => {
  const { uploadResume, resume, runAnalysis, isLoading, error, successMessage, clearNotifications } = useStore();
  const [jobText, setJobText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    clearNotifications();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        setLocalFile(file);
        setUploadSuccess(false);
        await uploadResume(file);
        setUploadSuccess(true);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    clearNotifications();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLocalFile(file);
      setUploadSuccess(false);
      await uploadResume(file);
      setUploadSuccess(true);
    }
  };

  const handleStartAnalysis = async () => {
    clearNotifications();
    if (resume && jobText.trim()) {
      await runAnalysis(jobText);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col justify-center items-center px-6 py-12 md:py-20 overflow-hidden bg-[#030712]">
      {/* Background radial glows (Linear/Perplexity style) */}
      <div className="absolute top-[-10%] left-[10%] w-[500px] h-[500px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[400px] h-[400px] rounded-full bg-purple-900/5 blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-5xl z-10 flex flex-col items-center">
        
        {/* Header Hero Section */}
        <div className="text-center max-w-3xl mb-12 md:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/30 border border-indigo-900/40 text-indigo-400 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles size={12} className="text-indigo-400" />
            <span>AI-Driven Resume Analysis & Matching</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Bridge the gap between your resume and your target job description.
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl mx-auto font-medium">
            AI Resume Copilot matches your background directly against any job posting, highlights skill shortages, refactors cover letters, and generates practice questions.
          </p>
        </div>

        {/* Form Panel Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* Step 1: Upload Card (Notion/Linear style) */}
          <div className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col justify-between border border-slate-900 bg-slate-900/10 backdrop-blur-md">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Step 01</span>
                  <h3 className="text-lg font-bold text-slate-100 mt-1">Upload Resume</h3>
                </div>
                <div className="h-7 w-7 rounded bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400 text-[10px] font-bold">
                  PDF
                </div>
              </div>

              {/* Drag Zone */}
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                className={`relative border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[200px] ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-950/20 shadow-[0_0_20px_rgba(99,102,241,0.05)]'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/30'
                }`}
              >
                <input
                  type="file"
                  id="resume-file-picker"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                <div className="flex flex-col items-center gap-4">
                  <div className="h-11 w-11 rounded-lg bg-slate-900 border border-slate-850 flex items-center justify-center text-slate-400">
                    {localFile ? <FileCode2 size={20} className="text-indigo-400" /> : <Upload size={20} />}
                  </div>
                  {localFile ? (
                    <div>
                      <p className="font-semibold text-slate-200 text-xs truncate max-w-[200px] mx-auto">
                        {localFile.name}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-0.5 font-mono">
                        {(localFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-slate-300 text-xs">Drag & drop your resume, or click to browse</p>
                      <p className="text-[10px] text-slate-500 font-medium">Supports PDF formats up to 5MB</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notification state */}
            <div className="mt-6 min-h-[48px] flex flex-col justify-end">
              {isLoading && !resume && (
                <div className="flex items-center gap-2 text-[11px] text-indigo-400 font-semibold animate-pulse bg-indigo-950/10 border border-indigo-900/20 px-3.5 py-2.5 rounded-xl">
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Processing document structure & extracting catalogued skills...</span>
                </div>
              )}

              {resume && successMessage && (
                <div className="p-3 bg-emerald-950/10 border border-emerald-900/30 rounded-xl flex items-center gap-2 text-emerald-400 text-xs font-medium">
                  <Check size={12} />
                  <span className="truncate">{successMessage}</span>
                </div>
              )}

              {!resume && !isLoading && (
                <p className="text-[11px] text-slate-500 font-medium text-center">
                  Attach your PDF to unlock matching and letters.
                </p>
              )}
            </div>
          </div>

          {/* Step 2: Job Description Card (Notion/Linear style) */}
          <div className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col justify-between border border-slate-900 bg-slate-900/10 backdrop-blur-md">
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Step 02</span>
                  <h3 className="text-lg font-bold text-slate-100 mt-1">Paste Job Description</h3>
                </div>
                <div className="h-7 w-7 rounded bg-indigo-950/40 border border-indigo-900/30 flex items-center justify-center text-indigo-400 text-[10px] font-bold">
                  TEXT
                </div>
              </div>

              <textarea
                value={jobText}
                onChange={(e) => {
                  clearNotifications();
                  setJobText(e.target.value);
                }}
                placeholder="Target Job Description requirements, coding stack, tools, responsibilities..."
                className="w-full h-[200px] bg-slate-950/50 border border-slate-850 rounded-xl p-4 text-xs text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-600/50 leading-relaxed resize-none transition-colors"
              />
            </div>

            {/* Action panel */}
            <div className="mt-6 flex flex-col gap-4">
              {error && (
                <div className="p-3 bg-red-950/10 border border-red-900/30 rounded-xl flex items-center gap-2 text-red-400 text-xs">
                  <AlertTriangle size={12} />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleStartAnalysis}
                disabled={!resume || !jobText.trim() || isLoading}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                  !resume || !jobText.trim() || isLoading
                    ? 'bg-slate-900/60 text-slate-600 border border-slate-850 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={12} className="animate-spin text-white" />
                    Calculating Compatibility Metrics...
                  </>
                ) : (
                  <>
                    Analyze Application
                    <ArrowRight size={12} />
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
