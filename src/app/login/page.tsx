'use client';

import React, { useActionState } from 'react';
import { authenticate } from './../lib/auth-actions';
import { signIn } from 'next-auth/react'; // Helper client-side untuk login sosial
import { Terminal, Lock, ArrowRight, Loader2, AlertCircle, Github } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  // Menggunakan useActionState untuk handle form submission & loading state
  // [state, action, isPending]
  const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor (Konsisten dengan Register) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in duration-500">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
            <span className="text-4xl">🐸</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Leap.io Identity</h1>
          <p className="text-slate-400 text-sm mt-2">Enter the gateway to the digital frontier.</p>
        </div>

        {/* --- GITHUB LOGIN BUTTON --- */}
        <button
          onClick={() => signIn('github', { callbackUrl: '/guild' })}
          className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2 mb-6 shadow-lg shadow-white/5"
        >
          <Github size={20} /> Sign in with GitHub
        </button>

        <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider"><span className="bg-slate-900 px-3 text-slate-500">Or continue with Email</span></div>
        </div>

        {/* --- MANUAL LOGIN FORM --- */}
        <form action={dispatch} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Agent ID (Email)</label>
            <div className="relative group">
              <Terminal className="absolute left-3 top-3 text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
              <input 
                type="email" 
                name="email"
                placeholder="agent@leap.io"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
              <input 
                type="password" 
                name="password"
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-slate-600"
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isPending}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-900/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isPending ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Authenticating...
                </>
              ) : (
                <>
                  Initialize Session <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-900/50 animate-in slide-in-from-top-2 fade-in">
              <AlertCircle size={16} />
              <p>{errorMessage}</p>
            </div>
          )}
        </form>

        {/* Footer Hint */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          Don't have an identity yet? <Link href="/register" className="text-green-400 hover:text-green-300 font-bold hover:underline transition-colors">Register Protocol</Link>
        </div>
      </div>
    </div>
  );
}