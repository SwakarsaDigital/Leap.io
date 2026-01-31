import React from 'react';
import { prisma } from '../../lib/prisma';
import QuestBoard from '../../components/quest/QuestBoard';
import { Target, ShieldAlert, Activity } from 'lucide-react';
import { auth } from '../../../auth';

// Memastikan data selalu fresh (tidak di-cache statis)
export const dynamic = 'force-dynamic';

export default async function CaptainMissionsPage() {
  // 1. Ambil Session & Role
  const session = await auth();
  const userRole = session?.user?.role || 'captain'; 

  // 2. Fetch Quests dari Database
  const rawQuests = await prisma.quest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      assignedTo: {
        select: {
          name: true,
          image: true
        }
      }
    }
  });

  // 3. Transformasi Data (Mapping)
  const formattedQuests = rawQuests.map((q: { id: any; title: any; description: any; projectId: any; reward: any; difficulty: any; status: any; commitLink: any; videoLink: any; assignedTo: any; }) => ({
    id: q.id,
    title: q.title,
    description: q.description,
    projectId: q.projectId,
    reward: q.reward,
    difficulty: q.difficulty,
    status: q.status, // Pastikan status di DB sesuai dengan yang diharapkan UI (todo, in_progress, review, done)
    commitLink: q.commitLink,
    videoLink: q.videoLink,
    assignee: q.assignedTo
  }));

  // Hitung statistik sederhana untuk Header
  const reviewCount = formattedQuests.filter((q: { status: string; }) => q.status === 'review' || q.status === 'loot_review').length;
  const activeCount = formattedQuests.filter((q: { status: string; }) => q.status === 'in_progress' || q.status === 'combat').length;

  return (
    // LAYOUT FIX: Hapus 'fixed inset-0' yang menutupi sidebar.
    // Gunakan 'h-[calc(100vh)]' atau 'h-full' (tergantung parent layout) dengan 'relative'
    // 'overflow-hidden' di sini mencegah scroll ganda pada body browser
    <div className="relative w-full h-[calc(100vh-64px)] md:h-screen bg-[#050505] text-slate-200 flex flex-col overflow-hidden">
       
       {/* HEADER: Fixed Height */}
       <header className="px-6 py-5 border-b border-slate-900 bg-[#050505] shrink-0 flex items-center justify-between z-10 w-full">
          <div className="flex items-center gap-4">
             <div className="p-2.5 bg-red-950/30 rounded-xl border border-red-900/50 shadow-[0_0_15px_-5px_rgba(239,68,68,0.5)]">
                <Target className="text-red-500" size={24} />
             </div>
             <div>
                <h1 className="text-xl font-black text-white uppercase tracking-tighter leading-none mb-1">Mission Control</h1>
                <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Tactical Oversight & Review</p>
             </div>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 rounded-lg border border-slate-800">
                <Activity size={14} className="text-blue-400" />
                <span className="text-xs text-slate-400 font-mono">
                  Active Ops: <span className="text-blue-400 font-bold">{activeCount}</span>
                </span>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${reviewCount > 0 ? 'bg-yellow-950/30 border-yellow-900/50' : 'bg-slate-900/50 border-slate-800'}`}>
                <ShieldAlert size={14} className={reviewCount > 0 ? "text-yellow-500 animate-pulse" : "text-slate-500"} />
                <span className="text-xs text-slate-400 font-mono">
                  Pending Review: <span className={reviewCount > 0 ? "text-yellow-500 font-bold" : "text-slate-500 font-bold"}>{reviewCount}</span>
                </span>
            </div>
          </div>
       </header>
       
       {/* MAIN CONTENT: Flex Grow & Hidden Overflow */}
       {/* Container ini memastikan QuestBoard mengisi sisa ruang dan scroll di dalam */}
       <div className="flex-1 w-full overflow-hidden relative bg-grid-slate-900/[0.04]">
          <QuestBoard initialQuests={formattedQuests} userRole={userRole} />
       </div>

    </div>
  );
}