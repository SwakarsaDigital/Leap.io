import React from 'react';
import { prisma } from '../../../app/lib/prisma';
import QuestBoard from '../../../app/components/quest/QuestBoard';
import { Target } from 'lucide-react';

export default async function CaptainMissionsPage() {
  const quests = await prisma.quest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { assignedTo: true }
  });

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-8">
       <div className="max-w-7xl mx-auto">
          <header className="mb-8 flex items-center gap-3">
             <Target className="text-red-500" size={32} />
             <div>
                <h1 className="text-3xl font-black text-white uppercase italic tracking-tighter">Mission Board</h1>
                <p className="text-slate-500 text-sm">Oversight & Assignments</p>
             </div>
          </header>
          {/* Menggunakan 'as any' pada initialQuests untuk mengatasi error tipe data (Date objects/Null)
              saat passing data dari Server ke Client Component */}
          <QuestBoard initialQuests={quests as any} userRole="captain" />
       </div>
    </div>
  );
}