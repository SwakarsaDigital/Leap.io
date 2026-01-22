// app/lab/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Brain, Zap, FlaskConical, Terminal, Copy, Check, Sparkles } from 'lucide-react';

export default function LabPage() {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [output, setOutput] = useState('');
  const [loadingStep, setLoadingStep] = useState('');
  const outputEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll ke bawah saat output bertambah
  useEffect(() => {
    outputEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleGenerate = () => {
    if (!prompt) return;
    setIsProcessing(true);
    setOutput(''); // Reset output
    
    // 1. Simulasi "Thinking" Steps
    const steps = ['Analyzing Directive...', 'Accessing Pattern Library...', 'Validating Architecture...', 'Drafting Blueprint...'];
    let stepIndex = 0;

    const stepInterval = setInterval(() => {
        if (stepIndex < steps.length) {
            setLoadingStep(steps[stepIndex]);
            stepIndex++;
        } else {
            clearInterval(stepInterval);
            startTypingResponse();
        }
    }, 800); // Ganti step setiap 800ms
  };

  const startTypingResponse = () => {
    setLoadingStep('');
    // Mock Response yang kompleks
    const fullResponse = `// LEAP.IO ARCHITECTURE ANALYSIS v1.0
// ----------------------------------------
// STATUS: OPTIMIZED
// SCORE: 98/100

/**
 * MODULE: ${prompt.slice(0, 20).toUpperCase()}...
 * RECOMMENDATION: Use Server Actions for mutation.
 */

interface Blueprint {
  database: 'PostgreSQL' | 'Supabase';
  auth: 'NextAuth v5';
  styling: 'Tailwind CSS';
}

const executionPlan = {
  step1: "Define Zod Schema for input validation",
  step2: "Create Server Action in /actions folder",
  step3: "Implement Optimistic UI for instant feedback",
  security: "Rate Limiting applied via Middleware"
};

// ADVICE:
// Don't forget to handle hydration errors when using
// browser-specific APIs like 'window' or 'localStorage'.
// Use 'useEffect' or dynamic imports.

return "Ready to Code.";`;

    let i = 0;
    const typeInterval = setInterval(() => {
        if (i < fullResponse.length) {
            setOutput((prev) => prev + fullResponse.charAt(i));
            i++;
        } else {
            clearInterval(typeInterval);
            setIsProcessing(false);
        }
    }, 15); // Kecepatan mengetik
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <FlaskConical className="text-green-500" /> The Lab
        </h2>
        <p className="text-slate-400 mt-1">Draft architectures, validate logic, and consult the AI Brain.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        
        {/* LEFT COLUMN: Input Area */}
        <div className="flex flex-col gap-4 h-full">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex-1 flex flex-col shadow-xl">
            <div className="bg-slate-950/50 p-3 rounded-t-lg border-b border-slate-800 flex justify-between items-center">
                <span className="text-xs font-mono text-slate-500 uppercase">Input Directive</span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">Markdown Supported</span>
            </div>
            
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isProcessing}
              className="flex-1 bg-slate-900 rounded-b-lg p-5 text-slate-200 focus:outline-none resize-none placeholder:text-slate-600 font-mono text-sm leading-relaxed"
              placeholder="// Describe the feature you want to build...&#10;Example: I need a secure authentication flow using NextAuth v5 with role-based access control."
            ></textarea>
            
            <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-900 rounded-b-lg">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Sparkles size={14} className="text-yellow-500" />
                  <span>AI Model: Leap-v1 (Simulated)</span>
              </div>
              <button 
                onClick={handleGenerate}
                disabled={isProcessing || !prompt}
                className="bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-green-900/20 group"
              >
                {isProcessing ? <Zap className="animate-pulse" size={16} /> : <Brain size={16} className="group-hover:scale-110 transition-transform" />}
                {isProcessing ? 'Processing...' : 'Run Simulation'}
              </button>
            </div>
          </div>
          
          {/* Quick Prompts (Optional) */}
          <div className="flex gap-2 overflow-x-auto pb-2">
              {['Generate Prisma Schema', 'Refactor Component', 'Debug API Route'].map(txt => (
                  <button key={txt} onClick={() => setPrompt(txt)} className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700 transition-colors whitespace-nowrap">
                      {txt}
                  </button>
              ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Terminal Output */}
        <div className="bg-black border border-slate-800 rounded-xl font-mono text-sm relative overflow-hidden flex flex-col shadow-2xl h-full">
          {/* Terminal Header */}
          <div className="h-10 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between px-4 backdrop-blur-sm">
            <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                </div>
                <span className="ml-3 text-xs text-slate-400 font-medium flex items-center gap-2">
                    <Terminal size={12} /> terminal_output
                </span>
            </div>
            {output && !isProcessing && (
                <button className="text-slate-500 hover:text-white transition-colors" title="Copy Output">
                    <Copy size={14} />
                </button>
            )}
          </div>
          
          {/* Terminal Body */}
          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-950/50">
            {!output && !isProcessing && (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-3">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                    <FlaskConical size={32} className="opacity-50" />
                </div>
                <p className="text-xs uppercase tracking-widest font-semibold">Ready for Input</p>
              </div>
            )}
            
            {/* Loading Steps */}
            {isProcessing && loadingStep && (
               <div className="flex flex-col items-center justify-center h-full gap-4">
                 <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-t-2 border-green-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-2 border-r-2 border-blue-500 rounded-full animate-spin reverse"></div>
                 </div>
                 <div className="text-green-400 font-mono text-xs animate-pulse">
                    {'>'} {loadingStep}
                 </div>
               </div>
            )}

            {/* Output Text */}
            {output && (
              <div className="text-green-400/90 whitespace-pre-wrap leading-relaxed">
                {output}
                {/* Cursor Blinking */}
                <span className="inline-block w-2 h-4 bg-green-500 ml-1 animate-pulse align-middle"></span>
              </div>
            )}
            <div ref={outputEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}