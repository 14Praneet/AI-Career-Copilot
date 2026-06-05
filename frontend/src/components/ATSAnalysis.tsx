import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { SearchCode, ThumbsUp, ThumbsDown, CheckCircle, Lightbulb, AlertTriangle } from 'lucide-react';

export const ATSAnalysis: React.FC = () => {
  const { runAnalysis, analysis, resume, isLoading, error } = useStore();
  const [jobText, setJobText] = useState('');

  const handleRunAnalysis = async () => {
    if (jobText.trim()) {
      await runAnalysis(jobText);
    }
  };

  if (!resume) {
    return (
      <div className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto my-6 text-center">
        <AlertTriangle className="text-yellow-500 mx-auto mb-3" size={40} />
        <h3 className="text-xl font-bold mb-1">No Resume Uploaded</h3>
        <p className="text-slate-400 text-sm">Please upload and parse your resume before running an ATS matching analysis.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Input panel */}
      <div className="glass-panel p-6 rounded-2xl md:col-span-1 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
          <SearchCode size={20} />
          Job Description
        </h3>
        <p className="text-xs text-slate-400">
          Paste the target Job Description to compare the keywords and check alignment scores.
        </p>
        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Paste Job Description here..."
          className="w-full flex-grow h-60 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
        />
        <button
          onClick={handleRunAnalysis}
          disabled={!jobText.trim() || isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          {isLoading ? 'Analyzing...' : 'Run ATS Match'}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Results panel */}
      <div className="glass-panel p-6 rounded-2xl md:col-span-2">
        {analysis ? (
          <div className="flex flex-col gap-6">
            {/* Score Ring / Block */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-2xl font-bold">ATS Alignment Report</h3>
                <p className="text-xs text-slate-400">Generated matches against parsed data</p>
              </div>
              <div className="flex items-center justify-center h-20 w-20 rounded-full border-4 border-indigo-500 bg-indigo-950/20 text-center">
                <span className="text-2xl font-bold text-indigo-300">{analysis.ats_score}%</span>
              </div>
            </div>

            {/* Breakdown */}
            <div>
              <h4 className="font-semibold text-slate-300 mb-2">Analysis Breakdown</h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-400">Semantic Match</p>
                  <p className="font-bold text-indigo-400">{analysis.breakdown.semantic_match}%</p>
                </div>
                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-400">Hard Skills</p>
                  <p className="font-bold text-emerald-400">{analysis.breakdown.hard_skills_match}%</p>
                </div>
                <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-800">
                  <p className="text-xs text-slate-400">Structure</p>
                  <p className="font-bold text-purple-400">{analysis.breakdown.structural_score}%</p>
                </div>
              </div>
            </div>

            {/* Skills lists */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5 text-sm">
                  <CheckCircle size={16} className="text-emerald-500" />
                  Matched Skills
                </h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.matched_skills.map((skill, i) => (
                    <span key={i} className="text-xs bg-emerald-950/30 text-emerald-400 px-2 py-0.5 rounded border border-emerald-900">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1.5 text-sm">
                  <AlertTriangle size={16} className="text-red-500" />
                  Missing Skills
                </h4>
                <div className="flex flex-wrap gap-1">
                  {analysis.missing_skills.map((skill, i) => (
                    <span key={i} className="text-xs bg-red-950/30 text-red-400 px-2 py-0.5 rounded border border-red-900">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-4">
              <div>
                <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1 text-sm">
                  <ThumbsUp size={16} className="text-indigo-400" />
                  Strengths
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-400 flex flex-col gap-1">
                  {analysis.strengths.map((str, i) => (
                    <li key={i}>{str}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-slate-300 mb-2 flex items-center gap-1 text-sm">
                  <ThumbsDown size={16} className="text-pink-400" />
                  Weaknesses
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-400 flex flex-col gap-1">
                  {analysis.weaknesses.map((weak, i) => (
                    <li key={i}>{weak}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-indigo-950/10 border border-indigo-900/30 p-4 rounded-xl">
              <h4 className="font-semibold text-indigo-300 mb-2 flex items-center gap-1 text-sm">
                <Lightbulb size={16} />
                Actionable Recommendations
              </h4>
              <ul className="list-decimal list-inside text-xs text-slate-400 flex flex-col gap-1.5">
                {analysis.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500">
            <SearchCode size={40} className="mb-2" />
            <p className="text-sm">Paste a job description and trigger matching to see results here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
