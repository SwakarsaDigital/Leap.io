'use client';

import React, { useState } from 'react';
import { User, Shield, Zap, ShoppingCart } from 'lucide-react';

export default function DraftingBoard() {
  const [budget, setBudget] = useState(2500);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 md:p-12 relative">
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-16">
            <div>
                <h1 className="text-3xl font-black uppercase tracking-tight">Draft Your Squad</h1>
                <p className="text-slate-400">Drag cards to fill the slots.</p>
            </div>
            
            {/* Billing Calculator */}
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl text-right">
                <span className="text-xs text-slate-500 font-bold uppercase">Estimated Monthly Burn</span>
                <div className="text-4xl font-mono font-bold text-green-400 mt-1">
                    ${budget.toLocaleString()}
                </div>
            </div>
        </div>

        {/* --- SLOT ARENA (THE TABLE) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            
            {/* Slot 1: Captain */}
            <div className="border-2 border-dashed border-yellow-500/30 bg-yellow-900/10 rounded-3xl h-[400px] flex flex-col items-center justify-center relative group hover:bg-yellow-900/20 transition-all">
                <Shield size={48} className="text-yellow-600 mb-4 opacity-50" />
                <h3 className="text-yellow-500 font-bold uppercase tracking-widest">Captain Slot</h3>
                <p className="text-xs text-yellow-500/50 mt-2">REQUIRED</p>
            </div>

            {/* Slot 2: Frontend */}
            <div className="border-2 border-dashed border-blue-500/30 bg-blue-900/10 rounded-3xl h-[400px] flex flex-col items-center justify-center relative group hover:bg-blue-900/20 transition-all">
                <User size={48} className="text-blue-600 mb-4 opacity-50" />
                <h3 className="text-blue-500 font-bold uppercase tracking-widest">Frontend Slot</h3>
                <p className="text-xs text-blue-500/50 mt-2">REQUIRED</p>
            </div>

            {/* Slot 3: Backend */}
            <div className="border-2 border-dashed border-green-500/30 bg-green-900/10 rounded-3xl h-[400px] flex flex-col items-center justify-center relative group hover:bg-green-900/20 transition-all">
                <Zap size={48} className="text-green-600 mb-4 opacity-50" />
                <h3 className="text-green-500 font-bold uppercase tracking-widest">Backend Slot</h3>
                <p className="text-xs text-green-500/50 mt-2">OPTIONAL</p>
            </div>
        </div>

        {/* --- DECK (AVAILABLE FREELANCERS) --- */}
        <div className="fixed bottom-0 left-0 w-full bg-slate-900/90 backdrop-blur-xl border-t border-white/10 p-6 overflow-x-auto">
            <div className="max-w-6xl mx-auto">
                <p className="text-xs font-bold text-slate-500 uppercase mb-4">Available Agents (Drag to Slot)</p>
                <div className="flex gap-4 min-w-max">
                    {/* Card 1 */}
                    <div className="w-48 bg-slate-800 border border-slate-700 p-4 rounded-xl hover:-translate-y-2 transition-transform cursor-grab active:cursor-grabbing">
                        <div className="flex justify-between items-start mb-2">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs font-mono text-green-400">$60/hr</span>
                        </div>
                        <h4 className="font-bold text-sm">Alex (Lvl 45)</h4>
                        <p className="text-xs text-slate-400">React Specialist</p>
                    </div>

                     {/* Card 2 */}
                     <div className="w-48 bg-slate-800 border border-slate-700 p-4 rounded-xl hover:-translate-y-2 transition-transform cursor-grab active:cursor-grabbing">
                        <div className="flex justify-between items-start mb-2">
                            <div className="w-8 h-8 bg-purple-500 rounded-full"></div>
                            <span className="text-xs font-mono text-green-400">$85/hr</span>
                        </div>
                        <h4 className="font-bold text-sm">Sarah (Lvl 60)</h4>
                        <p className="text-xs text-slate-400">Fullstack Arch</p>
                    </div>
                </div>
            </div>
            
            <button className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-400 text-black font-bold py-4 px-8 rounded-full shadow-xl flex items-center gap-2">
                Deploy Team <ShoppingCart size={20}/>
            </button>
        </div>

      </div>
    </div>
  );
}