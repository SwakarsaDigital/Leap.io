import React from 'react';
import { Brain, Zap, Trophy, History, Star, AlertCircle, LogOut, Bot, Terminal, ChevronRight, Sparkles } from 'lucide-react';
import { FrogMascot } from '@/components/ui/FrogMascot';
import { prisma } from './../lib/prisma'; 
import { auth, signOut } from '../../auth';
import Link from 'next/link';

/**
 * Guild Hall Page
 * Displays user stats, RPG attributes, and provides access to the AI Recruitment system.
 */
export default async function GuildPage() {
  // 1. Get Session (NextAuth v5)
  const session = await auth();

  // 2. Page Level Protection
  if (!session?.user?.email) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
        <AlertCircle className="text-red-500 mb-4" size={48} />
        <h2 className="text-2xl font-bold">Session Expired</h2>
        <p className="text-slate-400 mt-2 mb-6">Your identity could not be verified.</p>
        <Link href="/login" className="bg-green-600 px-6 py-2 rounded-lg font-bold hover:bg-green-500 transition-all">
          Return to Login
        </Link>
      </div>
    );
  }

  // 3. Fetch user data from Database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email }, 
    include: {
      activities: { 
        orderBy: { createdAt: 'desc' }, 
        take: 3 
      },
    },
  });

  // 4. Identity Sync Check
  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
        <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20">
            <AlertCircle className="text-yellow-500" size={40} />
        </div>
        <h2 className="text-2xl font-bold">Identity Out of Sync</h2>
        <p className="text-slate-400 mt-2 max-w-md mx-auto">
          You are authenticated, but your freelancer profile hasn't been initialized in our records yet.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
            <form action={async () => { "use server"; await signOut({ redirectTo: '/login' }); }}>
                <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-all border border-slate-700">
                    <LogOut size={16} /> Sign Out & Retry
                </button>
            </form>
        </div>
      </div>
    );
  }

  // 5. Main Dashboard Render
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-700 pb-20">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
           <h2 className="text-3xl font-bold text-white tracking-tight">Guild Hall</h2>
           <p className="text-slate-400 text-sm mt-1 font-medium">Welcome back, Agent {user.username || user.name}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 rounded-full text-[10px] font-mono font-bold flex items-center gap-2 tracking-widest">
                <Trophy size={12} />
                {user.level > 10 ? 'PLATINUM TIER' : 'GOLD TIER'}
            </span>
             <span className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-xs font-mono">
                ID: #{user.id.slice(-6).toUpperCase()}
            </span>
        </div>
      </div>

      {/* Hero Card (Profile) */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/50 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 mb-8 relative overflow-hidden group shadow-2xl">
        
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/10 transition-all duration-1000 pointer-events-none"></div>

        <div className="relative z-10 shrink-0">
             <FrogMascot mood="happy" size="lg" />
             <div className="absolute -bottom-2 -right-2 bg-slate-950 text-[10px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-300 flex items-center gap-1 font-bold uppercase tracking-tighter shadow-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Online
             </div>
        </div>
        
        <div className="flex-1 w-full relative z-10 text-left">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-6 gap-4">
            <div>
              <h3 className="text-3xl font-black text-white tracking-tight">{user.name}</h3>
              <p className="text-slate-400 flex items-center gap-2 text-sm uppercase font-bold tracking-widest mt-1">
                <Star size={12} className="text-yellow-500 fill-yellow-500"/> {user.role}
              </p>
            </div>
            <div className="text-left md:text-right">
              <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600 drop-shadow-sm">
                LVL {user.level}
              </span>
            </div>
          </div>
          
          {/* XP Bar */}
          <div className="relative w-full h-5 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner group/xp">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]"></div>
             
            <div 
              className="bg-gradient-to-r from-green-600 via-green-400 to-emerald-500 h-full transition-all duration-1000 ease-out relative" 
              style={{ width: `${Math.min((user.xp / user.maxXp) * 100, 100)}%` }}
            >
                <div className="absolute top-0 right-0 bottom-0 w-1 bg-white/40 shadow-[0_0_15px_white]"></div>
            </div>
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">
             <span>Current XP: {user.xp}</span>
             <span className="text-green-500/80">Next Level: {user.maxXp} XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Logic" subLabel="Code Quality" value={user.logic} icon={Brain} color="text-blue-400" borderColor="border-blue-500/20" />
            <StatCard label="Speed" subLabel="Velocity" value={user.speed} icon={Zap} color="text-yellow-400" borderColor="border-yellow-500/20" />
            <StatCard label="Aesthetic" subLabel="UI/UX Design" value={user.aesthetic} icon={Trophy} color="text-purple-400" borderColor="border-purple-500/20" />
        </div>

        {/* Recent Activity */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 h-full flex flex-col shadow-xl text-left">
            <h4 className="text-white font-bold flex items-center gap-2 mb-6 uppercase text-xs tracking-[0.2em] text-slate-400">
                <History size={14} /> System Logs
            </h4>
            
            {user.activities.length === 0 ? (
                <div className="text-xs text-slate-600 italic flex-1 flex flex-col items-center justify-center gap-2 opacity-50">
                    <Terminal size={24} />
                    <span>No logs detected.</span>
                </div>
            ) : (
                <div className="space-y-5">
                    {user.activities.map((activity) => (
                        <div key={activity.id} className="flex gap-4 items-start pb-4 border-b border-slate-800/50 last:border-0 last:pb-0 group/log">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-2 group-hover/log:bg-green-500 transition-colors shrink-0"></div>
                            <div className="flex-1">
                                <p className="text-slate-200 text-xs font-bold leading-tight group-hover/log:text-white transition-colors">{activity.action}</p>
                                <p className="text-slate-500 text-[10px] mt-1 font-mono uppercase tracking-tighter">{activity.detail}</p>
                            </div>
                            <div className="ml-auto text-right whitespace-nowrap">
                                {activity.xpGained > 0 && (
                                  <span className="text-green-500 text-[10px] font-mono font-black bg-green-500/10 px-2 py-1 rounded border border-green-500/20">
                                    +{activity.xpGained} XP
                                  </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            <Link href="/guild/activities" className="mt-6 text-[10px] font-bold text-slate-500 hover:text-green-400 transition-colors flex items-center justify-center gap-2 uppercase tracking-widest border-t border-slate-800 pt-4 no-underline">
                View Full History <History size={12} />
            </Link>
        </div>
      </div>

      {/* FOOTER CTA SECTION (RECRUITMENT) */}
      <div className="mt-12 bg-indigo-600/10 border border-indigo-500/30 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
            <Bot size={180} className="text-indigo-400" />
         </div>

         <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
                    <div className="relative border-4 border-indigo-500/50 rounded-full p-1 bg-slate-900 shadow-2xl">
                        <FrogMascot mood="happy" size="md" />
                    </div>
                </div>
                <div className="text-left">
                    <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">AI Recruitment System</h3>
                    <p className="text-indigo-200/60 text-sm max-w-sm mt-1">
                      Ready to start a new mission? Sync your profile with the global client database via Leap-v1.
                    </p>
                </div>
            </div>

            <Link 
              href="/?view=recruiter" 
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-900/40 group/btn border border-indigo-400/50 no-underline whitespace-nowrap active:scale-95"
            >
                Start Recruitment
                <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
         </div>
      </div>

    </div>
  );
}

function StatCard({ label, subLabel, value, icon: Icon, color, borderColor }: any) {
  return (
    <div className={`bg-slate-900/60 border ${borderColor} p-6 rounded-2xl transition-all duration-500 group hover:-translate-y-1 relative overflow-hidden shadow-lg text-left`}>
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className={`p-2.5 rounded-xl bg-slate-950 ${color} bg-opacity-10 border border-slate-800 shadow-inner group-hover:scale-110 transition-transform`}>
              <Icon size={20} className={color} />
          </div>
          <span className={`text-3xl font-black ${color} tracking-tighter`}>{value}</span>
        </div>
        <div>
            <p className="text-white font-bold text-xs uppercase tracking-wider">{label}</p>
            <p className="text-slate-500 text-[10px] uppercase font-medium mt-0.5">{subLabel}</p>
        </div>
        <div className="w-full bg-slate-950 h-1.5 rounded-full mt-5 overflow-hidden border border-slate-800/50 shadow-inner">
            <div 
                className={`h-full ${color.replace('text-', 'bg-')} opacity-70 transition-all duration-1000`} 
                style={{ width: `${value}%` }}
            ></div>
        </div>
      </div>
      <div className={`absolute -bottom-4 -right-4 opacity-5 ${color} transition-opacity group-hover:opacity-10`}>
         <Icon size={80} />
      </div>
    </div>
  );
}