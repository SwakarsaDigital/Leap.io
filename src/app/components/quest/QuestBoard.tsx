// app/components/quest/QuestBoard.tsx
'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Sword, 
  CheckCircle, 
  Trophy, 
  Upload, 
  Github, 
  Video, 
  AlertCircle, 
  X, 
  Loader2 
} from 'lucide-react';
// Menggunakan relative path ke file actions
import { updateQuestStatus, submitLoot } from '../../lib/actions';

// Tipe data sementara (any) agar fleksibel dengan Prisma
type Quest = any;

interface QuestBoardProps {
  initialQuests: Quest[];
}

export default function QuestBoard({ initialQuests }: QuestBoardProps) {
  const [quests, setQuests] = useState<Quest[]>(initialQuests);
  const [filter, setFilter] = useState<'all' | 'combat'>('all');

  // --- STATE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [commitLink, setCommitLink] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- LOGIC 1: Pindah Status Biasa (Todo -> Combat) ---
  const handleMove = async (id: string, newStatus: string) => {
    // Optimistic Update (Update UI duluan)
    const updatedQuests = quests.map((q) => 
      q.id === id ? { ...q, status: newStatus } : q
    );
    setQuests(updatedQuests);

    try {
      await updateQuestStatus(id, newStatus);
    } catch (error) {
      console.error("Failed to move quest:", error);
      // Optional: Revert state if needed
    }
  };

  // --- LOGIC 2: Buka Modal Loot ---
  const openLootModal = (questId: string) => {
    setSelectedQuestId(questId);
    setCommitLink('');
    setVideoLink('');
    setIsModalOpen(true);
  };

  // --- LOGIC 3: Submit Form Loot ---
  const handleSubmitLoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestId) return;

    setIsSubmitting(true);

    try {
      // Panggil Server Action
      await submitLoot(selectedQuestId, commitLink, videoLink);

      // Update UI Lokal
      const updatedQuests = quests.map((q) => 
        q.id === selectedQuestId ? { 
          ...q, 
          status: 'loot_drop', 
          commitLink: commitLink, 
          videoLink: videoLink 
        } : q
      );
      setQuests(updatedQuests);
      
      // Tutup Modal
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to submit loot:", error);
      alert("Failed to submit. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full flex flex-col relative">
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white">Quest Board</h2>
            <div className="flex items-center gap-2 mt-2 text-xs text-yellow-500 bg-yellow-950/20 px-3 py-1 rounded border border-yellow-900/30 w-fit">
                <AlertCircle size={14} />
                <span className="font-mono">PROTOCOL: No Proof (Video/Git), No Loot.</span>
            </div>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
            <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex gap-2 items-center ${filter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                <LayoutDashboard size={14} /> All Quests
            </button>
            <button 
                onClick={() => setFilter('combat')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex gap-2 items-center ${filter === 'combat' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                <Sword size={14} /> In Combat
            </button>
        </div>
      </div>
      
      {/* KANBAN COLUMNS */}
      <div className="flex overflow-x-auto pb-4 gap-6 h-full items-start scrollbar-thin scrollbar-thumb-slate-800">
        <Column title="To Do" status="todo" icon={LayoutDashboard} quests={quests} filter={filter} color="text-slate-400" onMove={handleMove} onLoot={openLootModal} />
        <Column title="In Combat" status="combat" icon={Sword} quests={quests} filter={filter} color="text-blue-400" onMove={handleMove} onLoot={openLootModal} />
        <Column title="Loot Drop" status="loot_drop" icon={CheckCircle} quests={quests} filter={filter} color="text-yellow-400" onMove={handleMove} onLoot={openLootModal} />
        <Column title="Completed" status="done" icon={Trophy} quests={quests} filter={filter} color="text-green-400" onMove={handleMove} onLoot={openLootModal} />
      </div>

      {/* MODAL POPUP (LOOT SUBMISSION) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Upload className="text-yellow-500" /> Submit Loot
                </h3>
                <p className="text-slate-400 text-sm mb-6">Provide proof of work to claim your XP.</p>

                <form onSubmit={handleSubmitLoot} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Github Commit Link</label>
                        <div className="relative">
                            <Github className="absolute left-3 top-2.5 text-slate-500" size={16} />
                            <input 
                                type="url" 
                                required
                                placeholder="https://github.com/..."
                                value={commitLink}
                                onChange={(e) => setCommitLink(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-green-500 focus:outline-none placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Video Demo Link (Loom/Youtube)</label>
                        <div className="relative">
                            <Video className="absolute left-3 top-2.5 text-slate-500" size={16} />
                            <input 
                                type="url" 
                                required
                                placeholder="https://loom.com/..."
                                value={videoLink}
                                onChange={(e) => setVideoLink(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-green-500 focus:outline-none placeholder:text-slate-600"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Submit Proof'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

// --- SUB-COMPONENT: KANBAN COLUMN ---
function Column({ title, status, icon: Icon, quests, filter, color, onMove, onLoot }: any) {
  const items = quests.filter((q: Quest) => q.status === status);
  const isDimmed = filter === 'combat' && status !== 'combat';

  return (
    <div className={`flex-1 min-w-[320px] max-w-sm bg-slate-900/40 rounded-xl flex flex-col border border-slate-800/60 h-full transition-opacity duration-300 ${isDimmed ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
      
      {/* COLUMN HEADER */}
      <div className={`p-4 border-b border-slate-800 flex items-center justify-between ${color} bg-slate-900/80 rounded-t-xl backdrop-blur-sm sticky top-0 z-10`}>
        <div className="flex items-center gap-2">
            <Icon size={18} />
            <h3 className="font-bold uppercase tracking-wider text-sm">{title}</h3>
        </div>
        <span className="bg-slate-950 px-2.5 py-0.5 rounded text-xs font-mono text-slate-400 border border-slate-800">{items.length}</span>
      </div>

      {/* QUEST LIST */}
      <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
        {items.length === 0 && (
            <div className="h-32 border-2 border-dashed border-slate-800/50 rounded-lg flex flex-col items-center justify-center text-slate-600 gap-2">
                <span className="text-xs italic">No active quests</span>
            </div>
        )}

        {items.map((quest: Quest) => (
          <div key={quest.id} className="bg-slate-900 border border-slate-800 p-4 rounded-lg hover:border-slate-600 transition-all shadow-lg group relative overflow-hidden">
             
             {/* DIFFICULTY STRIPE */}
             <div className={`absolute top-0 left-0 w-1 h-full ${
                quest.difficulty === 'hard' ? 'bg-red-500' : 
                quest.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
            }`}></div>

            <div className="pl-3">
                <div className="flex justify-between items-center mb-2">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-white/10 opacity-70`}>{quest.difficulty}</span>
                    <span className="text-green-500 text-xs font-black font-mono">+{quest.reward} XP</span>
                </div>
                
                <h4 className="text-slate-200 font-medium mb-4 text-sm leading-snug">{quest.title}</h4>
                
                <div className="mt-3">
                    {/* --- ACTION BUTTONS --- */}
                    {status === 'todo' && (
                        <button onClick={() => onMove(quest.id, 'combat')} className="w-full py-2 bg-blue-600/90 hover:bg-blue-500 text-white text-xs rounded font-bold uppercase transition-colors shadow-lg shadow-blue-900/20 border border-blue-500/50">
                            Start Quest
                        </button>
                    )}
                    
                    {status === 'combat' && (
                        <button onClick={() => onLoot(quest.id)} className="w-full py-2 bg-yellow-600/90 hover:bg-yellow-500 text-white text-xs rounded font-bold uppercase transition-colors flex justify-center gap-2 shadow-lg shadow-yellow-900/20 border border-yellow-500/50">
                            <Upload size={14} /> Submit Loot
                        </button>
                    )}
                    
                    {status === 'loot_drop' && (
                        <div className="bg-slate-950/50 rounded p-3 border border-slate-800 space-y-2">
                             <div className="flex items-center gap-2 text-xs text-slate-400 truncate group/link">
                                <Github size={12} className="shrink-0 group-hover/link:text-white"/> 
                                <a href={quest.commitLink} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 truncate transition-colors">{quest.commitLink}</a>
                             </div>
                             <div className="flex items-center gap-2 text-xs text-slate-400 truncate group/link">
                                <Video size={12} className="shrink-0 group-hover/link:text-white"/> 
                                <a href={quest.videoLink} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 truncate transition-colors">{quest.videoLink}</a>
                             </div>
                             <div className="pt-2 border-t border-slate-800 text-[10px] text-yellow-600 text-center font-bold uppercase tracking-widest bg-yellow-950/10 py-1 rounded">
                                Waiting for Review
                             </div>
                        </div>
                    )}
                    
                    {status === 'done' && (
                        <div className="text-center py-1 bg-green-950/20 rounded border border-green-900/20 text-green-500 text-xs font-bold flex justify-center gap-1">
                            <CheckCircle size={12} /> Claimed
                        </div>
                    )}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}