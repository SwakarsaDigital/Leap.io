import React from 'react';
import { 
  Shield, 
  Target, 
  Zap, 
  MessageSquare, 
  Bot, 
  PlusCircle, 
  Activity, 
  ArrowUpRight,
  TrendingUp,
  Clock,
  Layout,
  ChevronRight
} from 'lucide-react';

/**
 * Menggunakan alias '@/' untuk impor adalah standar Next.js yang lebih aman.
 * Jika konfigurasi alias belum aktif, Anda bisa mengubahnya kembali ke relative path 
 * setelah memastikan letak filenya tepat.
 */
import { auth } from '../../auth';
import { prisma } from './../lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AiRecruiter from './../components/landing/AiRecruiter';

/**
 * Dashboard Utama untuk Client (Role: client)
 * Halaman ini menangani visualisasi proyek, monitoring aktivitas,
 * dan antarmuka AI Recruiter untuk mencari bakat baru.
 */
export default async function ClientDashboard() {
  const session = await auth();
  
  // Keamanan: Jika sesi tidak ditemukan atau email kosong, arahkan kembali ke login
  if (!session?.user?.email) redirect('/login');

  // Ambil data Client & Proyek milik mereka dari database
  const clientData = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      ownedProjects: {
        orderBy: { updatedAt: 'desc' }
      },
      // Menghitung jumlah pesan keluar untuk statistik
      _count: {
        select: { sentMessages: true }
      }
    }
  });

  // Validasi jika data user tidak ditemukan di database
  if (!clientData) redirect('/login');

  // Mengamankan akses variabel untuk menghindari error tipe data
  const projects = clientData.ownedProjects || [];
  const messageCount = clientData._count?.sentMessages || 0;

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in duration-1000 pb-20 px-4 md:px-0">
      
      {/* --- BAGIAN 1: HEADER & NAVIGASI --- */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-[10px] font-mono font-bold uppercase tracking-widest">
              Secure Session Active
            </span>
          </div>
          <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3 italic">
            <Shield className="text-blue-500 fill-blue-500/10" size={32} /> THE WAR ROOM
          </h2>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.3em] mt-2">
            Command Center // {clientData.company || 'Direct Operation'}
          </p>
        </div>
        
        <div className="flex gap-3 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none bg-slate-900 hover:bg-slate-800 text-slate-300 px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all border border-slate-800">
            <Clock size={16} /> History
          </button>
          <button className="flex-1 lg:flex-none bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/40">
            <PlusCircle size={16} /> Launch New Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- BAGIAN 2: KOLOM KIRI (STATISTIK & AI) --- */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <QuickStat 
              label="Proyek Aktif" 
              value={projects.length} 
              icon={Target} 
              color="text-blue-400" 
              borderColor="border-blue-500/20"
            />
            <QuickStat 
              label="Tautan Langsung" 
              value={messageCount} 
              icon={MessageSquare} 
              color="text-green-400" 
              borderColor="border-green-500/20"
            />
            <QuickStat 
              label="Level Strategi" 
              value="T-1" 
              icon={TrendingUp} 
              color="text-purple-400" 
              borderColor="border-purple-500/20"
            />
          </div>

          {/* AI RECRUITER TERMINAL */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-transparent"></div>
            
            <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                  <Bot className="text-indigo-400" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm uppercase tracking-tight">AI Recruitment Terminal</h3>
                  <p className="text-[10px] text-slate-500 font-mono tracking-tighter">Memindai basis data global untuk talenta elit...</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-mono text-green-500 uppercase font-bold tracking-widest">Uplink Stable</span>
              </div>
            </div>
            
            <div className="p-0 min-h-[500px] bg-black/20">
               <AiRecruiter userEmail={clientData.email || ''} />
            </div>
          </div>
        </div>

        {/* --- BAGIAN 3: KOLOM KANAN (PROYEK & UPGRADE) --- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* List Proyek Aktif */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <h4 className="text-white font-bold mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <Layout size={14} className="text-blue-500" /> Deployment Aktif
            </h4>
            
            {projects.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-2xl">
                <p className="text-xs text-slate-600 italic px-4">
                  Tidak ada proyek aktif. Berikan arahan ke AI untuk memobilisasi squad pertama Anda.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl group hover:border-blue-500/40 transition-all cursor-pointer">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{project.name}</h5>
                      <ArrowUpRight size={14} className="text-slate-600 group-hover:text-blue-400" />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold tracking-tighter border ${
                        project.status === 'maintenance' 
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                      }`}>
                        {project.status.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-600 font-mono">ID: #{project.id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button className="w-full mt-6 py-3 border border-slate-800 rounded-xl text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all">
              Kelola Semua Aset
            </button>
          </div>

          {/* Intelligence Feed */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6">
            <h4 className="text-white font-bold mb-6 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <Activity size={14} /> Intelligence Feed
            </h4>
            <div className="space-y-4">
               <LogItem time="2 menit lalu" text="Agen baru teridentifikasi untuk Project: Revamp" />
               <LogItem time="1 jam lalu" text="Tautan aman dibuat dengan squad freelancer" />
               <LogItem time="4 jam lalu" text="Identitas terinisialisasi: Akses Portal Client diberikan" />
            </div>
          </div>

          {/* Jalur Upgrade ke Freelancer */}
          <div className="bg-gradient-to-br from-green-600/10 to-emerald-600/10 border border-green-500/20 rounded-3xl p-8 relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap size={80} className="text-green-500" />
             </div>
             <div className="relative z-10">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Zap size={18} className="text-green-400 fill-green-400/20" /> Developer Mode
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  Ingin mengambil quest, membangun fitur, dan mendapatkan XP sendiri? Aktifkan identitas Freelancer Anda di halaman profil.
                </p>
                <Link href="/guild/profile" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg transition-all shadow-lg shadow-green-900/40 group">
                    Inisialisasi Profil <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/**
 * Komponen Kecil untuk Statistik Dashboard
 */
function QuickStat({ label, value, icon: Icon, color, borderColor }: any) {
  return (
    <div className={`bg-slate-900 border ${borderColor} p-5 rounded-2xl flex flex-col items-center text-center group hover:-translate-y-1 transition-all`}>
      <Icon size={20} className={`${color} mb-3 opacity-80 group-hover:scale-110 transition-transform`} />
      <span className="text-2xl font-black text-white tracking-tighter mb-1">{value}</span>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
    </div>
  );
}

/**
 * Komponen Baris Log Aktivitas
 */
function LogItem({ time, text }: { time: string, text: string }) {
  return (
    <div className="flex gap-3 items-start group">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 group-hover:bg-blue-500 transition-colors"></div>
      <div>
        <p className="text-[11px] text-slate-300 leading-tight group-hover:text-white transition-colors">{text}</p>
        <span className="text-[9px] text-slate-600 font-mono">{time}</span>
      </div>
    </div>
  );
}