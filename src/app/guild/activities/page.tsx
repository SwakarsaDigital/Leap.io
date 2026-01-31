import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '../../../auth';
import { prisma } from '../../../app/lib/prisma';
import { 
  Clock, 
  ArrowLeft, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Layout, 
  Briefcase 
} from 'lucide-react';

export default async function ClientHistoryPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  // Ambil user dan semua project-nya
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      ownedProjects: {
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { quests: true }
          }
        }
      }
    }
  });

  if (!user) redirect('/login');

  const projects = user.ownedProjects || [];

  return (
    <div className="min-h-screen bg-black text-slate-200 p-6 md:p-10 font-sans animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-10">
        <Link href="/client" className="inline-flex items-center text-slate-500 hover:text-white transition-colors mb-6 text-xs font-bold uppercase tracking-widest">
          <ArrowLeft size={14} className="mr-2" /> Back to War Room
        </Link>
        
        <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-blue-500">
            <Clock size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Deployment History</h1>
            <p className="text-slate-400 text-sm">Archived log of all operations initialized by {user.company || 'Command'}.</p>
          </div>
        </div>
      </div>

      {/* Project Timeline List */}
      <div className="max-w-4xl mx-auto space-y-6">
        {projects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-3xl">
            <Layout size={40} className="mx-auto text-slate-700 mb-4" />
            <h3 className="text-lg font-bold text-slate-500">No History Found</h3>
            <p className="text-xs text-slate-600 mt-2">Initialize your first project to see it here.</p>
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all group relative overflow-hidden">
              {/* Status Stripe */}
              <div className={`absolute left-0 top-0 w-1.5 h-full ${
                project.status === 'active' ? 'bg-green-500' : 
                project.status === 'completed' ? 'bg-blue-500' : 'bg-slate-700'
              }`}></div>

              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 pl-4">
                
                {/* Project Info */}
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-widest border ${
                       project.status === 'active' ? 'bg-green-950/30 text-green-400 border-green-500/20' : 
                       'bg-slate-800 text-slate-400 border-slate-600'
                    }`}>
                      {project.status}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">#{project.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Clock size={12} /> {new Date(project.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center gap-1"><Briefcase size={12} /> Budget: ${project.retainerFee}</span>
                  </div>
                </div>

                {/* Stats & Action */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Quests</p>
                    <p className="text-lg font-mono font-bold text-white">{project._count.quests}</p>
                  </div>
                  
                  <Link href={`/projects/${project.id}`} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors border border-slate-700">
                    <FileText size={14} /> Dossier
                  </Link>
                </div>

              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}