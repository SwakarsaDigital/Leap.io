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
  Target,
  Terminal,
  Cpu,
  Loader2,
  Users,
  LucideIcon
} from 'lucide-react';

import { logout } from '../../src/app/lib/auth-actions'; 
import { getRecentChatPartners } from '../../src/app/lib/actions';

interface SidebarProps {
  userRole?: string; // 'client', 'freelancer', atau 'captain'
}

interface MenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
  desc: string;
  isSpecial?: boolean;
  isAdmin?: boolean;
}

/**
 * Sidebar Terpadu dengan Struktur Routing Konsisten
 * Client -> /client/*
 * Freelancer -> /guild/*
 * Captain -> /captain/*
 */
export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [activePartners, setActivePartners] = useState<any[]>([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sinkronisasi Uplink (Chat Aktif)
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const partners = await getRecentChatPartners();
        setActivePartners(partners);
      } catch (error) {
        console.error("Gagal sinkronisasi uplink:", error);
      } finally {
        setIsLoadingChats(false);
      }
    };
    fetchPartners();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error("Gagal terminasi sesi:", error);
      setIsLoggingOut(false);
    }
  };

  // --- 1. IDENTITAS VISUAL & TEMA (DIPISAH DARI SELEKSI) ---
  const themes = {
    client: {
      accent: 'blue-500',
      bg: 'bg-blue-600/10',
      text: 'text-blue-400',
      border: 'border-blue-500/20',
      gradient: 'from-blue-500 to-indigo-600',
      tag: 'COMMANDER'
    },
    captain: {
      accent: 'red-500',
      bg: 'bg-red-600/10',
      text: 'text-red-400',
      border: 'border-red-500/20',
      gradient: 'from-red-500 to-orange-600',
      tag: 'OVERSEER'
    },
    freelancer: {
      accent: 'green-500',
      bg: 'bg-green-600/10',
      text: 'text-green-400',
      border: 'border-green-500/20',
      gradient: 'from-green-500 to-emerald-600',
      tag: 'AGENT'
    }
  };

  // Pilih tema aktif berdasarkan userRole
  const theme = themes[userRole as keyof typeof themes] || themes.freelancer;

  // --- 2. KONFIGURASI MENU KONSISTEN (/role/...) ---
  const getMenuItems = (): MenuItem[] => {
    switch (userRole) {
      case 'client':
        return [
          { href: '/client', label: 'War Room', icon: ShieldCheck, desc: 'Project Overview' },
          { href: '/client/messages', label: 'Secure Comms', icon: MessageSquare, desc: 'Direct Channel' },
          { href: '/client/recruitment', label: 'AI Recruiter', icon: Zap, isSpecial: true, desc: 'Deploy New Squad' },
          { href: '/client/profile', label: 'Identity', icon: User, desc: 'Organization Info' },
        ];
      case 'captain':
        return [
          { href: '/captain', label: "Captain's Bridge", icon: ShieldAlert, isAdmin: true, desc: 'Command Center' },
          { href: '/captain/roster', label: 'Squad Roster', icon: Users, desc: 'Manage Agents' },
          { href: '/captain/missions', label: 'Mission Board', icon: Target, desc: 'Active Ops' },
          { href: '/captain/messages', label: 'Comms Terminal', icon: MessageSquare, desc: 'Intercepts' },
          { href: '/captain/lab', label: 'Tactical Lab', icon: FlaskConical, desc: 'R&D Oversight' },
        ];
      default: // Freelancer
        return [
          { href: '/guild', label: 'Guild Hall', icon: LayoutDashboard, desc: 'Identity & XP' },
          { href: '/guild/quests', label: 'Quest Board', icon: Sword, desc: 'Available Missions' },
          { href: '/guild/messages', label: 'Comms Terminal', icon: MessageSquare, desc: 'Mission Directives' },
          { href: '/guild/cryosleep', label: 'Cryosleep', icon: Activity, desc: 'Status Pause' },
          { href: '/guild/lab', label: 'The Lab', icon: FlaskConical, desc: 'R&D Experiments' },
          { href: '/guild/profile', label: 'Identity Profile', icon: User, desc: 'Gear & Attributes' },
        ];
    }
  };

  const menuItems = getMenuItems();

  // --- 3. HELPER UNTUK LINK CHAT ---
  const getChatLink = (partnerId: string) => {
    switch (userRole) {
      case 'client': return `/client/chat/${partnerId}`;
      case 'captain': return `/captain/messages/${partnerId}`;
      default: return `/guild/messages/${partnerId}`;
    }
  };

  return (
    <aside className="w-64 bg-[#0B1120] border-r border-white/5 h-screen flex flex-col p-4 fixed left-0 top-0 z-50 shadow-2xl font-sans text-left overflow-hidden">
      
      {/* BRANDING */}
      <Link href="/" className="flex items-center gap-3 mb-10 px-2 group cursor-pointer no-underline">
        <div className={`w-10 h-10 bg-gradient-to-br ${theme.gradient} rounded-xl flex items-center justify-center font-black text-black group-hover:rotate-12 transition-all shadow-lg`}>
          L
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-white tracking-tighter uppercase italic leading-none">Leap.io</h1>
          <span className={`text-[8px] font-mono font-bold tracking-[0.2em] ${theme.text} mt-1`}>{theme.tag} MODE</span>
        </div>
      </Link>

      {/* NAVIGATION MENU */}
      <nav className="space-y-1 overflow-y-auto custom-scrollbar pr-1 max-h-[55%]">
        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em] mb-4 px-4">Directives</p>
        
        {menuItems.map((item) => {
          // Cek aktif jika path persis sama atau diawali path tersebut (untuk nested route)
          const isActive = item.href.length > 10 
            ? pathname.startsWith(item.href) 
            : pathname === item.href;

          const activeClass = `${theme.bg} ${theme.text} ${theme.border} shadow-inner`;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm group no-underline border border-transparent ${
                isActive ? activeClass : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
              } ${item.isSpecial ? 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400 mt-4' : ''} ${item.isAdmin ? 'bg-red-500/10 text-red-500 border-red-500/20 mb-4' : ''}`}
            >
              <item.icon size={18} className={`${isActive ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'}`} />
              <div className="flex flex-col">
                <span>{item.label}</span>
                <span className={`text-[8px] font-normal uppercase tracking-tighter ${isActive ? 'text-current opacity-70' : 'text-slate-600'}`}>
                  {item.desc}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* ACTIVE UPLINKS (CHAT) */}
      <div className="mt-8 flex-1 overflow-y-auto custom-scrollbar pr-1 border-t border-white/5 pt-6">
        <div className="flex items-center justify-between px-4 mb-4">
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">Active Uplinks</p>
            {!isLoadingChats && activePartners.length > 0 && (
                <span className="flex h-2 w-2 relative">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-${theme.accent.split('-')[0]}-400`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 bg-${theme.accent.split('-')[0]}-500`}></span>
                </span>
            )}
        </div>

        <div className="space-y-1">
          {isLoadingChats ? (
            <div className="px-4 py-2 flex items-center gap-3 opacity-20">
                <Loader2 className="animate-spin text-slate-500" size={14} />
                <span className="text-[10px] font-mono">Syncing...</span>
            </div>
          ) : activePartners.length > 0 ? (
            activePartners.map((partner) => (
              <Link
                key={`uplink-${partner.id}`}
                href={getChatLink(partner.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all group no-underline border border-transparent hover:bg-white/5 ${
                  pathname.includes(partner.id) ? `${theme.bg} ${theme.text}` : 'text-slate-400'
                }`}
              >
                <div className={`w-8 h-8 bg-slate-950 rounded-full flex items-center justify-center text-[10px] font-bold border border-white/5 shrink-0 uppercase group-hover:border-${theme.accent.split('-')[0]}-500/50`}>
                  {partner.name?.substring(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate group-hover:text-white transition-colors">{partner.name || 'Agent'}</p>
                    <p className="text-[8px] text-slate-600 uppercase font-mono tracking-tighter">Link Stable</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="px-4 py-6 text-center border border-dashed border-white/5 rounded-2xl mx-2 opacity-30">
                <Terminal size={20} className="mx-auto text-slate-600 mb-2" />
                <p className="text-[9px] text-slate-600 italic leading-tight">No active transmissions detected.</p>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-auto pt-4 border-t border-white/5">
        <div className="px-4 py-3 mb-2 rounded-xl bg-slate-950/50 border border-white/5 flex items-center gap-3">
           <Cpu size={14} className={theme.text} />
           <div className="flex flex-col">
             <span className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">System Status</span>
             <span className="text-[10px] text-white font-bold uppercase italic">Optimal</span>
           </div>
        </div>
        
        <button 
            onClick={handleLogout} 
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-xs font-black uppercase tracking-widest group disabled:opacity-50"
        >
            {isLoggingOut ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" /> 
            )}
            {isLoggingOut ? 'Terminating...' : 'Abort Mission'}
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}</style>
    </aside>
  );
}