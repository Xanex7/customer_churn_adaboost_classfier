import React from 'react';
import Predict from './pages/Predict';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col relative bg-slate-950 text-slate-100">
      <Toaster position="top-right" />
      
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-sky-500 rounded-lg flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-sky-500/30">A</div>
          <span className="font-mono text-lg font-extrabold tracking-wider">APEXCHURN <span className="text-sky-400">AI</span></span>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <Predict />
      </main>
    </div>
  );
}
