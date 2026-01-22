// app/guild/cryosleep/page.tsx
import React from 'react';
import { prisma } from '../../lib/prisma'; // Menggunakan relative path agar aman
import { Snowflake, Flame, Activity, ShieldCheck } from 'lucide-react';
import { toggleSummon } from '../../lib/actions'; // Menggunakan relative path agar aman

// Server Action Wrapper untuk tombol (biar bisa dipanggil di form tanpa Client Component full)
async function handleSummon(formData: FormData) {
  'use server';
  const id = formData.get('id') as string;
  const status = formData.get('status') as string;
  await toggleSummon(id, status);
}

// Opsi ini memastikan data selalu fresh saat halaman dibuka
export const dynamic = 'force-dynamic';

export default async function CryosleepPage() {
  // Ambil data project dari DB
  const projects = await prisma.project.findMany({
    orderBy: { status: 'desc' } // Yang 'summoned' (darurat) muncul duluan
  });

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-700 pb-10">
      
      {/* Header Dingin */}
      <div className="mb-10 relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950 to-blue-950 border border-cyan-500/30 p-8 shadow-2xl shadow-cyan-900/20">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 text-cyan-500/10 animate-pulse">
            <Snowflake size={150} />
        </div>
        <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <Snowflake className="text-cyan-400" /> Cryosleep Chamber
            </h2>
            <p className="text-cyan-200/70 mt-2 max-w-xl text-sm leading-relaxed">
                Passive income streams. Projects are currently in stasis (Maintenance Mode).
                <br/>
                <span className="text-cyan-400 font-bold">Protocol:</span> If a client summons, the ice breaks and Emergency Rates apply.
            </p>
        </div>
      </div>

      {/* Project Grid */}
      {projects.length === 0 ? (
          <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 text-slate-500">
              No projects in stasis. Finish more quests to unlock passive income.
          </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => {
                const isEmergency = project.status === 'summoned';

                return (
                    <div 
                        key={project.id} 
                        className={`relative rounded-xl border transition-all duration-500 overflow-hidden group ${
                            isEmergency 
                            ? 'bg-red-950/20 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.25)] scale-[1.02]' 
                            : 'bg-slate-900/60 border-cyan-900/30 hover:border-cyan-500/50 hover:bg-slate-900 hover:shadow-lg hover:shadow-cyan-900/10'
                        }`}
                    >
                        {/* Status Indicator Bar */}
                        <div className={`h-1 w-full ${isEmergency ? 'bg-gradient-to-r from-red-500 to-orange-500 animate-pulse' : 'bg-cyan-900/50'}`}></div>

                        <div className="p-6 relative z-20">
                            {/* Header Kartu */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className={`font-bold text-lg leading-tight ${isEmergency ? 'text-white' : 'text-slate-200'}`}>{project.name}</h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mt-1 font-bold">{project.clientId}</p>
                                </div>
                                {isEmergency ? (
                                    <div className="bg-red-500 text-black p-2 rounded-full animate-bounce shadow-lg shadow-red-500/50">
                                        <Flame size={20} fill="currentColor" />
                                    </div>
                                ) : (
                                    <div className="text-cyan-800 bg-cyan-950/30 p-2 rounded-lg border border-cyan-900/50">
                                        <ShieldCheck size={20} />
                                    </div>
                                )}
                            </div>

                            {/* Stats */}
                            <div className="space-y-3 mb-8 bg-black/20 p-4 rounded-lg border border-white/5">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 text-xs uppercase font-bold">System Status</span>
                                    <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide border ${
                                        isEmergency 
                                        ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' 
                                        : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                                    }`}>
                                        {isEmergency ? 'CRITICAL / SUMMONED' : 'STABLE / FROZEN'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500 text-xs uppercase font-bold">Current Rate</span>
                                    <span className={`font-mono text-lg ${isEmergency ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
                                        ${isEmergency ? project.emergencyRate : project.retainerFee}
                                        <span className="text-xs text-slate-600 font-normal ml-1">{isEmergency ? '/hr' : '/mo'}</span>
                                    </span>
                                </div>
                            </div>

                            {/* Action Button (Simulasi Summon Client) */}
                            <form action={handleSummon}>
                                <input type="hidden" name="id" value={project.id} />
                                <input type="hidden" name="status" value={project.status} />
                                
                                <button 
                                    type="submit"
                                    className={`w-full py-3 rounded-lg font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg ${
                                        isEmergency 
                                        ? 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700' 
                                        : 'bg-red-900/20 text-red-500 border border-red-900/50 hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-red-900/20'
                                    }`}
                                >
                                    {isEmergency ? (
                                        <>
                                            <ShieldCheck size={16} /> Resolve & Freeze
                                        </>
                                    ) : (
                                        <>
                                            <Activity size={16} /> Simulate Client Summon
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Frost Effect Overlay (Hanya kalau Frozen) */}
                        {!isEmergency && (
                            <div className="absolute bottom-0 right-0 pointer-events-none opacity-5">
                                <Snowflake size={120} className="text-cyan-500 transform translate-x-8 translate-y-8" />
                            </div>
                        )}
                        
                        {/* Heat Effect Overlay (Hanya kalau Emergency) */}
                        {isEmergency && (
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-red-900/10 to-transparent"></div>
                        )}
                    </div>
                );
            })}
        </div>
      )}
    </div>
  );
}