import React from 'react';
import Link from 'next/link';
import { prisma } from '../lib/prisma';
import { 
  Check, 
  X, 
  Github, 
  Video, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck,
  Target,
  ArrowRight
} from 'lucide-react';
import { reviewQuest } from '.././lib/actions';
import { auth } from '../../auth';
import { redirect } from 'next/navigation';

/**
 * Fetch quests that are in 'loot_drop' status (waiting for review)
 */
async function getPendingQuests() {
  return await prisma.quest.findMany({
    where: { status: 'loot_drop' },
    include: { 
      assignedTo: true // Get info about the freelancer who did the work
    },
    orderBy: { updatedAt: 'desc' }
  });
}

export default async function CaptainPage() {
  const session = await auth();
  
  // Security check: Ensure only Captains can access this page
  if (!session || session.user?.role !== 'captain') {
    redirect('/');
  }

  const pendingQuests = await getPendingQuests();

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-8 font-sans">
      <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
        
        {/* --- SECTION 1: HEADER --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12 bg-red-950/10 p-8 rounded-3xl border border-red-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex items-center gap-5 relative z-10">
              <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                  <ShieldAlert className="text-red-500" size={40} />
              </div>
              <div>
                  <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">Captain's Bridge</h2>
                  <p className="text-slate-400 text-sm font-mono mt-1">
                    System Level: <span className="text-red-400">AUTHORIZED ACCESS ONLY</span>
                  </p>
              </div>
          </div>
          
          {/* Action: Open Client Shield */}
          <Link 
              href="/captain/shield" 
              className="flex items-center gap-4 bg-slate-900 hover:bg-slate-800 text-white px-6 py-4 rounded-2xl border border-slate-700 transition-all shadow-xl group w-full md:w-auto relative z-10"
          >
              <div className="bg-green-500/20 p-2.5 rounded-xl group-hover:bg-green-500/30 transition-colors border border-green-500/30">
                  <ShieldCheck size={24} className="text-green-500" />
              </div>
              <div className="text-left flex flex-col">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] leading-tight">Emergency Link</span>
                  <span className="text-lg font-bold text-slate-200 group-hover:text-white leading-tight">Open Client Shield</span>
              </div>
              <ArrowRight size={20} className="ml-2 text-slate-600 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* --- SECTION 2: STATS SUMMARY --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <StatBox label="Total XP Pool" value="1.2M" color="text-yellow-400" />
            <StatBox label="Pending Review" value={pendingQuests.length.toString()} color="text-red-400" />
            <StatBox label="Active Quests" value="14" color="text-blue-400" />
            <StatBox label="Status" value="OPTIMAL" color="text-green-400" />
        </div>

        {/* --- SECTION 3: PENDING REVIEW LIST --- */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                <Target className="text-yellow-500" /> Incoming Transmissions 
            </h3>
            <span className="bg-slate-800 text-slate-400 text-xs font-mono px-3 py-1 rounded-full border border-slate-700">
              {pendingQuests.length} QUEUE(S)
            </span>
          </div>

          {pendingQuests.length === 0 ? (
              <div className="text-center py-24 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800 flex flex-col items-center gap-4">
                  <div className="bg-slate-800/50 p-6 rounded-full">
                      <Check size={48} className="text-slate-700" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-bold text-lg">All quiet on the bridge.</p>
                    <p className="text-slate-600 text-sm font-mono uppercase tracking-widest">No pending Loot Drops for validation.</p>
                  </div>
              </div>
          ) : (
              <div className="grid grid-cols-1 gap-6">
                {pendingQuests.map((quest) => (
                    <ReviewCard key={quest.id} quest={quest} />
                ))}
              </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Small Component for Stats
 */
function StatBox({ label, value, color }: { label: string, value: string, color: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
      <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
    </div>
  );
}

/**
 * ReviewCard Component 
 * Handles Approve/Reject interactions via Server Action
 */
function ReviewCard({ quest }: { quest: any }) {
  
  // Internal Server Action Wrapper
  async function handleReviewAction(formData: FormData) {
    'use server';
    const decision = formData.get('decision') as 'approve' | 'reject';
    const questId = formData.get('questId') as string;
    const userId = formData.get('userId') as string;
    const reward = Number(formData.get('reward'));

    await reviewQuest(questId, decision, userId, reward);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl hover:border-slate-600 transition-all group flex flex-col">
        {/* Card Header */}
        <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start gap-4 bg-slate-900/50">
            <div>
                <div className="flex items-center gap-3 mb-3">
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded border ${
                        quest.difficulty === 'hard' ? 'bg-red-950/30 text-red-400 border-red-900/30' : 
                        quest.difficulty === 'medium' ? 'bg-yellow-950/30 text-yellow-400 border-yellow-900/30' : 
                        'bg-blue-950/30 text-blue-400 border-blue-900/30'
                    }`}>
                        {quest.difficulty} mission
                    </span>
                    <span className="text-slate-500 text-xs flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                        By <span className="text-slate-200 font-bold">{quest.assignedTo?.name || 'Unknown Agent'}</span>
                    </span>
                </div>
                <h4 className="text-2xl font-bold text-white tracking-tight leading-tight">{quest.title}</h4>
            </div>
            <div className="text-right flex flex-col items-end">
                <span className="text-3xl font-black text-green-500 tracking-tighter">+{quest.reward} XP</span>
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mt-1">Loot Value</span>
            </div>
        </div>

        {/* Evidence Links */}
        <div className="p-6 bg-slate-950/30 grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href={quest.commitLink} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-black/40 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:border-slate-500 transition-all group/link">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 group-hover/link:bg-slate-700 transition-colors">
                    <Github size={20} className="text-slate-400 group-hover/link:text-white" />
                </div>
                <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Source Repository</p>
                    <p className="text-sm text-blue-400 truncate group-hover/link:text-blue-300 font-mono">{quest.commitLink}</p>
                </div>
            </a>
            
            <a href={quest.videoLink} target="_blank" rel="noreferrer" className="flex items-center gap-4 p-4 bg-black/40 border border-slate-800 rounded-2xl hover:bg-slate-800 hover:border-slate-500 transition-all group/link">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 group-hover/link:bg-slate-700 transition-colors">
                    <Video size={20} className="text-slate-400 group-hover/link:text-white" />
                </div>
                <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Tactical Recording</p>
                    <p className="text-sm text-blue-400 truncate group-hover/link:text-blue-300 font-mono">{quest.videoLink}</p>
                </div>
            </a>
        </div>

        {/* Action Buttons */}
        <form action={handleReviewAction} className="p-6 bg-slate-900 flex flex-col sm:flex-row gap-4 border-t border-slate-800/50">
            <input type="hidden" name="questId" value={quest.id} />
            <input type="hidden" name="userId" value={quest.assignedToId} />
            <input type="hidden" name="reward" value={quest.reward} />

            <button 
                name="decision" 
                value="reject"
                className="flex-1 py-4 bg-transparent hover:bg-red-500/10 text-red-500 border border-red-900/30 hover:border-red-500/50 rounded-2xl font-black flex items-center justify-center gap-3 transition-all text-xs uppercase tracking-widest"
            >
                <X size={18} /> Refactor Hammer
            </button>
            
            <button 
                name="decision" 
                value="approve"
                className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-black border border-green-400 hover:border-green-300 rounded-2xl font-black flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.3)] transition-all text-xs uppercase tracking-widest"
            >
                <Check size={18} /> Approve Loot
            </button>
        </form>
    </div>
  );
}