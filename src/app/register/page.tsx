'use client';

import React, { useActionState } from 'react';
import { registerUser } from './../lib/register-action';
import { Terminal, Lock, ArrowRight, Loader2, AlertCircle, User, Mail, Building, Rocket } from 'lucide-react';
import Link from 'next/link';

export default function RegisterPage() {
  // Menggunakan useActionState untuk handle form submission & loading state
  const [state, action, isPending] = useActionState(registerUser, undefined);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Decor (Konsisten dengan Login) */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 animate-in fade-in zoom-in duration-500 my-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
            <Rocket className="text-green-500 w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Initialize Protocol</h1>
          <p className="text-slate-400 text-sm mt-2">Establish your digital identity on Leap.io.</p>
        </div>

        {/* Form */}
        <form action={action} className="space-y-4">
          
          {/* Global Error Message */}
          {state?.message && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-950/30 p-3 rounded-lg border border-red-900/50 animate-in slide-in-from-top-2 fade-in">
              <AlertCircle size={16} />
              <p>{state.message}</p>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-3 top-3 text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
              <input 
                name="name"
                type="text" 
                placeholder="John Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-slate-600"
              />
            </div>
            {state?.errors?.name && <p className="text-[10px] text-red-400 mt-1 ml-1">{state.errors.name[0]}</p>}
          </div>

          {/* Codename / Username */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Codename</label>
            <div className="relative group">
              <Terminal className="absolute left-3 top-3 text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
              <input 
                name="username"
                type="text" 
                placeholder="neo_corp"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-slate-600"
              />
            </div>
            {state?.errors?.username && <p className="text-[10px] text-red-400 mt-1 ml-1">{state.errors.username[0]}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-3 text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
              <input 
                name="email"
                type="email" 
                placeholder="agent@leap.io"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-slate-600"
              />
            </div>
            {state?.errors?.email && <p className="text-[10px] text-red-400 mt-1 ml-1">{state.errors.email[0]}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-3 top-3 text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
              <input 
                name="password"
                type="password" 
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all placeholder:text-slate-600"
              />
            </div>
            {state?.errors?.password && <p className="text-[10px] text-red-400 mt-1 ml-1">{state.errors.password[0]}</p>}
          </div>

          {/* Company (Optional) */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5 ml-1">Company (Optional)</label>
            <div className="relative group">
              <Building className="absolute left-3 top-3 text-slate-500 group-focus-within:text-green-500 transition-colors" size={18} />
              <input 
                name="company"
                type="text" 
                placeholder="Corp Name"
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
                  <Loader2 className="animate-spin" size={20} /> initializing...
                </>
              ) : (
                <>
                  Initialize Sequence <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Footer Hint */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-sm text-slate-500">
          Already have an identity? <Link href="/login" className="text-green-400 hover:text-green-300 font-bold hover:underline transition-colors">Access Terminal</Link>
        </div>
      </div>
    </div>
  );
}