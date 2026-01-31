import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { auth } from '../../../auth';
import { prisma } from '../../../app/lib/prisma';
import { 
  Shield, 
  Target, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  ArrowLeft,
  Briefcase,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

// ERROR FIX: Update Tipe Data untuk Next.js 15+
// params sekarang adalah Promise, bukan object langsung.
interface ProjectDetailPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

export default async function ProjectDetailPage(props: ProjectDetailPageProps) {
  // ERROR FIX: Await params sebelum digunakan
  const params = await props.params;
  
  const session = await auth();
  if (!session?.user) redirect('/login');

  // Ambil data detail proyek beserta client dan quests
  const project = await prisma.project.findUnique({
    where: { id: params.projectId }, // Sekarang params.projectId sudah ada nilainya
    include: {
      client: {
        select: {
          name: true,
          email: true,
          image: true,
          company: true,
        }
      },
      quests: {
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: {
            select: { name: true, image: true }
          }
        }
      }
    }
  });

  if (!project) notFound();

  // Kita ambil deskripsi dari Quest Utama (biasanya quest pertama yang dibuat sistem)
  const mainQuest = project.quests[project.quests.length - 1]; // Quest paling awal (created first)
  const projectBrief = mainQuest?.description || "No mission brief available. Check specific quest tickets.";

  return (
    <div className="min-h-screen bg-black text-slate-200 p-6 md:p-10 font-sans animate-in fade-in duration-500">
      
      {/* Header / Navigation */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link href="/quests" className="inline-flex items-center text-slate-500 hover:text-white transition-colors mb-6 text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={14} className="mr-2" /> Back to Command Center
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
                project.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {project.status}
              </span>
              <span className="text-slate-500 text-xs font-mono">ID: {project.id.slice(-8).toUpperCase()}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase mb-2">
              {project.name}
            </h1>
            <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
              <Clock size={14} /> Created on {project.createdAt.toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 shadow-lg">
            <div className="text-right hidden md:block">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-0.5">Client Identity</p>
              <p className="text-sm font-bold text-white">{project.client?.name || 'Unknown'}</p>
              <p className="text-[10px] text-slate-400">{project.client?.company || 'Corporation'}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl border-2 border-slate-800 shadow-inner">
              {project.client?.name?.charAt(0) || 'C'}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Mission Brief */}
          <section className="bg-slate-900/30 border border-slate-800/60 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-transparent opacity-50"></div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                <FileText size={20} />
              </div>
              Mission Directives
            </h2>
            
            <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed font-mono">
              <div className="whitespace-pre-wrap bg-black/20 p-6 rounded-xl border border-slate-800/50 shadow-inner">
                {projectBrief}
              </div>
            </div>
          </section>

          {/* Quests List */}
          <section>
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2 px-2">
              <Target className="text-emerald-500" size={18} /> Operational Objectives
            </h3>
            <div className="space-y-3">
              {project.quests.map((quest) => (
                <div key={quest.id} className="group bg-slate-900 border border-slate-800 p-5 rounded-2xl flex justify-between items-center hover:border-slate-600 hover:bg-slate-800/80 transition-all cursor-default">
                  <div className="flex items-center gap-5">
                    <div className={`p-3 rounded-xl transition-colors ${
                      quest.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-200'
                    }`}>
                      {quest.status === 'done' ? <CheckCircle size={20} /> : <Target size={20} />}
                    </div>
                    <div>
                      <h4 className={`font-bold text-sm mb-1 ${quest.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-white'}`}>
                        {quest.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                          quest.difficulty === 'hard' ? 'bg-red-900/30 text-red-400' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {quest.difficulty}
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono tracking-wider">+{quest.reward} XP</span>
                      </div>
                    </div>
                  </div>
                  {quest.assignedTo && (
                    <div className="flex items-center gap-3 bg-black/20 px-3 py-1.5 rounded-full border border-slate-800/50">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">Agent</span>
                      <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-slate-900">
                        {quest.assignedTo.name?.charAt(0)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          
          {/* Budget / Rewards */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <DollarSign size={100} className="text-emerald-500" />
            </div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Briefcase size={14} /> Contract Value
            </h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-black text-white tracking-tighter">${project.retainerFee}</span>
              <span className="text-sm text-slate-500 font-bold">USD</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Total retainer value locked in smart contract. Released upon completion.
            </p>
            
            <div className="pt-6 border-t border-slate-800/50 flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">Emergency Rate</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/20">
                ${project.emergencyRate}/hr
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
             <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Shield size={14} /> Protocol Actions
            </h3>
            <div className="space-y-2">
              <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                <FileText size={14} /> Download Assets
              </button>
              <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                <ExternalLink size={14} /> View External Brief
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}