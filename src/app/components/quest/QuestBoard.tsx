'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Sword, 
  Upload, 
  Github, 
  Video, 
  AlertCircle, 
  X, 
  Loader2,
  Hammer,     
  Check,
  FileText, 
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trophy
} from 'lucide-react';
// Updated import path to match the consolidated actions file
import { moveQuestCard, submitQuestLoot, reviewQuestLoot } from '../../../app/lib/actions'; 
import Link from 'next/link';

// --- TYPES ---
type Quest = {
  id: string;
  title: string;
  description?: string | null;
  projectId?: string | null; // ID Project untuk link dossier
  reward: number;
  difficulty: string; // Ubah ke string agar lebih fleksibel dengan database
  status: string;
  commitLink?: string | null;
  videoLink?: string | null;
  assignee?: {
    name: string | null;
    image: string | null;
  } | null;
};

interface QuestBoardProps {
  initialQuests: Quest[];
  userRole?: string; 
}

export default function QuestBoard({ initialQuests, userRole = 'freelancer' }: QuestBoardProps) {
  // Safe guard: pastikan initialQuests selalu array
  // Use logical OR to fallback to empty array if initialQuests is null/undefined
  const questsList = initialQuests || [];
  
  const [quests, setQuests] = useState<Quest[]>(questsList);
  const [filter, setFilter] = useState<'all' | 'combat'>('all');

  // --- STATE MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [commitLink, setCommitLink] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- STATE EXPANSION (Untuk melihat detail deskripsi per kartu) ---
  const [expandedQuestId, setExpandedQuestId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedQuestId(expandedQuestId === id ? null : id);
  }

  // --- LOGIC 1: Drag & Drop Handler ---
  const handleDragStart = (e: React.DragEvent, questId: string) => {
    e.dataTransfer.setData('questId', questId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const questId = e.dataTransfer.getData('questId');
    const quest = quests.find((q) => q.id === questId);

    if (!quest || quest.status === targetStatus) return;

    // INTERCEPT: Freelancer Drop to 'Review' (Loot Drop)
    if (targetStatus === 'review' && userRole !== 'captain') {
      openLootModal(questId);
      return;
    }
    
    // Optimistic Update
    const updatedQuests = quests.map((q) => 
      q.id === questId ? { ...q, status: targetStatus } : q
    );
    setQuests(updatedQuests);

    // Call Server Action
    try {
        await moveQuestCard(questId, targetStatus);
    } catch (err) {
        console.error("Failed to move card", err);
    }
  };

  // --- LOGIC 2: Manual Move (via Button) ---
  const handleMove = async (id: string, newStatus: string) => {
    const updatedQuests = quests.map((q) => 
      q.id === id ? { ...q, status: newStatus } : q
    );
    setQuests(updatedQuests);
    try {
        await moveQuestCard(id, newStatus);
    } catch (err) {
        console.error("Failed to move card", err);
    }
  };

  // --- LOGIC 3: Modal & Submission (Freelancer Side) ---
  const openLootModal = (questId: string) => {
    setSelectedQuestId(questId);
    setCommitLink('');
    setVideoLink('');
    setIsModalOpen(true);
  };

  const handleSubmitLoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestId) return;

    setIsSubmitting(true);

    try {
      const result = await submitQuestLoot(selectedQuestId, commitLink, videoLink);

      if (!result?.success) {
        // Fix: Use type assertion to avoid TS error if 'message' property is missing on inferred type
        // Also check for 'error' property which matches actions.ts
        const errorMsg = (result as any)?.message || (result as any)?.error || 'Submission failed';
        alert(errorMsg);
        setIsSubmitting(false);
        return;
      }

      // Update UI: Pindah ke review & simpan link
      const updatedQuests = quests.map((q) => 
        q.id === selectedQuestId ? { 
          ...q, 
          status: 'review', 
          commitLink: commitLink, 
          videoLink: videoLink 
        } : q
      );
      setQuests(updatedQuests);
      
      setIsModalOpen(false);
      setSelectedQuestId(null);
    } catch (error) {
      console.error("Failed to submit loot:", error);
      alert("System Error: Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- LOGIC 4: Captain Review (Captain Side) ---
  const handleCaptainReview = async (questId: string, decision: 'approve' | 'reject') => {
    // Optimistic UI Update
    const newStatus = decision === 'approve' ? 'done' : 'in_progress';
    
    const updatedQuests = quests.map((q) => 
       q.id === questId ? { ...q, status: newStatus } : q
    );
    setQuests(updatedQuests);

    // Call Server Action
    try {
        const result = await reviewQuestLoot(questId, decision);
        if (!result?.success) {
            // Fix: Use type assertion or check for 'error' property
            const errorMsg = (result as any)?.message || (result as any)?.error || 'Review failed';
            alert(errorMsg);
        }
    } catch (err) {
        console.error("Review failed", err);
    }
  };

  // Helper untuk filter
  const getQuestsByStatus = (status: string) => {
    // Ensure quests is an array before filtering
    if (!Array.isArray(quests)) return [];
    
    return quests.filter((q) => {
       // Normalisasi status dari DB ke UI (misal 'in_progress' vs 'combat')
       // Di sini kita asumsikan DB menggunakan 'todo', 'in_progress', 'review', 'done'
       // Jika DB menggunakan 'open', 'combat', dll sesuaikan di sini.
       // Mapping sederhana:
       if (status === 'todo') return q.status === 'open' || q.status === 'todo';
       if (status === 'in_progress') return q.status === 'in_progress' || q.status === 'combat';
       if (status === 'review') return q.status === 'review' || q.status === 'loot_review';
       if (status === 'done') return q.status === 'done' || q.status === 'completed';
       return q.status === status;
    });
  };

  return (
    <div className="h-full flex flex-col relative w-full p-6">
      
      {/* HEADER & FILTER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">Quest Board</h2>
            <div className="flex items-center gap-2 mt-2 text-xs text-yellow-500 bg-yellow-950/20 px-3 py-1 rounded border border-yellow-900/30 w-fit">
                <AlertCircle size={14} />
                <span className="font-mono font-medium">PROTOCOL: No Proof (Video/Git), No Loot.</span>
            </div>
        </div>

        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 shadow-sm">
            <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex gap-2 items-center ${filter === 'all' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
                <LayoutDashboard size={14} /> All Quests
            </button>
            <button 
                onClick={() => setFilter('combat')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex gap-2 items-center ${filter === 'combat' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
                <Sword size={14} /> In Combat
            </button>
        </div>
      </div>
      
      {/* KANBAN COLUMNS */}
      <div className="flex overflow-x-auto pb-4 gap-6 h-full items-start scrollbar-thin scrollbar-thumb-slate-800">
        <Column 
          title="To Do" 
          status="todo" 
          icon={LayoutDashboard} 
          quests={getQuestsByStatus('todo')} 
          color="border-slate-600" 
          headerColor="text-slate-400"
          onDrop={handleDrop} onDragOver={handleDragOver} onDragStart={handleDragStart} onMove={handleMove} onLoot={openLootModal}
          userRole={userRole}
          expandedId={expandedQuestId} onToggleExpand={toggleExpand}
        />
        <Column 
          title="In Combat" 
          status="in_progress" 
          icon={Sword} 
          quests={getQuestsByStatus('in_progress')} 
          color="border-blue-500" 
          headerColor="text-blue-400"
          onDrop={handleDrop} onDragOver={handleDragOver} onDragStart={handleDragStart} onMove={handleMove} onLoot={openLootModal}
          userRole={userRole}
          expandedId={expandedQuestId} onToggleExpand={toggleExpand}
        />
        <Column 
          title="Loot Review" 
          status="review" 
          icon={Upload} 
          quests={getQuestsByStatus('review')} 
          color="border-yellow-500" 
          headerColor="text-yellow-400"
          onDrop={handleDrop} onDragOver={handleDragOver} onDragStart={handleDragStart} onMove={handleMove} onLoot={openLootModal}
          userRole={userRole}
          onCaptainReview={handleCaptainReview} 
          expandedId={expandedQuestId} onToggleExpand={toggleExpand}
        />
        <Column 
          title="Completed" 
          status="done" 
          icon={Trophy} 
          quests={getQuestsByStatus('done')} 
          color="border-green-500" 
          headerColor="text-green-400"
          onDrop={handleDrop} onDragOver={handleDragOver} onDragStart={handleDragStart} onMove={handleMove} onLoot={openLootModal}
          userRole={userRole}
          expandedId={expandedQuestId} onToggleExpand={toggleExpand}
        />
      </div>

      {/* MODAL POPUP (LOOT SUBMISSION - FREELANCER ONLY) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-500" />

                <button 
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Upload className="text-emerald-500" size={20} /> Loot Drop Protocol
                </h3>
                <p className="text-slate-400 text-sm mb-6">Submit your evidence to claim the bounty.</p>

                <form onSubmit={handleSubmitLoot} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Github Commit Link <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Github className="absolute left-3 top-2.5 text-slate-500" size={16} />
                            <input 
                                type="url" 
                                required
                                placeholder="https://github.com/..."
                                value={commitLink}
                                onChange={(e) => setCommitLink(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-600 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Video Proof (10s) <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Video className="absolute left-3 top-2.5 text-slate-500" size={16} />
                            <input 
                                type="url" 
                                required
                                placeholder="https://loom.com/..."
                                value={videoLink}
                                onChange={(e) => setVideoLink(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-600 transition-all"
                            />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1.5 italic">
                          "No Proof, No Loot." &mdash; The Captain
                        </p>
                    </div>

                    <div className="pt-6 flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold transition-colors"
                        >
                            Abort
                        </button>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : 'Claim Loot'}
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
function Column({ title, status, icon: Icon, quests, color, headerColor, onDrop, onDragOver, onDragStart, onMove, onLoot, userRole, onCaptainReview, expandedId, onToggleExpand }: any) {
  return (
    <div 
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
      className={`flex-1 min-w-[300px] max-w-sm bg-slate-900/40 rounded-xl flex flex-col border-t-4 ${color} h-full backdrop-blur-sm`}
    >
      {/* COLUMN HEADER */}
      <div className={`p-4 border-b border-slate-800/50 flex items-center justify-between ${headerColor} bg-slate-900/60 rounded-t-lg`}>
        <div className="flex items-center gap-2">
            <Icon size={18} />
            <h3 className="font-bold uppercase tracking-wider text-sm">{title}</h3>
        </div>
        <span className="bg-slate-950 px-2 py-0.5 rounded text-xs font-mono text-slate-400 border border-slate-800 min-w-[24px] text-center">
            {quests.length}
        </span>
      </div>

      {/* QUEST LIST */}
      <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
        {quests.length === 0 && (
            <div className="h-32 border-2 border-dashed border-slate-800/50 rounded-lg flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50">
                <span className="text-xs italic font-medium">Empty Sector</span>
            </div>
        )}

        {quests.map((quest: Quest) => (
          <div 
            key={quest.id} 
            draggable={userRole === 'captain' || status !== 'review'} // Freelancer cannot drag OUT of review easily (locked)
            onDragStart={(e) => onDragStart(e, quest.id)}
            className="bg-slate-800/80 border border-slate-700/50 p-4 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-all shadow-md group relative overflow-hidden cursor-grab active:cursor-grabbing"
          >
              {/* DIFFICULTY STRIPE */}
              <div className={`absolute top-0 left-0 w-1 h-full ${
                quest.difficulty === 'hard' ? 'bg-red-500' : 
                quest.difficulty === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'
            }`}></div>

            <div className="pl-2">
                <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-white/5 bg-white/5 text-slate-300`}>
                        {quest.difficulty}
                    </span>
                    <span className="text-emerald-400 text-xs font-black font-mono">+{quest.reward} XP</span>
                </div>
                
                <h4 className="text-slate-200 font-medium mb-3 text-sm leading-relaxed">{quest.title}</h4>
                
                {/* --- LINK TO FULL PROJECT DOSSIER --- */}
                {quest.projectId && (
                  <Link href={`/projects/${quest.projectId}`} className="block mb-3 bg-slate-950/30 hover:bg-slate-950/60 border border-slate-800 hover:border-blue-500/50 rounded-lg p-2 transition-all group/link">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 group-hover/link:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                        <FileText size={10} /> Open Project Dossier
                      </span>
                      <ExternalLink size={10} className="text-slate-600 group-hover/link:text-blue-400" />
                    </div>
                  </Link>
                )}

                {/* --- TOGGLE DETAIL DESKRIPSI (Quick View) --- */}
                {quest.description && (
                  <div className="mb-3">
                    <button 
                      onClick={() => onToggleExpand(quest.id)}
                      className="text-[10px] flex items-center gap-1 text-slate-500 hover:text-blue-400 transition-colors mb-2"
                    >
                      {expandedId === quest.id ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                      {expandedId === quest.id ? 'Hide Brief' : 'Quick Peek'}
                    </button>
                    
                    {expandedId === quest.id && (
                      <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 font-mono whitespace-pre-wrap leading-relaxed animate-in fade-in zoom-in-95 duration-200 max-h-40 overflow-y-auto custom-scrollbar">
                        {quest.description}
                      </div>
                    )}
                  </div>
                )}

                {/* --- FOOTER / ACTIONS --- */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
                    {/* Assignee Avatar */}
                    <div className="flex items-center gap-2">
                        {quest.assignee ? (
                            <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold border-2 border-slate-800">
                                {quest.assignee.name?.charAt(0) || 'U'}
                            </div>
                        ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-800 border-dashed opacity-50" />
                        )}
                    </div>

                    {/* Action Buttons (Freelancer) */}
                    <div className="flex gap-2">
                        {status === 'todo' && (
                            <button onClick={() => onMove(quest.id, 'in_progress')} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] rounded font-bold uppercase transition-colors">
                                Start
                            </button>
                        )}
                        {status === 'in_progress' && (
                            <button onClick={() => onLoot(quest.id)} className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-[10px] rounded font-bold uppercase transition-colors flex items-center gap-1">
                                <Upload size={10} /> Loot
                            </button>
                        )}
                    </div>
                </div>

                {/* STATUS SPECIFIC INFO & CAPTAIN ACTIONS */}
                {status === 'review' && (
                    <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-3">
                          {/* Evidence Links */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <Github size={12} className="shrink-0 text-slate-500"/> 
                                <a href={quest.commitLink || '#'} target="_blank" className="hover:text-emerald-400 truncate max-w-[150px]">Commit Link</a>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <Video size={12} className="shrink-0 text-slate-500"/> 
                                <a href={quest.videoLink || '#'} target="_blank" className="hover:text-emerald-400 truncate max-w-[150px]">Video Proof</a>
                            </div>
                          </div>

                          {/* CAPTAIN BUTTONS (Only visible if role is Captain) */}
                          {userRole === 'captain' && (
                            <div className="flex gap-2 mt-2">
                                <button 
                                    onClick={() => onCaptainReview(quest.id, 'reject')}
                                    className="flex-1 py-1.5 bg-red-900/40 border border-red-800 hover:bg-red-900/80 text-red-200 text-[10px] rounded font-bold uppercase flex justify-center items-center gap-1 transition-colors"
                                >
                                    <Hammer size={12} /> Refactor
                                </button>
                                <button 
                                    onClick={() => onCaptainReview(quest.id, 'approve')}
                                    className="flex-1 py-1.5 bg-emerald-900/40 border border-emerald-800 hover:bg-emerald-900/80 text-emerald-200 text-[10px] rounded font-bold uppercase flex justify-center items-center gap-1 transition-colors"
                                >
                                    <Check size={12} /> Approve
                                </button>
                            </div>
                          )}

                          {/* Freelancer Waiting State */}
                          {userRole !== 'captain' && (
                            <div className="text-[10px] text-center text-slate-500 italic bg-slate-950/30 py-1.5 rounded border border-slate-800/50">
                                Awaiting Captain's Validation
                            </div>
                          )}
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}