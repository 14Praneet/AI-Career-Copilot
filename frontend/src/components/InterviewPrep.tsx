import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, AlertTriangle } from 'lucide-react';

export const InterviewPrep: React.FC = () => {
  const { generateInterviewQuestions, interviews, resume, isLoading, error } = useStore();
  const [jobText, setJobText] = useState('');
  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);

  const handleGenerateQuestions = async () => {
    if (jobText.trim()) {
      await generateInterviewQuestions(jobText);
    }
  };

  if (!resume) {
    return (
      <div className="glass-panel p-8 rounded-2xl max-w-2xl mx-auto my-6 text-center">
        <AlertTriangle className="text-yellow-500 mx-auto mb-3" size={40} />
        <h3 className="text-xl font-bold mb-1">No Resume Uploaded</h3>
        <p className="text-slate-400 text-sm">Please upload and parse your resume before generating questions.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto my-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Input Form */}
      <div className="glass-panel p-6 rounded-2xl md:col-span-1 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-indigo-400 flex items-center gap-2">
          <MessageSquare size={20} />
          Interview Prep Setup
        </h3>
        <p className="text-xs text-slate-400">
          We will customize questions analyzing gaps between your resume and the target description.
        </p>
        <textarea
          value={jobText}
          onChange={(e) => setJobText(e.target.value)}
          placeholder="Paste Job Description here..."
          className="w-full flex-grow h-60 bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-200"
        />
        <button
          onClick={handleGenerateQuestions}
          disabled={!jobText.trim() || isLoading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded-lg transition-all"
        >
          {isLoading ? 'Generating Questions...' : 'Generate Practice Qs'}
        </button>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      {/* Questions list */}
      <div className="glass-panel p-6 rounded-2xl md:col-span-2">
        {interviews ? (
          <div>
            <h3 className="text-xl font-bold mb-1">Practice Questions</h3>
            <p className="text-xs text-slate-400 mb-6">Click on a question to expand suggested answers and tips.</p>

            <div className="flex flex-col gap-3">
              {interviews.questions.map((item, index) => {
                const isOpen = activeQuestion === index;
                return (
                  <div key={index} className="border border-slate-800 rounded-lg bg-slate-900/30 overflow-hidden">
                    <button
                      onClick={() => setActiveQuestion(isOpen ? null : index)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="bg-indigo-950/50 text-indigo-400 text-xs px-2 py-0.5 rounded border border-indigo-900/40 font-semibold mt-0.5">
                          {item.category}
                        </span>
                        <p className="text-sm font-medium text-slate-200">{item.question}</p>
                      </div>
                      {isOpen ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </button>
                    
                    {isOpen && (
                      <div className="p-4 bg-slate-950/40 border-t border-slate-800 text-xs text-slate-400 flex flex-col gap-3">
                        <div>
                          <p className="font-semibold text-slate-300 mb-1">Expected Answer Elements:</p>
                          <p>{item.expected_answer}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500">
            <HelpCircle size={40} className="mb-2" />
            <p className="text-sm">Provide job context and generate questions to practice.</p>
          </div>
        )}
      </div>
    </div>
  );
};
