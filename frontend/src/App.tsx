import React from 'react';
import { Home } from './pages/Home';
import { Results } from './pages/Results';
import { Sparkles, Terminal, BookOpen, RefreshCw } from 'lucide-react';
import { useStore } from './store/useStore';

function App() {
  const { activeView, resetStore } = useStore();

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Header bar */}
      <header className="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={resetStore}>
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-white">
              copilot.io
            </span>
            <span className="text-[9px] text-slate-500 block -mt-0.5">
              AI Resume Assistant
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1 font-medium"
          >
            <Terminal size={14} />
            Documentation
          </a>
          <button
            onClick={resetStore}
            className="text-xs bg-slate-900 hover:bg-slate-850 text-indigo-400 hover:text-indigo-300 font-bold py-1.5 px-3 rounded-lg border border-slate-850 transition-all flex items-center gap-1.5"
          >
            <BookOpen size={13} />
            Reset Application
          </button>
        </div>
      </header>

      {/* Main dashboard navigation */}
      <main className="flex-grow flex flex-col">
        {activeView === 'home' ? <Home /> : <Results />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-950 bg-[#02050a] py-6 px-6 text-center text-[10px] tracking-wider uppercase text-slate-600 font-semibold">
        AI Resume & Interview Copilot — Built for Portfolio & Interview Showcases
      </footer>
    </div>
  );
}

export default App;

