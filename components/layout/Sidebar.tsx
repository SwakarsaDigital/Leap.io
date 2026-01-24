'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Sword, 
  FlaskConical, 
  ShieldCheck, 
  User, 
  Zap, 
  ShieldAlert,
  LogOut,
  Activity,
  Bot,
  MessageSquare,
  ChevronRight,
  Loader2
} from 'lucide-react';

/**
 * Menggunakan path relatif untuk import yang stabil.
 */
import { logout } from '../../src/app/lib/auth-actions'; 
import { getRecentChatPartners } from '../../src/app/lib/actions';

interface SidebarProps {
  userRole?: string; // 'client', 'freelancer', atau 'captain'
}

/**
 * Komponen Utama Sidebar: App
 * Mengelola navigasi operasional dan akses cepat ke jalur komunikasi (Uplinks).
 */
export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname(); // Menggunakan hook bawaan Next.js
  const [activePartners, setActivePartners] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  // Sinkronisasi data partner chat terbaru
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const partners = await getRecentChatPartners();
        setActivePartners(partners);
      } catch (error) {
        console.error("Gagal sinkronisasi data uplink:", error);
      } finally {
        setIsLoadingChats(false);
      }
    };

    fetchPartners();
  }, []);

  // 1. Tentukan item menu berdasarkan Peran Pengguna
  let menuItems: any[] = [];

  if (userRole === 'client') {
    // MENU KHUSUS CLIENT (Project Owner)
    menuItems = [
      { id: 'menu-war-room', href: '/client', label: 'War Room', icon: ShieldCheck },
      { id: 'menu-ai-recruiter', href: '/?view=recruiter', label: 'AI Recruiter', icon: Zap, isSpecial: true },
      { id: 'menu-profile', href: '/guild/profile', label: 'Identity Profile', icon: User },
    ];
  } else {
    // MENU KHUSUS FREELANCER / KAPTEN
    menuItems = [
      { id: 'menu-guild-hall', href: '/guild', label: 'Guild Hall', icon: LayoutDashboard },
      { id: 'menu-quest-board', href: '/quests', label: 'Quest Board', icon: Sword },
      { id: 'menu-cryosleep', href: '/guild/cryosleep', label: 'Cryosleep', icon: Activity },
      { id: 'menu-lab', href: '/lab', label: 'The Lab', icon: FlaskConical },
      { id: 'menu-recruitment-hub', href: '/?view=recruiter', label: 'Recruitment Hub', icon: Bot, isSpecial: true },
      // Update: Mengarah ke halaman Inbox Utama
      { 
        id: 'menu-client-comms',
        href: '/guild/messages', 
        label: 'Comms Terminal', 
        icon: MessageSquare,
        // Tidak didisable agar user selalu bisa cek inbox
        disabled: false 
      },
      { id: 'menu-profile', href: '/guild/profile', label: 'Identity Profile', icon: User },
    ];
    
    if (userRole === 'captain') {
      menuItems.push({ 
        id: 'menu-captain-bridge',
        href: '/captain', 
        label: "Captain's Bridge", 
        icon: ShieldAlert, 
        isAdmin: true 
      });
    }
  }

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen flex flex-col p-4 fixed left-0 top-0 z-50 shadow-2xl font-sans text-left">
      {/* Branding Header */}
      <Link href="/" className="flex items-center gap-3 mb-10 px-2 group cursor-pointer no-underline">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center font-black text-black group-hover:rotate-12 transition-all shadow-lg shadow-green-900/20">
          L
        </div>
        <h1 className="text-xl font-black text-white tracking-tighter group-hover:text-green-400 transition-colors uppercase italic">Leap.io</h1>
      </Link>

      {/* Navigasi Utama */}
      <nav className="space-y-1 overflow-y-auto custom-scrollbar pr-1 max-h-[50%]">
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] mb-2 px-4">Operations</p>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const activeStyle = userRole === 'client' 
            ? 'bg-blue-600/10 text-blue-400 border-blue-500/20 shadow-inner' 
            : 'bg-green-600/10 text-green-400 border-green-500/20 shadow-inner';

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm group no-underline border border-transparent ${
                isActive ? activeStyle : 'text-slate-500 hover:bg-slate-800 hover:text-slate-200'
              } ${item.isSpecial ? 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10' : ''} ${item.isAdmin ? 'mt-8 border-red-900/30 text-red-500/60 hover:text-red-400' : ''} ${item.disabled ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
              aria-disabled={item.disabled}
              onClick={(e) => item.disabled && e.preventDefault()}
            >
              <item.icon size={18} className={`${isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
              <div className="flex flex-col">
                <span>{item.label}</span>
                {item.description && <span className="text-[8px] text-slate-600 font-normal uppercase tracking-tighter">{item.description}</span>}
              </div>
              {item.badge && (
                <span className="ml-auto bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* SEKSI ACTIVE UPLINKS (Daftar Chat Aktif) */}
      <div className="mt-8 flex-1 overflow-y-auto custom-scrollbar pr-1 border-t border-slate-800/50 pt-6">
        <div className="flex items-center justify-between px-4 mb-4">
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">Active Uplinks</p>
            {!isLoadingChats && activePartners.length > 0 && (
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
            )}
        </div>

        <div className="space-y-1">
          {isLoadingChats ? (
            <div className="px-4 py-2 space-y-3 opacity-20">
                <div className="h-8 bg-slate-800 rounded-lg animate-pulse"></div>
                <div className="h-8 bg-slate-800 rounded-lg animate-pulse w-3/4"></div>
            </div>
          ) : activePartners.length > 0 ? (
            activePartners.map((partner) => {
              // Tentukan URL berdasarkan role:
              // Client -> /client/chat/[freelancerId]
              // Freelancer -> /guild/messages/[clientId]
              const chatUrl = userRole === 'client' 
                ? `/client/chat/${partner.id}`
                : `/guild/messages/${partner.id}`;

              return (
                <Link
                  key={`uplink-${partner.id}`}
                  href={chatUrl}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group no-underline border border-transparent hover:bg-slate-800 ${
                    pathname.includes(partner.id) ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="w-8 h-8 bg-slate-950 rounded-full flex items-center justify-center text-[10px] font-bold border border-slate-800 shadow-inner group-hover:border-blue-500/50 transition-colors shrink-0">
                    {partner.name?.substring(0, 1).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{partner.name || 'Unknown Agent'}</p>
                      <p className="text-[8px] text-slate-600 uppercase font-mono tracking-tighter">Connected</p>
                  </div>
                  <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })
          ) : (
            /* Area kosong jika belum ada partner chat */
            <div className="px-4 py-6 text-center border-2 border-dashed border-slate-800/50 rounded-2xl mx-2 bg-slate-950/20 group hover:border-indigo-500/30 transition-all duration-500">
                <Bot size={24} className="mx-auto text-slate-700 mb-3 group-hover:text-indigo-500 transition-colors" />
                <p className="text-[10px] text-slate-600 leading-relaxed italic px-2">
                    No active transmissions. Use <span className="text-indigo-400 font-bold">AI Recruiter</span> to start.
                </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Area: Indikator Status & Logout */}
      <div className="mt-auto space-y-4 pt-4 border-t border-slate-800">
        <div className="p-4 bg-slate-950/50 rounded-2xl border border-white/5 shadow-inner">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] mb-2 text-left">Authenticated As</p>
          <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${userRole === 'client' ? 'bg-blue-400' : 'bg-green-400'}`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${userRole === 'client' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-white uppercase tracking-wider">
                  {userRole === 'client' ? 'Project Owner' : userRole || 'Agent'}
                </span>
                <span className="text-[8px] text-slate-500 font-mono italic tracking-tighter uppercase">Leap-OS v4.2.0</span>
              </div>
          </div>
        </div>

        <button 
            onClick={() => logout()} 
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-900/10 rounded-xl transition-all text-sm font-bold group border border-transparent"
        >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            Logout Terminal
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </aside>
  );
}