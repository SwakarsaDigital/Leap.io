import React from 'react';
import { prisma } from '../../../app/lib/prisma';
import { Users, Shield } from 'lucide-react';

export default async function CaptainRosterPage() {
  const freelancers = await prisma.user.findMany({
    where: { role: 'freelancer' },
    orderBy: { level: 'desc' }
  });

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <Users className="text-red-500" size={24} />
                </div>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Squad Roster</h1>
            </div>
            <p className="text-slate-500 mt-2 text-sm font-mono ml-14">ACTIVE AGENTS DATABASE // AUTHORIZED VIEW</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freelancers.map(agent => (
                <div key={agent.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4 hover:border-red-500/30 transition-all group">
                    <div className="w-16 h-16 bg-slate-950 rounded-xl flex items-center justify-center text-2xl font-bold text-slate-500 group-hover:text-white transition-colors border border-slate-800">
                        {agent.name?.[0] || 'A'}
                    </div>
                    <div>
                        <h3 className="font-bold text-white">{agent.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-mono text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20">LVL {agent.level}</span>
                            <span className="text-xs text-green-500 font-bold uppercase">{agent.role}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}