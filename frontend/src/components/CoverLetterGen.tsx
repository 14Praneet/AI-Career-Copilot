import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { FileText, Copy, Check, RefreshCw, AlertTriangle } from 'lucide-react';

export const CoverLetterGen: React.FC = () => {
  const { generateCoverLetter, coverLetter, resume, isLoading, error } = useStore();
  const [jobText, setJobText] = useState('');
  const [tone, setTone] = useState('professional');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (jobText.trim()) {
      await generateCoverLetter(jobText, tone);
    }
  };

  const handleCopy = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!resume) {
    return (
      <div className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto my-6 text-center">
        <AlertTriangle className="text-yellow-500 mx-auto mb-3" size={40} />
        <h3 className="text-xl font-bold mb-1">No Resume Uploaded</h3>
        <p className="text-slate-400 text-sm">Please upload and parse your resume before generating cover letters.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Parameters Panel */}
      <div className="glass-panel p-6 rounded-2xl md:col-span-1 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
          <FileText size={20} />
          Cover Letter Setup
        </h3>
        
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">TONE SELECTOR</label>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            <option value="professional">Professional / Corporate</option>
            <option value="enthusiastic">Enthusiastic / Culture-focused</option>
            <option value="confident">Confident / Bold Achievements</option>
            <option value="minimalist">Direct / Short & Sweet</option>
          </select>
        </div>

        <div className="flex-grow flex flex-col gap-1.5">
          <label className="block text-xs font-semibold text-slate-400">JOB DESCRIPTION</label>
          <textarea
            value={jobText}
            onChange={(e) => setJobText(e.target.value)}
            placeholder="Paste Job Description here..."
            className="w-full flex-grow h-44 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={!jobText.trim() || isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {isLoading && <RefreshCw size={16} className="animate-spin" />}
          {isLoading ? 'Drafting Letter...' : 'Draft Cover Letter'}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Editor Panel */}
      <div className="glass-panel p-6 rounded-2xl md:col-span-2 flex flex-col min-h-[450px]">
        {coverLetter ? (
          <div className="flex flex-col h-full flex-grow">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div>
                <h4 className="font-bold text-slate-200">Generated Cover Letter</h4>
                <p className="text-xs text-slate-400 capitalize">Tone: {coverLetter.tone}</p>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 font-semibold py-1.5 px-3 rounded-lg border border-slate-700 transition-colors"
              >
                {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
            </div>

            <textarea
              readOnly
              value={coverLetter.content}
              className="w-full flex-grow bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-300 leading-relaxed focus:outline-none resize-none h-96"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full flex-grow text-slate-500">
            <FileText size={40} className="mb-2" />
            <p className="text-sm">Supply job details on the left side to compile a draft letter.</p>
          </div>
        )}
      </div>
    </div>
  );
};
