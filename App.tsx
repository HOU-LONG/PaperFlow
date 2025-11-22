import React, { useState } from 'react';
import { AnalyzedPaper, LanguageMode, ProcessingStatus } from './types';
import { analyzePaper } from './services/geminiService';
import GlassCard from './components/GlassCard';
import { generateHtmlReport } from './utils/exportUtils';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<AnalyzedPaper[]>([]);
  const [language, setLanguage] = useState<LanguageMode>('en');
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [progress, setProgress] = useState<string>('');

  // File Upload Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Batch Processing Logic
  const startProcessing = async () => {
    // STRICT: API Key must come from process.env.API_KEY
    const apiKey = process.env.API_KEY;
    
    if (!apiKey) {
        console.error("API_KEY is missing from environment variables.");
        alert("System Error: API Key is missing from environment configuration.");
        return;
    }

    if (files.length === 0) return;
    
    setStatus(ProcessingStatus.ANALYZING);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgress(`Analyzing ${i + 1}/${files.length}: ${file.name}...`);
      
      try {
        const result = await analyzePaper(file, apiKey);
        setResults(prev => [...prev, result]); // Update incrementally
      } catch (err) {
        console.error(`Failed to process ${file.name}`, err);
        // Continue to next file even if one fails, but maybe show a toast in a real app
      }
    }
    
    setStatus(ProcessingStatus.COMPLETE);
    setProgress('Batch Processing Complete.');
  };

  // Export Handler
  const handleExport = () => {
    generateHtmlReport(results, language);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header / Nav */}
      <div className="sticky top-0 z-40 glass-panel border-b border-white/50 px-6 py-4 mb-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
               PF
             </div>
             <div>
               <h1 className="text-xl font-bold text-slate-800 tracking-tight">PaperFlow</h1>
               <p className="text-xs text-slate-500 font-medium">Bilingual Knowledge Base</p>
             </div>
          </div>

          <div className="flex items-center gap-4">
             {/* Language Toggle */}
             <div className="glass-chip p-1 flex rounded-full bg-white/40">
                <button 
                  onClick={() => setLanguage('en')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'en' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  English
                </button>
                <button 
                  onClick={() => setLanguage('zh')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${language === 'zh' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  中文
                </button>
             </div>
             
             {/* Export Button */}
             {results.length > 0 && (
               <button 
                  onClick={handleExport}
                  className="px-5 py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg hover:bg-slate-700 transition-all hover:scale-105 active:scale-95"
               >
                 Export HTML
               </button>
             )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6">
        
        {/* Upload Zone */}
        <div className="glass-panel p-8 rounded-3xl text-center mb-12 transition-all hover:shadow-2xl border-dashed border-2 border-blue-200/50 bg-gradient-to-b from-white/40 to-white/10 group">
          <h2 className="text-2xl font-light text-slate-700 mb-4 group-hover:text-blue-600 transition-colors">
            Add Research Papers
          </h2>
          <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto leading-relaxed">
            Drag & Drop multiple PDFs here. The AI will extract architecture, meta-data, and generate a bilingual report automatically.
          </p>
          
          <div className="flex flex-col items-center gap-4">
             <input 
                type="file" 
                multiple 
                accept="application/pdf"
                onChange={handleFileChange}
                className="block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer max-w-xs mx-auto
                "
              />
              
              {/* File List Preview (Simple) */}
              {files.length > 0 && status === ProcessingStatus.IDLE && (
                  <div className="mt-2 text-xs text-slate-400">
                      {files.length} files selected
                  </div>
              )}

              {files.length > 0 && status !== ProcessingStatus.ANALYZING && (
                <button
                  onClick={startProcessing}
                  className="mt-4 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Start Batch Analysis
                </button>
              )}
          </div>

          {status === ProcessingStatus.ANALYZING && (
             <div className="mt-8">
                <div className="w-full max-w-xs mx-auto h-1.5 bg-slate-200 rounded-full overflow-hidden">
                   <div className="h-full bg-blue-500 animate-pulse w-2/3 rounded-full"></div>
                </div>
                <p className="text-xs text-slate-400 mt-3 font-medium animate-pulse">{progress}</p>
             </div>
          )}
        </div>

        {/* Results Feed */}
        <div className="space-y-8">
           {results.map((paper) => (
             <GlassCard key={paper.id} data={paper} language={language} />
           ))}
           
           {results.length === 0 && status === ProcessingStatus.COMPLETE && (
             <div className="text-center text-slate-400 py-10">
               No results generated. Please try again with valid PDFs.
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default App;