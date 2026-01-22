'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Brain, 
  Zap, 
  Palette, 
  Search, 
  Plus, 
  MessageCircle,
  MoreVertical,
  Trash2, 
  Pin, 
  PinOff, 
  AlertTriangle, 
  Sparkles,
  Loader2,
  Home
} from 'lucide-react';

/**
 * Menggunakan pendekatan navigasi berbasis window.location untuk stabilitas 
 * lingkungan pratinjau jika modul router gagal dimuat.
 */
import { getAvailableFreelancers } from '../../lib/actions';

// --- DEFINISI TIPE DATA ---
interface Message {
  id: number;
  sender: 'ai' | 'user';
  text: string;
  isWidget?: boolean;
  agents?: any[]; // Menyimpan data agen secara lokal di dalam pesan
}

interface ChatSession {
  id: string;
  title: string;
  date: string;
  preview: string;
  isPinned?: boolean; 
  messages: Message[];
  lastModified: number;
}

/**
 * Komponen Utama: App
 * Mengelola antarmuka AI Recruiter dan menghubungkan Client ke Freelancer.
 */
export default function App({ userEmail }: { userEmail: string }) {
  const STORAGE_KEY = `leap_ai_sessions_${userEmail}`;

  // --- STATE APLIKASI ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('new');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // --- INISIALISASI (MUAT DARI PENYIMPANAN LOKAL) ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        try {
          setSessions(JSON.parse(savedData));
        } catch (e) {
          console.error("Gagal memuat riwayat", e);
        }
      }
    }
    
    // Pesan sambutan awal
    setMessages([
        { id: 1, sender: 'ai', text: `Selamat datang kembali, Agen ${userEmail}. Sistem Leap-v1 siap beroperasi.` },
        { id: 2, sender: 'ai', text: 'Jelaskan kriteria misi Anda, dan saya akan melakukan sinkronisasi dengan agen elit yang tersedia.' }
    ]);
  }, [userEmail, STORAGE_KEY]);

  // --- SIMPAN KE PENYIMPANAN LOKAL ---
  useEffect(() => {
    if (sessions.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    }
  }, [sessions, STORAGE_KEY]);

  // --- BERPINDAH SESI CHAT ---
  useEffect(() => {
    if (activeSessionId === 'new') {
        setMessages([
            { id: Date.now(), sender: 'ai', text: `Selamat datang kembali, Agen ${userEmail}. Leap-v1 aktif.` },
            { id: Date.now() + 1, sender: 'ai', text: 'Jelaskan misi proyek Anda untuk memulai proses rekrutmen.' }
        ]);
    } else {
        const session = sessions.find(s => s.id === activeSessionId);
        if (session) {
            setMessages(session.messages);
        }
    }
  }, [activeSessionId, userEmail, sessions]); 

  // --- LOGIKA NAVIGASI KOMUNIKASI LANGSUNG ---
  /**
   * Mengarahkan Client ke halaman chat privat dengan Freelancer.
   * Menggunakan window.location untuk memastikan navigasi berhasil di lingkungan ini.
   */
  const handleOpenDirectUplink = (freelancerId: string) => {
    if (!freelancerId) return;
    window.location.href = `/client/chat/${freelancerId}`;
  };

  // --- LOGIKA PEMBARUAN DATA SESI ---
  const updateCurrentSession = (newMessages: Message[], userText?: string) => {
    if (activeSessionId === 'new' && userText) {
        const newId = Date.now().toString();
        const newSession: ChatSession = {
            id: newId,
            title: userText.substring(0, 30) + (userText.length > 30 ? '...' : ''),
            date: 'Baru saja',
            preview: userText,
            messages: newMessages,
            lastModified: Date.now(),
            isPinned: false
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newId);
    } else if (activeSessionId !== 'new') {
        setSessions(prev => prev.map(s => {
            if (s.id === activeSessionId) {
                return {
                    ...s,
                    messages: newMessages,
                    preview: userText || s.preview,
                    lastModified: Date.now(),
                    date: 'Baru saja'
                };
            }
            return s;
        }));
    }
  };

  // --- HANDLER PENGIRIMAN PESAN ---
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const currentInput = input;
    const userMsg: Message = { id: Date.now(), sender: 'user', text: currentInput };
    
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setIsTyping(true);
    
    updateCurrentSession(nextMessages, currentInput);

    try {
      // Ambil data agen nyata dari database melalui Server Action
      const agents = await getAvailableFreelancers();

      setTimeout(() => {
        setIsTyping(false);
        const aiMsg: Message = { 
          id: Date.now() + 1, 
          sender: 'ai', 
          text: `Analisis intelijen selesai. Saya menemukan ${agents.length} agen elit yang cocok untuk misi ini. Silakan buka jalur komunikasi untuk koordinasi lebih lanjut.`,
          isWidget: agents.length > 0,
          agents: agents 
        };
        
        const updatedWithReply = [...nextMessages, aiMsg];
        setMessages(updatedWithReply);
        
        setSessions(prev => {
            if (activeSessionId === 'new') {
                const newest = prev[0]; 
                if (newest && newest.preview === currentInput) {
                    return [{ ...newest, messages: updatedWithReply }, ...prev.slice(1)];
                }
                return prev;
            } else {
                return prev.map(s => s.id === activeSessionId ? { ...s, messages: updatedWithReply } : s);
            }
        });
      }, 1500);
    } catch (err) {
      setIsTyping(false);
    }
  };

  const confirmDeleteSession = () => {
    if (sessionToDelete) {
        const updated = sessions.filter(h => h.id !== sessionToDelete);
        setSessions(updated);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        }
        if (activeSessionId === sessionToDelete) setActiveSessionId('new');
    }
    setIsDeleteModalOpen(false);
    setSessionToDelete(null);
  };

  // Sorting dan Filtering Riwayat
  const filteredHistory = sessions.filter(h => 
    h.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (a.isPinned === b.isPinned) return b.lastModified - a.lastModified;
    return a.isPinned ? -1 : 1; 
  });

  return (
    <div className="w-full max-w-6xl mx-auto h-[700px] bg-slate-900/80 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex backdrop-blur-xl relative">
      
      {/* SIDEBAR LOG OPERASI */}
      <div className="w-80 border-r border-slate-800 bg-slate-950/50 flex flex-col hidden md:flex">
        <div className="p-4 border-b border-slate-800 text-left">
            <button 
                onClick={() => setActiveSessionId('new')}
                className={`w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all mb-4 ${
                    activeSessionId === 'new' ? 'bg-slate-700 text-white cursor-default' : 'bg-green-600 hover:bg-green-500 text-white shadow-lg'
                }`}
            >
                <Plus size={16} /> Operasi Baru
            </button>
            <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                <input 
                    type="text" 
                    placeholder="Cari log..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-200 focus:outline-none focus:border-green-500 transition-all placeholder:text-slate-600"
                />
            </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 text-left">
            {sortedHistory.map((item) => (
                <button 
                    key={item.id}
                    onClick={() => setActiveSessionId(item.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all group relative ${
                        activeSessionId === item.id ? 'bg-slate-800 border-slate-700' : 'border-transparent hover:bg-slate-900/50'
                    }`}
                >
                    <div className="flex justify-between items-start mb-1 pr-6">
                        <span className={`text-sm font-bold truncate max-w-[140px] ${activeSessionId === item.id ? 'text-white' : 'text-slate-400'}`}>
                            {item.title}
                        </span>
                        {item.isPinned && <Pin size={12} className="text-green-500 mt-1 animate-pulse" />}
                    </div>
                    <p className="text-[10px] text-slate-600 mb-1 italic">{item.preview}</p>

                    <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/90 rounded p-1 border border-slate-800/50">
                        <div onClick={(e) => { e.stopPropagation(); setSessions(prev => prev.map(h => h.id === item.id ? { ...h, isPinned: !h.isPinned } : h)); }} className="p-1 text-slate-400 hover:text-green-400 rounded cursor-pointer">
                            {item.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                        </div>
                        <div onClick={(e) => { e.stopPropagation(); setSessionToDelete(item.id); setIsDeleteModalOpen(true); }} className="p-1 text-slate-400 hover:text-red-400 rounded cursor-pointer">
                            <Trash2 size={14} />
                        </div>
                    </div>
                </button>
            ))}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/80">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                    {userEmail.substring(0,2).toUpperCase()}
                </div>
                <div className="overflow-hidden text-left">
                    <p className="text-xs font-bold text-white truncate">{userEmail}</p>
                    <p className="text-[10px] text-green-500 flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> AGEN TEROTORISASI
                    </p>
                </div>
            </div>
        </div>
      </div>

      {/* AREA TERMINAL CHAT */}
      <div className="flex-1 flex flex-col relative bg-slate-900/30">
        <div className="h-16 border-b border-slate-800 bg-slate-950/30 flex items-center justify-between px-6 backdrop-blur-sm sticky top-0 z-10 text-left">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center border border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <Bot size={18} className="text-green-400" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-sm tracking-tight">Leap AI Recruiter</h3>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest flex items-center gap-1 font-mono">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Jaringan Aman
                    </p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <a 
                    href="/" 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700 group no-underline"
                >
                    <Home size={12} className="group-hover:scale-110 transition-transform text-green-500" />
                    Beranda
                </a>
                <MoreVertical size={18} className="text-slate-500 hover:text-white cursor-pointer" />
            </div>
        </div>

        {/* List Pesan dengan Rendering Kartu Agen */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar text-left scroll-smooth">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-md ${msg.sender === 'user' ? 'bg-gradient-to-br from-blue-600 to-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
                            {msg.sender === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-green-400" />}
                        </div>

                        <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative group ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                            {msg.text}

                            {/* Tampilan Agen yang Ditemukan AI */}
                            {msg.isWidget && msg.agents && msg.agents.length > 0 && (
                                <div className="mt-4 space-y-3">
                                    {msg.agents.map((agent: any) => (
                                        <div 
                                            key={agent.id} 
                                            className="bg-slate-950/80 border border-slate-700 rounded-xl p-3 flex items-center gap-4 hover:border-green-500/50 hover:bg-slate-900 transition-all cursor-pointer group/card active:scale-[0.98]"
                                        >
                                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shrink-0 text-xl shadow-inner">
                                                {agent.image ? '🐸' : '👤'}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="font-bold text-white text-xs truncate group-hover/card:text-green-400 transition-colors">{agent.name || 'Agen Anonim'}</h4>
                                                    <span className="text-green-400 text-[10px] font-mono border border-green-500/30 px-1.5 rounded bg-green-500/10 flex items-center gap-1">
                                                        <Sparkles size={8} /> LVL {agent.level}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <StatBadge icon={Brain} value={agent.logic} color="text-blue-400" />
                                                    <StatBadge icon={Zap} value={agent.speed} color="text-yellow-400" />
                                                    <StatBadge icon={Palette} value={agent.aesthetic} color="text-purple-400" />
                                                </div>
                                            </div>
                                            {/* TOMBOL UNTUK MEMBUKA DIRECT UPLINK (CHAT ASLI) */}
                                            <button 
                                                onClick={() => handleOpenDirectUplink(agent.id)}
                                                className="p-2 bg-slate-800 hover:bg-green-600 text-slate-400 hover:text-white rounded-lg transition-all border border-slate-700 shadow-lg"
                                                title="Mulai Komunikasi Langsung"
                                            >
                                                <MessageCircle size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            
            {/* Indikator AI sedang memproses data */}
            {isTyping && (
                <div className="flex justify-start gap-3 animate-in fade-in duration-300">
                     <div className="w-8 h-8 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center shrink-0">
                        <Bot size={14} className="text-green-400" />
                    </div>
                    <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1.5 items-center h-12 shadow-inner">
                        <span className="w-1.5 h-1.5 bg-green-500/50 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-green-500/50 rounded-full animate-bounce delay-150"></span>
                        <span className="w-1.5 h-1.5 bg-green-500/50 rounded-full animate-bounce delay-300"></span>
                    </div>
                </div>
            )}
            <div ref={scrollRef} />
        </div>

        {/* INPUT TRANSMISI */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
            <form onSubmit={handleSend} className="flex gap-2 relative">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Instruksikan kriteria misi atau agen..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-green-500 transition-all placeholder:text-slate-600 shadow-inner"
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() || isTyping}
                    className="absolute right-2 top-2 p-1.5 bg-green-600 hover:bg-green-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg transition-all shadow-lg active:scale-95"
                >
                    {isTyping ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                </button>
            </form>
            <div className="text-center mt-2 flex items-center justify-center gap-1.5 opacity-60">
                <AlertTriangle size={10} className="text-yellow-500" />
                <p className="text-[10px] text-slate-500 font-medium tracking-tight">AI Recruiter memproses data agen elit secara real-time.</p>
            </div>
        </div>
      </div>

      {/* MODAL KONFIRMASI HAPUS LOG */}
      {isDeleteModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-center">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-xl p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                <Trash2 size={24} className="text-red-500 mx-auto mb-4 animate-pulse" />
                <h3 className="text-lg font-bold text-white">Hapus Log Operasi?</h3>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">Tindakan ini akan menghapus log koordinasi ini secara permanen dari arsip lokal.</p>
                <div className="flex gap-3 w-full mt-6">
                    <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-bold transition-colors">Batal</button>
                    <button onClick={confirmDeleteSession} className="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold shadow-lg shadow-red-900/20 transition-colors">Hapus</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

/**
 * Sub-komponen StatBadge untuk visualisasi statistik agen
 */
function StatBadge({ icon: Icon, value, color }: any) {
    return (
        <div className={`flex items-center gap-1 text-[10px] ${color} bg-slate-900/50 px-1.5 py-0.5 rounded border border-white/5 shadow-sm`}>
            <Icon size={10} /> <span className="font-mono font-bold">{value}</span>
        </div>
    );
}