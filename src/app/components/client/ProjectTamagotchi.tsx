'use client';

import React, { useState, useEffect } from 'react';
import { Mic, Zap, AlertTriangle, Snowflake } from 'lucide-react';
import { FrogMascot } from '../../../../components/ui/FrogMascot';

type TamagotchiState = 'IDLE' | 'TYPING' | 'DANCING' | 'SLEEPING' | 'CRYOSLEEP' | 'COMBAT';

interface ProjectTamagotchiProps {
  status: 'AHEAD' | 'ON_TRACK' | 'DELAYED' | 'MAINTENANCE' | 'EMERGENCY';
  activeFreelancers?: number;
}

export const ProjectTamagotchi = ({ status, activeFreelancers = 0 }: ProjectTamagotchiProps) => {
  const [mode, setMode] = useState<TamagotchiState>('IDLE');
  const [isTalking, setIsTalking] = useState(false);
  const [showToast, setShowToast] = useState('');

  // Tentukan state visual berdasarkan status project
  useEffect(() => {
    if (status === 'MAINTENANCE') {
      setMode('CRYOSLEEP');
    } else if (status === 'EMERGENCY') {
      setMode('COMBAT');
    } else if (status === 'AHEAD') {
      setMode('DANCING');
    } else if (activeFreelancers > 0) {
      setMode('TYPING');
    } else {
      setMode('SLEEPING');
    }
  }, [status, activeFreelancers]);

  const handleMicHold = () => {
    setIsTalking(true);
    // Simulasi recording
  };

  const handleMicRelease = () => {
    setIsTalking(false);
    setShowToast('Reporting Bug...');
    setTimeout(() => {
        setShowToast('Quest Created!');
        setTimeout(() => setShowToast(''), 3000);
    }, 1500);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-4">
      {/* Toast Feedback */}
      {showToast && (
        <div className="bg-black/80 text-green-400 px-6 py-3 rounded-2xl border border-green-500/50 backdrop-blur-md animate-in slide-in-from-bottom-5 fade-in duration-300 font-mono">
           {'>'} {showToast}
        </div>
      )}

      <div className="relative group">
        {/* Status Bubble */}
        <div className="absolute -top-12 right-0 bg-white text-black px-4 py-1 rounded-full text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
          Status: {mode}
        </div>

        {/* --- MAIN AVATAR CONTAINER --- */}
        <div className={`
          relative w-32 h-32 md:w-40 md:h-40 rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer
          ${mode === 'CRYOSLEEP' ? 'bg-cyan-900/40 border-4 border-cyan-400/30 shadow-[0_0_50px_rgba(34,211,238,0.2)]' : ''}
          ${mode === 'COMBAT' ? 'bg-red-900/40 border-4 border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.4)] scale-110' : ''}
          ${mode === 'DANCING' ? 'bg-green-500/20 border-4 border-green-400 animate-bounce-slow' : 'bg-slate-900/80 border border-slate-700'}
        `}>
          
          {/* Visual Effects */}
          {mode === 'CRYOSLEEP' && (
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-30 rounded-full pointer-events-none"></div>
          )}
          
          {/* THE FROG */}
          <div className={`w-20 h-20 transition-all duration-500 ${mode === 'CRYOSLEEP' ? 'opacity-50 grayscale blur-[1px]' : ''}`}>
             {/* Wrapped in div to handle className animation since FrogMascot might not accept className prop directly */}
             <div className={mode === 'DANCING' ? 'animate-spin-slow' : ''}>
                <FrogMascot />
             </div>
          </div>

          {/* Cryosleep Frost Overlay */}
          {mode === 'CRYOSLEEP' && (
            <div className="absolute inset-0 flex items-center justify-center text-cyan-200 opacity-60">
              <Snowflake size={48} className="animate-pulse" />
            </div>
          )}

          {/* Combat Particles */}
          {mode === 'COMBAT' && (
            <div className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full animate-ping">
              <AlertTriangle size={16} />
            </div>
          )}

        </div>

        {/* --- VOICE INTERACTION (Hidden in Cryosleep) --- */}
        {mode !== 'CRYOSLEEP' && (
           <button
             onMouseDown={handleMicHold}
             onMouseUp={handleMicRelease}
             onTouchStart={handleMicHold}
             onTouchEnd={handleMicRelease}
             className={`
               absolute bottom-0 -left-6 w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all
               ${isTalking ? 'bg-red-500 scale-125 ring-4 ring-red-500/30' : 'bg-slate-800 hover:bg-slate-700'}
             `}
           >
             <Mic size={20} className={isTalking ? 'animate-pulse' : ''} />
           </button>
        )}
      </div>
    </div>
  );
};