'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Lock, Loader2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: string;
  updatedAt: Date | string;
}

export default function ClientProjectCard({ project }: { project: Project }) {
  const router = useRouter();

  // Helper untuk membersihkan status (case-insensitive & trim whitespace)
  const normalizedStatus = project.status ? project.status.trim().toLowerCase() : 'unknown';

  const handleClick = () => {
    // Logika akses berdasarkan status
    if (normalizedStatus === 'completed' || normalizedStatus === 'done' || normalizedStatus === 'finished') {
      // Jika status selesai, izinkan akses ke halaman detail
      router.push(`/projects/${project.id}`);
    } else if (normalizedStatus === 'review' || normalizedStatus === 'loot_review') {
      alert(`🔒 ACCESS DENIED: Project "${project.name}" is currently under review by Mission Control. Please wait for Captain's validation.`);
    } else if (normalizedStatus === 'maintenance') {
        alert(`🛠️ MAINTENANCE: Project "${project.name}" is undergoing scheduled maintenance.`);
    } else {
      // Default (in_progress, combat, todo, open, dll)
      alert(`⚠️ DEPLOYMENT ACTIVE: Project "${project.name}" is currently in progress. The squad is working on objectives.`);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'completed':
      case 'done':
      case 'finished':
        return {
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/20',
          icon: <CheckCircle2 size={14} className="text-emerald-500" />,
          label: 'COMPLETED'
        };
      case 'review':
      case 'loot_review':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          icon: <Clock size={14} className="text-yellow-500" />,
          label: 'UNDER REVIEW'
        };
      case 'maintenance':
        return {
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20',
            icon: <AlertTriangle size={14} className="text-orange-500" />,
            label: 'MAINTENANCE'
        };
      default: // in_progress, combat, open, todo
        return {
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/20',
          icon: <Loader2 size={14} className="text-blue-500 animate-spin" />,
          label: 'IN PROGRESS'
        };
    }
  };

  const config = getStatusConfig(normalizedStatus);

  return (
    <div 
      onClick={handleClick}
      className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl group hover:border-blue-500/40 transition-all cursor-pointer relative overflow-hidden"
    >
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex justify-between items-start mb-3 relative z-10">
        <h5 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors truncate pr-4">
          {project.name}
        </h5>
        
        {config.label === 'COMPLETED' ? (
           <div className="p-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
              <ArrowUpRight size={14} className="text-emerald-500" />
           </div>
        ) : (
           <Lock size={14} className="text-slate-600 group-hover:text-slate-400" />
        )}
      </div>

      <div className="flex justify-between items-center relative z-10">
        <span className={`text-[9px] pl-1.5 pr-2 py-0.5 rounded-full font-mono font-bold tracking-tighter border flex items-center gap-1.5 ${config.bg} ${config.color} ${config.border}`}>
            {config.icon}
            {config.label}
        </span>
        <span className="text-[10px] text-slate-600 font-mono">
           ID: #{project.id.slice(-4).toUpperCase()}
        </span>
      </div>
    </div>
  );
}