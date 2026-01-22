// app/captain/page.tsx
import React from 'react';
import Link from 'next/link';
import { prisma } from '../lib/prisma';
import { Check, X, Github, Video, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react';
import { reviewQuest } from '.././lib/actions';

// Fetch quest yang butuh review
async function getPendingQuests() {
  return await prisma.quest.findMany({
    where: { status: 'loot_drop' },
    include: { assignedTo: true } // Ambil info siapa yang mengerjakan
  });
}

export default async function CaptainPage() {
  const pendingQuests = await getPendingQuests();

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
      
      {/* Header Updated with Shield Link */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 bg-red-950/20 p-6 rounded-2xl border border-red-900/30">
        <div className="flex items-center gap-4">
            <div className="bg-red-500/10 p-3 rounded-full border border-red-500/20">
                <ShieldAlert className="text-red-500" size={32} />
            </div>
            <div>
                <h2 className="text-3xl font-bold text-white">Captain's Bridge</h2>
                <p className="text-slate-400 text-sm">Validate code quality. Use the <span className="text-red-400 font-bold">Refactor Hammer</span> wisely.</p>
            </div>
        </div>
        
        {/* Tombol Menuju Client Shield */}
        <Link 
            href="/captain/shield" 
            className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl border border-slate-700 transition-all shadow-lg group w-full md:w-auto"
        >
            <div className="bg-green-500/20 p-2 rounded-lg group-hover:bg-green-500/30 transition-colors border border-green-500/30">
                <ShieldCheck size={20} className="text-green-500" />
            </div>
            <div className="text-left flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-tight">Secure Channel</span>
                <span className="text-sm font-bold text-slate-200 group-hover:text-white leading-tight">Open Client Shield</span>
            </div>
        </Link>
      </div>

      {/* Pending Review List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Incoming Transmissions <span className="bg-slate-800 text-sm px-2 py-0.5 rounded-full border border-slate-700">{pendingQuests.length}</span>
        </h3>

        {pendingQuests.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/50 rounded-xl border border-dashed border-slate-800 flex flex-col items-center gap-3">
                <div className="bg-slate-800/50 p-4 rounded-full">
                    <Check size={32} className="text-slate-600" />
                </div>
                <p className="text-slate-500 font-medium">All quiet on the bridge. No pending reviews.</p>
            </div>
        ) : (
            pendingQuests.map((quest) => (
                <ReviewCard key={quest.id} quest={quest} />
            ))
        )}
      </div>
    </div>
  );
}

// Client Component kecil untuk interaksi Approve/Reject
// (Kita buat inline di sini biar praktis, di project besar sebaiknya dipisah ke components/captain/ReviewCard.tsx)
function ReviewCard({ quest }: { quest: any }) {
  
  // Server Action Wrapper
  async function handleReview(formData: FormData) {
    'use server';
    const decision = formData.get('decision') as 'approve' | 'reject';
    const questId = formData.get('questId') as string;
    const userId = formData.get('userId') as string;
    const reward = Number(formData.get('reward'));

    await reviewQuest(questId, decision, userId, reward);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg hover:border-slate-700 transition-all group">
        {/* Card Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
            <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        quest.difficulty === 'hard' ? 'bg-red-950/30 text-red-400 border-red-900/30' : 
                        quest.difficulty === 'medium' ? 'bg-yellow-950/30 text-yellow-400 border-yellow-900/30' : 
                        'bg-blue-950/30 text-blue-400 border-blue-900/30'
                    }`}>
                        {quest.difficulty}
                    </span>
                    <span className="text-slate-500 text-xs flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                        Submitted by <span className="text-slate-300 font-medium">{quest.assignedTo?.name || 'Unknown Agent'}</span>
                    </span>
                </div>
                <h4 className="text-xl font-bold text-white tracking-tight">{quest.title}</h4>
            </div>
            <div className="text-right">
                <span className="text-2xl font-black text-green-500 tracking-tighter">+{quest.reward} XP</span>
            </div>
        </div>

        {/* Evidence Links */}
        <div className="p-6 bg-slate-950/30 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a href={quest.commitLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:border-slate-700 transition-all group/link">
                <div className="bg-slate-800 p-2 rounded-md group-hover/link:bg-slate-700 transition-colors">
                    <Github size={18} className="text-slate-400 group-hover/link:text-white" />
                </div>
                <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Source Code</p>
                    <p className="text-sm text-blue-400 truncate group-hover/link:text-blue-300 font-mono">{quest.commitLink}</p>
                </div>
            </a>
            <a href={quest.videoLink} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:border-slate-700 transition-all group/link">
                <div className="bg-slate-800 p-2 rounded-md group-hover/link:bg-slate-700 transition-colors">
                    <Video size={18} className="text-slate-400 group-hover/link:text-white" />
                </div>
                <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Demo Proof</p>
                    <p className="text-sm text-blue-400 truncate group-hover/link:text-blue-300 font-mono">{quest.videoLink}</p>
                </div>
            </a>
        </div>

        {/* Action Buttons */}
        <form action={handleReview} className="p-4 bg-slate-900 flex gap-4 border-t border-slate-800/50">
            <input type="hidden" name="questId" value={quest.id} />
            <input type="hidden" name="userId" value={quest.assignedToId} />
            <input type="hidden" name="reward" value={quest.reward} />

            <button 
                name="decision" 
                value="reject"
                className="flex-1 py-3 bg-red-950/10 hover:bg-red-950/30 text-red-500 border border-red-900/20 hover:border-red-500/50 rounded-lg font-bold flex items-center justify-center gap-2 transition-all text-sm uppercase tracking-wide"
            >
                <X size={16} /> Refactor Hammer
            </button>
            <button 
                name="decision" 
                value="approve"
                className="flex-1 py-3 bg-green-600 hover:bg-green-500 text-white border border-green-500 hover:border-green-400 rounded-lg font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-all text-sm uppercase tracking-wide"
            >
                <Check size={16} /> Approve Loot
            </button>
        </form>
    </div>
  );
}