import React from 'react';

/**
 * Menggunakan alias '@/' untuk resolusi jalur yang lebih stabil sesuai standar Next.js.
 * Memastikan prisma, auth, dan komponen lainnya ditemukan dengan benar oleh sistem build.
 */
import { prisma } from '../../lib/prisma'; 
import { auth } from '../../../auth'; 
import { 
  Briefcase, 
  Calendar, 
  Brain, 
  Shield, 
  Mail, 
  Building, 
  Fingerprint, 
  AtSign, 
  Edit3,
  Star,
  Zap,
  Activity,
  ChevronRight,
  Clock,
  Target,
  Terminal,
  Palette,
  Trophy,
  Award,
  Cpu,
  Layers,
  Code2,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';

/**
 * Komponen UI internal untuk Maskot (Inline untuk keandalan pratinjau)
 */
const FrogMascot = ({ mood, size }: { mood: string, size: string }) => (
  <div className={`flex items-center justify-center bg-slate-800 rounded-full border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.3)] ${size === 'lg' ? 'w-32 h-32 text-5xl' : 'w-12 h-12 text-xl'}`}>
    {mood === 'happy' ? '🐸✨' : '🐸'}
  </div>
);

/**
 * Mengimpor komponen dari direktori yang sama menggunakan alias absolut agar lebih aman bagi bundler.
 */
import { UpgradeButton } from '../../guild/profile/UpgradeButton';
import LaunchProjectButton from '../../guild/profile/LaunchProjectButton';

/**
 * Halaman Profil Identitas (Identity Page)
 * Pusat informasi untuk Client (Ringkasan Proyek) dan Freelancer (Statistik RPG).
 */
export default async function App() {
  const session = await auth();
  
  if (!session?.user?.email) {
    redirect('/login');
  }

  // Ambil data lengkap user termasuk log aktivitas dan proyek yang dimiliki
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      activities: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      ownedProjects: true // Data proyek jika user adalah Client
    }
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-mono text-xs italic bg-slate-950">
        [ERROR] IDENTITY_NOT_FOUND: Gagal melakukan sinkronisasi pangkalan data.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20 px-4 md:px-0 bg-slate-950 text-slate-200">
      
      {/* --- HEADER: Identitas Visual --- */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-10 pt-10">
        <div className="relative group">
          <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full group-hover:bg-green-500/40 transition-all duration-700"></div>
          <div className="relative z-10 border-4 border-slate-800 rounded-full p-2 bg-slate-900 shadow-2xl overflow-hidden">
            <FrogMascot mood={user.role === 'client' ? 'idle' : 'happy'} size="lg" />
          </div>
          <div className="absolute -bottom-2 right-4 bg-green-600 text-white p-2 rounded-full border-4 border-slate-950 shadow-lg z-20">
             <Shield size={16} />
          </div>
        </div>

        <div className="text-center md:text-left flex-1">
          <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-2 uppercase italic">{user.name}</h2>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4 font-mono">
            <span className="px-3 py-1 bg-slate-800 text-slate-400 border border-slate-700 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <Terminal size={12} className="text-green-500" /> ID: #{user.id.slice(-8).toUpperCase()}
            </span>
            <span className={`px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-widest ${
              user.role === 'client' 
              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
              : 'bg-green-500/10 text-green-400 border-green-500/20'
            }`}>
              Akses: {user.role?.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {user.role === 'client' && <LaunchProjectButton variant="ghost" />}
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl font-bold text-xs border border-slate-800 transition-all group shadow-lg shadow-black/50">
            <Edit3 size={14} className="group-hover:text-white transition-colors" /> Konfigurasi Profil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- KOLOM KIRI: Spesifikasi & Feed (Span 4) --- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Bio Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Layers size={60} />
             </div>
             <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Bio / Direktif</h4>
             <p className="text-sm text-slate-400 leading-relaxed italic">
               {user.bio || "Agen ini belum menetapkan direktif profil. Sinkronisasi identitas diperlukan untuk melengkapi biografi."}
             </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden text-left">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
             <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Fingerprint size={14} className="text-blue-500" /> Spesifikasi Teknis
             </h4>
             <div className="space-y-6">
                <InfoBlock icon={Mail} label="Alamat Email" value={user.email || 'N/A'} color="text-blue-400" />
                <InfoBlock icon={AtSign} label="Nama Kode" value={`@${user.username || 'unknown'}`} color="text-green-400" />
                <InfoBlock icon={Building} label="Organisasi" value={user.company || 'Agen Privat'} color="text-yellow-400" />
                <InfoBlock icon={Calendar} label="Mulai Operasi" value={new Date(user.createdAt).toLocaleDateString('id-ID', { month: 'short', year: 'numeric', day: 'numeric' })} color="text-purple-400" />
             </div>
          </div>

          {/* Achievements / Badges */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl text-left">
             <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Award size={14} className="text-yellow-500" /> Pencapaian Terkunci
             </h4>
             <div className="flex flex-wrap gap-3">
                <BadgeItem icon={Shield} label="Verified" color="text-blue-400" />
                <BadgeItem icon={Zap} label="Fast Ship" color="text-yellow-400" />
                <BadgeItem icon={Trophy} label="Early Adopter" color="text-purple-400" />
             </div>
          </div>

          {/* Intelligence Feed */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden text-left">
             <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50"></div>
             <h4 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <Activity size={14} className="text-red-500" /> Intelligence Feed
             </h4>
             <div className="space-y-4">
                {user.activities && user.activities.length > 0 ? (
                  user.activities.map((act) => (
                    <div key={act.id} className="border-l-2 border-slate-800 pl-4 py-1 relative group hover:border-blue-500/30 transition-colors">
                       <div className="absolute -left-[3.5px] top-2.5 w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-blue-500 transition-colors"></div>
                       <p className="text-[11px] text-slate-300 leading-tight mb-1">{act.detail}</p>
                       <span className="text-[9px] text-slate-600 font-mono flex items-center gap-1 uppercase tracking-tighter">
                          <Clock size={10} /> {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                       </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-slate-600 italic">Belum ada transmisi data masuk.</p>
                )}
             </div>
          </div>
        </div>

        {/* --- KOLOM KANAN: Statistik & Dashboard (Span 8) --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {user.role !== 'client' ? (
            /* VIEW A: FREELANCER (RPG STATS) */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                  <Star size={160} className="text-yellow-500" />
               </div>
               
               <div className="flex justify-between items-end mb-8 relative z-10 text-left">
                  <div>
                    <p className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.4em] mb-1">Freelancer Mode</p>
                    <h3 className="text-5xl font-black text-white tracking-tighter italic uppercase underline decoration-yellow-500/20 underline-offset-[12px]">Rank {user.level}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Progres XP Terkini</p>
                    <p className="text-xs font-mono font-bold text-white">{user.xp} / {user.maxXp}</p>
                  </div>
               </div>

               <div className="w-full h-4 bg-slate-950 rounded-full border border-slate-800 overflow-hidden mb-8 shadow-inner p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-600 via-yellow-400 to-emerald-500 shadow-[0_0_20px_rgba(234,179,8,0.3)] rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((user.xp / (user.maxXp || 1)) * 100, 100)}%` }}
                  ></div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10 text-left">
                  <StatDetail label="Logic (Kode)" value={user.logic || 0} color="text-blue-400" icon={Brain} />
                  <StatDetail label="Speed (Kinerja)" value={user.speed || 0} color="text-yellow-400" icon={Zap} />
                  <StatDetail label="Aesthetic (Visual)" value={user.aesthetic || 0} color="text-purple-400" icon={Palette} />
               </div>
            </div>
          ) : (
            /* VIEW B: CLIENT (MANAGED PROJECTS) */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group text-left">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-6 transition-transform">
                  <Target size={140} className="text-blue-500" />
               </div>
               
               <div className="flex justify-between items-center mb-6 relative z-10">
                 <h4 className="text-white font-bold flex items-center gap-2 text-xs uppercase tracking-[0.2em]">
                    <Target size={14} className="text-blue-500" /> Managed Projects
                 </h4>
                 <LaunchProjectButton />
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                  {user.ownedProjects && user.ownedProjects.length > 0 ? (
                    user.ownedProjects.map((p) => (
                      <div key={p.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex justify-between items-center group hover:border-blue-500/50 transition-all shadow-lg text-left">
                         <div className="min-w-0">
                            <p className="text-slate-200 font-bold text-sm truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-tighter">{p.status}</p>
                         </div>
                         <ChevronRight size={16} className="text-slate-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    ))
                  ) : (
                    <div className="sm:col-span-2 text-center py-10 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/30">
                       <p className="text-xs text-slate-600 italic uppercase tracking-widest mb-4">Belum ada deployment aktif</p>
                       <LaunchProjectButton />
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* Skill Specialization Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 text-left">
              <h4 className="text-white font-bold text-xs mb-4 flex items-center gap-2 uppercase tracking-widest">
                  <Code2 size={16} className="text-green-500" /> Core Specializations
              </h4>
              <div className="flex flex-wrap gap-2">
                  {['Next.js', 'TypeScript', 'Prisma', 'Tailwind CSS', 'NextAuth'].map(skill => (
                      <span key={skill} className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                          {skill}
                      </span>
                  ))}
                  <button className="px-3 py-1 border border-dashed border-slate-700 rounded-lg text-[10px] font-mono text-slate-600 uppercase hover:text-slate-400 transition-colors">+ Add Skill</button>
              </div>
          </div>

          {/* Upgrade Path (Hanya untuk Client) */}
          <UpgradeButton role={user.role || 'client'} />

          {/* Quick Nav Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <QuickNavLink 
                href={user.role === 'client' ? "/client" : "/guild"} 
                icon={Terminal} 
                title="Access Console" 
                desc="Buka Dashboard Utama" 
                color="indigo" 
              />
              <QuickNavLink 
                href="/guild/cryosleep" 
                icon={Clock} 
                title="Cryosleep" 
                desc="Pantau Stasis Proyek" 
                color="cyan" 
              />
          </div>

        </div>
      </div>
    </div>
  );
}

// --- SUB-KOMPONEN ---

function BadgeItem({ icon: Icon, label, color }: { icon: any, label: string, color: string }) {
    return (
        <div className="flex flex-col items-center gap-1 group cursor-help" title={label}>
            <div className={`p-2 bg-slate-950 rounded-xl border border-white/5 ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
            <span className="text-[8px] font-bold text-slate-600 uppercase tracking-tighter">{label}</span>
        </div>
    );
}

function InfoBlock({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className={`p-2.5 bg-slate-950 rounded-xl border border-white/5 ${color} bg-opacity-10 group-hover:scale-110 transition-transform shadow-sm`}>
        <Icon size={16} className={color} />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-none mb-1.5">{label}</p>
        <p className="text-sm text-slate-200 font-medium truncate font-mono" title={value}>{value}</p>
      </div>
    </div>
  );
}

function StatDetail({ label, value, color, icon: Icon }: { label: string, value: number, color: string, icon: any }) {
  return (
    <div className="group bg-slate-950/30 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all text-left">
      <div className="flex items-center gap-2 mb-3">
         <Icon size={14} className={color} />
         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">{label}</p>
      </div>
      <div className="flex items-end gap-1.5 justify-start">
        <span className={`text-3xl font-black ${color} tracking-tighter leading-none group-hover:scale-110 transition-transform`}>{value}</span>
        <span className="text-[9px] text-slate-700 font-black mb-1 italic uppercase tracking-widest">Pts</span>
      </div>
      <div className="w-full h-1 bg-slate-900 rounded-full mt-4 overflow-hidden border border-white/5">
        <div 
          className={`h-full ${color.replace('text-', 'bg-')} opacity-60 transition-all duration-1000 shadow-[0_0_8px_currentColor]`} 
          style={{ width: `${Math.min(value, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function QuickNavLink({ href, icon: Icon, title, desc, color }: any) {
    const colorMap: any = {
        indigo: 'from-indigo-900/20 to-blue-900/20 border-indigo-500/20 text-indigo-400',
        cyan: 'from-cyan-900/20 to-blue-900/20 border-cyan-500/20 text-cyan-400',
    };

    return (
        <Link 
            href={href} 
            className={`bg-gradient-to-r ${colorMap[color]} border rounded-2xl p-6 flex items-center justify-between group hover:scale-[1.02] transition-all shadow-lg shadow-black/40 text-left`}
        >
            <div className="flex items-center gap-4">
                <div className={`p-3 bg-slate-900/50 rounded-xl border border-white/5 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className={colorMap[color].split(' ').pop()} />
                </div>
                <div className="text-left">
                    <h4 className="text-white font-bold text-sm uppercase tracking-tight italic">{title}</h4>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{desc}</p>
                </div>
            </div>
            <ChevronRight size={16} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </Link>
    );
}