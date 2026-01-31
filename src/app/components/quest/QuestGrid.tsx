'use client';

import React, { useState } from 'react';
import { 
  Sword, 
  CheckCircle, 
  AlertCircle,
  Github,
} from 'lucide-react';

// Sesuaikan interface dengan data yang akan dikirim dari server
export interface QuestData {
  id: string;
  title: string;
  description: string;
  reward: number;
  difficulty: string;
  status: string;
  createdAt: Date;
  assignee?: {
    name: string | null;
    image: string | null;
  } | null;
}

interface QuestGridProps {
  initialQuests: QuestData[];
  userRole: string; // 'client', 'captain', 'freelancer'
}

export default function QuestGrid({ initialQuests, userRole }: QuestGridProps) {
  const [filter, setFilter] = useState('all');

  // Filter logika sederhana untuk UI
  const filteredQuests = initialQuests.filter(q => {
    if (filter === 'all') return true;
    return q.status === filter;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Active Missions</h2>
          <p className="text-slate-400 text-sm">Select a mission to view details or submit loot.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
        {['all', 'open', 'in_progress', 'loot_review', 'completed'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              filter === status 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'bg-slate-900 text-slate-500 hover:text-slate-300 border border-slate-800'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Grid Layout untuk Kartu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuests.length === 0 ? (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
            <Sword className="mx-auto text-slate-700 mb-4" size={48} />
            <p className="text-slate-500 font-medium">No quests found in this sector.</p>
          </div>
        ) : (
          filteredQuests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} userRole={userRole} />
          ))
        )}
      </div>
    </div>
  );
}

function QuestCard({ quest, userRole }: { quest: QuestData; userRole: string }) {
  // Helper untuk warna badge status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'in_progress': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'loot_review': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  // Helper untuk warna difficulty
  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all group flex flex-col h-full relative overflow-hidden">
      
      {/* Latar Belakang Dekoratif (Opsional) */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-full pointer-events-none" />

      {/* Header Kartu */}
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(quest.status)}`}>
          {quest.status.replace('_', ' ')}
        </span>
        <div className="flex items-center gap-1">
           {/* Titik indikator kesulitan */}
           <div className={`w-2 h-2 rounded-full ${getDifficultyColor(quest.difficulty)} bg-current shadow-[0_0_8px_currentColor]`} />
        </div>
      </div>

      {/* Konten Utama */}
      <div className="mb-4 flex-1">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors" title={quest.title}>
          {quest.title}
        </h3>
        
        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 min-h-[3rem]">
          {quest.description || 'No briefing available.'}
        </p>
      </div>

      {/* Info Tambahan (Reward & Assignee) */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-auto">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Reward</span>
          <span className="text-sm font-black text-green-400">{quest.reward} XP</span>
        </div>

        {quest.assignee ? (
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-[8px] font-bold text-white">
              {quest.assignee.name?.[0] || 'A'}
            </div>
            <span className="text-[10px] text-slate-300 font-medium truncate max-w-[80px]">
              {quest.assignee.name}
            </span>
          </div>
        ) : (
          <span className="text-[10px] text-slate-600 italic px-2">Unassigned</span>
        )}
      </div>

      {/* Tombol Aksi Berdasarkan Role & Status */}
      <div className="mt-4 pt-0 relative z-10">
        {userRole === 'freelancer' && quest.status === 'open' && (
          <button className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all active:scale-95">
            Accept Mission
          </button>
        )}

        {userRole === 'freelancer' && quest.status === 'in_progress' && (
           <div className="flex gap-2">
              <button className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                 <Github size={14} /> Commit
              </button>
              <button className="flex-1 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2">
                 Submit <CheckCircle size={14} />
              </button>
           </div>
        )}

        {userRole === 'captain' && quest.status === 'loot_review' && (
          <button className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-purple-900/20 transition-all flex items-center justify-center gap-2">
            <AlertCircle size={14} /> Review Loot
          </button>
        )}
        
        {/* Tombol Default/View Detail */}
        {((userRole === 'client') || (quest.status === 'completed')) && (
           <button className="w-full py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
             View Details
           </button>
        )}
      </div>

    </div>
  );
}