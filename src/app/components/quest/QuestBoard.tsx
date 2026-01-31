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
  Trophy,
  Eye,
  Clock,
  Target,
  ExternalLink
} from 'lucide-react';
import { moveQuestCard, submitQuestLoot, reviewQuestLoot } from '../../lib/actions'; 
import Link from 'next/link';

// --- TYPES ---
export type Quest = {
  id: string;
  title: string;
  description?: string | null;
  projectId?: string | null;
  reward: number;
  difficulty: string;
  status: string;
  commitLink?: string | null;
  videoLink?: string | null;
  createdAt: Date | string; 
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
  const questsList = initialQuests || [];
  const [quests, setQuests] = useState<Quest[]>(questsList);
  
  // --- STATE MODALS ---
  const [isLootModalOpen, setIsLootModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  
  // Form State
  const [commitLink, setCommitLink] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- ACTIONS ---

  // 1. Drag & Drop Handlers
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
    // Jika freelancer memindahkan ke review, buka modal loot
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
        // Revert on error could be added here
    }
  };

  // 2. Manual Move (Start Button)
  const handleMove = async (id: string, newStatus: string) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
    try {
      await moveQuestCard(id, newStatus);
    } catch (err) {
      console.error("Failed to move card", err);
    }
  };

  // 3. OPEN DETAIL MODAL
  const openDetailModal = (quest: Quest) => {
    setSelectedQuest(quest);
    setIsDetailModalOpen(true);
  };

  // 4. OPEN LOOT MODAL
  const openLootModal = (questId: string) => {
    const quest = quests.find(q => q.id === questId);
    if (quest) {
      setSelectedQuest(quest);
      setCommitLink(quest.commitLink || '');
      setVideoLink(quest.videoLink || '');
      setIsLootModalOpen(true);
    }
  };

  // 5. ACCEPT MISSION (Todo -> In Progress)
  const handleAcceptMission = async (questId: string) => {
    handleMove(questId, 'in_progress');
    if (isDetailModalOpen) setIsDetailModalOpen(false);
  };

  // 6. SUBMIT LOOT (In Progress -> Review)
  const handleSubmitLoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuest) return;

    setIsSubmitting(true);
    try {
      const result = await submitQuestLoot(selectedQuest.id, commitLink, videoLink);
      
      if (result?.success) {
        setQuests(prev => prev.map(q => 
          q.id === selectedQuest.id ? { 
            ...q, 
            status: 'review', 
            commitLink, 
            videoLink 
          } : q
        ));
        setIsLootModalOpen(false);
        setSelectedQuest(null);
      } else {
        alert("Submission failed: " + (result as any).message);
      }
    } catch (error) {
      console.error("Error submitting loot:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 7. CAPTAIN REVIEW (Review -> Done OR In Progress)
  const handleCaptainReview = async (questId: string, decision: 'approve' | 'reject') => {
    const newStatus = decision === 'approve' ? 'done' : 'in_progress';
    
    setQuests(prev => prev.map(q => q.id === questId ? { ...q, status: newStatus } : q));

    try {
      await reviewQuestLoot(questId, decision);
    } catch (error) {
      console.error("Review action failed:", error);
    }
  };

  // --- FILTERING ---
  const getQuestsByStatus = (statusGroup: string) => {
    return quests.filter(q => {
      if (statusGroup === 'todo') return q.status === 'open' || q.status === 'todo';
      if (statusGroup === 'in_progress') return q.status === 'in_progress' || q.status === 'combat';
      if (statusGroup === 'review') return q.status === 'review' || q.status === 'loot_review';
      if (statusGroup === 'done') return q.status === 'done' || q.status === 'completed';
      return false;
    });
  };

  return (
    <div className="h-full flex flex-col relative w-full p-4 md:p-6">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
           <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
             <Target className="text-red-500" /> Mission Board
           </h2>
           <p className="text-slate-500 text-xs font-mono mt-1">
             STATUS: <span className="text-emerald-500">ONLINE</span> // SECTOR: GUILD_HALL
           </p>
        </div>
      </div>
      
      {/* KANBAN BOARD */}
      <div className="flex overflow-x-auto pb-4 gap-4 h-full items-start scrollbar-thin scrollbar-thumb-slate-800 snap-x snap-mandatory">
        
        {/* 1. TO DO / OPEN */}
        <Column 
          title="Open Missions" 
          status="todo" 
          icon={LayoutDashboard} 
          quests={getQuestsByStatus('todo')} 
          color="border-slate-600" 
          headerColor="text-slate-400"
          onDetail={openDetailModal}
          onDrop={handleDrop} onDragOver={handleDragOver} onDragStart={handleDragStart} onMove={handleMove}
          userRole={userRole}
        />

        {/* 2. IN PROGRESS / COMBAT */}
        <Column 
          title="In Combat" 
          status="in_progress" 
          icon={Sword} 
          quests={getQuestsByStatus('in_progress')} 
          color="border-blue-500" 
          headerColor="text-blue-400"
          onDetail={openDetailModal}
          actionLabel="Submit Loot"
          onAction={(q: { id: string; }) => openLootModal(q.id)}
          onDrop={handleDrop} onDragOver={handleDragOver} onDragStart={handleDragStart} onMove={handleMove} onLoot={openLootModal}
          userRole={userRole}
        />

        {/* 3. REVIEW / LOOT DROP */}
        <Column 
          title="Loot Review" 
          status="review" 
          icon={Upload} 
          quests={getQuestsByStatus('review')} 
          color="border-yellow-500" 
          headerColor="text-yellow-400"
          onDetail={openDetailModal}
          onDrop={handleDrop} onDragOver={handleDragOver} onDragStart={handleDragStart}
          userRole={userRole}
          isCaptain={userRole === 'captain'}
          onCaptainReview={handleCaptainReview}
        />

        {/* 4. COMPLETED */}
        <Column 
          title="Completed" 
          status="done" 
          icon={Trophy} 
          quests={getQuestsByStatus('done')} 
          color="border-green-500" 
          headerColor="text-green-400"
          onDetail={openDetailModal}
          onDrop={handleDrop} onDragOver={handleDragOver} onDragStart={handleDragStart}
          userRole={userRole}
        />
      </div>

      {/* --- MODAL 1: MISSION DETAIL --- */}
      {isDetailModalOpen && selectedQuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
           <div className="bg-[#0a0a0a] border border-slate-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl relative">
              
              {/* Modal Header */}
              <div className="h-24 bg-gradient-to-r from-slate-900 to-slate-800 relative">
                 <button 
                    onClick={() => setIsDetailModalOpen(false)}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition-all"
                 >
                    <X size={16} />
                 </button>
                 <div className="absolute -bottom-6 left-6 flex items-end gap-4">
                    <div className="w-16 h-16 bg-slate-950 border-2 border-slate-700 rounded-xl flex items-center justify-center shadow-lg">
                       <FileText size={24} className="text-blue-500" />
                    </div>
                    <div className="mb-2">
                       <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                         selectedQuest.difficulty === 'hard' ? 'bg-red-950/50 border-red-900 text-red-400' :
                         selectedQuest.difficulty === 'medium' ? 'bg-yellow-950/50 border-yellow-900 text-yellow-400' :
                         'bg-emerald-950/50 border-emerald-900 text-emerald-400'
                       }`}>
                         {selectedQuest.difficulty} Tier
                       </span>
                    </div>
                 </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 pt-10">
                 <h2 className="text-2xl font-bold text-white mb-2">{selectedQuest.title}</h2>
                 
                 <div className="flex gap-4 text-xs text-slate-500 font-mono mb-6 pb-6 border-b border-slate-800/50">
                    <span className="flex items-center gap-1"><Clock size={12}/> Posted: {new Date(selectedQuest.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1 text-emerald-400"><Trophy size={12}/> Reward: {selectedQuest.reward} XP</span>
                 </div>

                 <div className="prose prose-invert prose-sm max-w-none mb-8 text-slate-300">
                    <h4 className="text-white text-xs uppercase tracking-widest font-bold mb-2">Mission Briefing</h4>
                    <p className="whitespace-pre-wrap leading-relaxed bg-slate-900/50 p-4 rounded-lg border border-slate-800 max-h-[200px] overflow-y-auto custom-scrollbar">
                       {selectedQuest.description || "No specific briefing provided. Proceed with standard protocols."}
                    </p>
                    
                    {/* --- LINK KE DETAIL PROYEK CLIENT --- */}
                    {selectedQuest.projectId && (
                      <Link href={`/projects/${selectedQuest.projectId}`} className="inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300 mt-3 p-2 border border-blue-900/30 bg-blue-950/10 rounded-lg w-full justify-center transition-colors">
                         <FileText size={14} /> Open Client Project Dossier
                         <ExternalLink size={12} />
                      </Link>
                    )}
                 </div>

                 {/* Modal Actions */}
                 <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                    <button 
                       onClick={() => setIsDetailModalOpen(false)}
                       className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                    >
                       Close
                    </button>
                    
                    {/* LOGIC BUTTON: ACCEPT MISSION */}
                    {(selectedQuest.status === 'todo' || selectedQuest.status === 'open') && userRole === 'freelancer' && (
                       <button 
                          onClick={() => handleAcceptMission(selectedQuest.id)}
                          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95"
                       >
                          Accept Mission <Sword size={14} />
                       </button>
                    )}

                    {/* LOGIC BUTTON: SUBMIT LOOT */}
                    {(selectedQuest.status === 'in_progress') && userRole === 'freelancer' && (
                       <button 
                          onClick={() => {
                             setIsDetailModalOpen(false);
                             openLootModal(selectedQuest.id);
                          }}
                          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-emerald-900/20 flex items-center gap-2 transition-all active:scale-95"
                       >
                          Submit Loot <Upload size={14} />
                       </button>
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* --- MODAL 2: LOOT SUBMISSION --- */}
      {isLootModalOpen && selectedQuest && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                <button onClick={() => setIsLootModalOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                
                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Upload className="text-emerald-500" size={20} /> Loot Drop Protocol
                </h3>
                <p className="text-slate-400 text-sm mb-6">Proof of work is required for bounty release.</p>

                <form onSubmit={handleSubmitLoot} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Github Commit</label>
                        <div className="relative">
                            <Github className="absolute left-3 top-2.5 text-slate-500" size={16} />
                            <input 
                                type="url" required placeholder="https://github.com/..."
                                value={commitLink} onChange={(e) => setCommitLink(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-wider">Loom/Video Proof</label>
                        <div className="relative">
                            <Video className="absolute left-3 top-2.5 text-slate-500" size={16} />
                            <input 
                                type="url" required placeholder="https://loom.com/..."
                                value={videoLink} onChange={(e) => setVideoLink(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white focus:border-emerald-500 focus:outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={() => setIsLootModalOpen(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold uppercase">Cancel</button>
                        <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2">
                            {isSubmitting ? <Loader2 className="animate-spin" size={14}/> : 'Confirm Drop'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
}

// --- COLUMN SUB-COMPONENT ---
// FIX: Menambahkan destructuring props onDrop, onDragOver, onDragStart, onMove, onLoot
function Column({ title, status, icon: Icon, quests, color, headerColor, onDetail, actionLabel, onAction, userRole, isCaptain, onCaptainReview, onDrop, onDragOver, onDragStart, onMove, onLoot }: any) {
  return (
    <div 
        onDrop={(e) => onDrop && onDrop(e, status)}
        onDragOver={onDragOver}
        className={`flex-shrink-0 w-80 md:w-[22rem] bg-slate-900/40 rounded-xl flex flex-col border-t-2 ${color} h-full backdrop-blur-sm snap-center`}
    >
      <div className={`p-4 border-b border-slate-800/50 flex items-center justify-between ${headerColor} bg-slate-900/60 rounded-t-lg`}>
        <div className="flex items-center gap-2"><Icon size={16} /><h3 className="font-bold uppercase tracking-wider text-xs">{title}</h3></div>
        <span className="bg-slate-950 px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 border border-slate-800">{quests.length}</span>
      </div>

      <div className="p-3 space-y-3 overflow-y-auto flex-1 custom-scrollbar">
        {quests.map((quest: Quest) => (
          <div 
            key={quest.id} 
            draggable={userRole === 'captain' || (status !== 'review' && userRole === 'freelancer')}
            onDragStart={(e) => onDragStart && onDragStart(e, quest.id)}
            className={`bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl hover:bg-slate-800/80 hover:border-slate-600 transition-all group relative ${
                // Visual cue jika card bisa di-drag
                (userRole === 'captain' || (status !== 'review' && userRole === 'freelancer')) ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'
            }`}
          >
             
             {/* Status Badge */}
             <div className="flex justify-between items-start mb-2">
                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border ${
                    quest.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                    quest.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>{quest.difficulty}</span>
                {quest.assignee && (
                   <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[8px] font-bold text-white border border-slate-700" title={quest.assignee.name || ''}>
                      {quest.assignee.name?.[0]}
                   </div>
                )}
             </div>

             <h4 onClick={() => onDetail(quest)} className="text-slate-200 font-bold text-sm mb-2 cursor-pointer hover:text-blue-400 transition-colors line-clamp-2">{quest.title}</h4>
             
             <div className="flex items-center justify-between pt-3 border-t border-slate-700/30">
                <span className="text-[10px] font-mono text-emerald-500 font-bold">+{quest.reward} XP</span>
                
                {/* BUTTONS IN CARD */}
                <div className="flex gap-2">
                   <button onClick={() => onDetail(quest)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors" title="View Details">
                      <Eye size={14} />
                   </button>
                   
                   {/* Contextual Action Button */}
                   {actionLabel && onAction && userRole === 'freelancer' && (
                      <button onClick={() => onAction(quest)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] rounded font-bold uppercase transition-colors flex items-center gap-1">
                         Action <Target size={10} />
                      </button>
                   )}

                   {/* Add Start Button for Todo items if Freelancer */}
                   {status === 'todo' && userRole === 'freelancer' && onMove && (
                       <button onClick={() => onMove(quest.id, 'in_progress')} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] rounded font-bold uppercase transition-colors">
                           Start
                       </button>
                   )}
                </div>
             </div>

             {/* Captain Review Actions */}
             {isCaptain && status === 'review' && (
                <div className="mt-3 grid grid-cols-2 gap-2 pt-3 border-t border-slate-700/30">
                   <button onClick={() => onCaptainReview(quest.id, 'reject')} className="py-1.5 bg-red-900/30 text-red-400 hover:bg-red-900/50 border border-red-900/50 rounded text-[10px] font-bold uppercase flex justify-center gap-1">
                      <Hammer size={12}/> Retry
                   </button>
                   <button onClick={() => onCaptainReview(quest.id, 'approve')} className="py-1.5 bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 border border-emerald-900/50 rounded text-[10px] font-bold uppercase flex justify-center gap-1">
                      <Check size={12}/> Approve
                   </button>
                </div>
             )}
          </div>
        ))}
      </div>
    </div>
  );
}