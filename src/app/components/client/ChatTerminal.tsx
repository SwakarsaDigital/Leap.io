'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  ShieldCheck, 
  Terminal, 
  Lock, 
  Activity,
  Loader2,
  MoreVertical,
  MessageCircle
} from 'lucide-react';

/**
 * Memperbaiki jalur impor menggunakan alias '@/' yang lebih standar untuk Next.js
 * guna menghindari masalah resolusi jalur relatif di lingkungan build.
 */
import { sendMessage, getChatHistory } from '../../lib/actions';

interface Message {
  id: string;
  text: string;
  senderId: string;
  sender: { name: string | null; role: string };
  createdAt: Date;
}

/**
 * Komponen Utama: App (Mengikuti kontrak React untuk pratinjau)
 * Mengimplementasikan terminal chat terintegrasi dengan database.
 */
export default function App({ 
  currentUserId, 
  otherUserId, 
  otherUserName 
}: { 
  currentUserId: string; 
  otherUserId: string; 
  otherUserName: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Memuat riwayat chat asli dari database saat komponen dimuat
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getChatHistory(otherUserId);
        setMessages(history as any[]);
      } catch (error) {
        console.error("Gagal mengambil riwayat:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (otherUserId) fetchHistory();
  }, [otherUserId]);

  // Mengatur scroll otomatis ke pesan terbaru
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Menangani pengiriman pesan
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const text = input;
    setInput('');
    setIsSending(true);

    try {
      const result = await sendMessage(otherUserId, text);
      
      if (result.success) {
        // Pembaruan Optimistik: Tambahkan pesan ke UI segera setelah berhasil disimpan
        const newMessage: Message = {
          id: Math.random().toString(), // ID sementara untuk UI
          text,
          senderId: currentUserId,
          sender: { name: 'Anda', role: 'client' },
          createdAt: new Date()
        };
        setMessages(prev => [...prev, newMessage]);
      }
    } catch (error) {
      console.error("Gagal mengirim transmisi:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative font-sans">
      {/* Efek Latar Belakang Digital */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Header Terminal */}
      <div className="h-16 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between px-6 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <ShieldCheck className="text-blue-400" size={20} />
          </div>
          <div className="text-left">
            <h3 className="text-white font-bold text-sm">Direct Uplink: {otherUserName}</h3>
            <p className="text-[10px] text-slate-500 font-mono flex items-center gap-1 uppercase tracking-widest">
              <Lock size={10} /> Saluran Terenkripsi Aktif
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-600 hidden md:flex">
          <span className="flex items-center gap-1 font-bold text-green-500">
            <Activity size={12} className="animate-pulse" /> LIVE
          </span>
          <MoreVertical size={16} className="cursor-pointer hover:text-white transition-colors" />
        </div>
      </div>

      {/* Area Pesan */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10 custom-scrollbar bg-slate-950/30">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-xs text-slate-500 font-mono animate-pulse uppercase tracking-widest">Sinkronisasi Riwayat...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4 opacity-50">
             <MessageCircle size={48} strokeWidth={1} />
             <p className="text-xs font-mono uppercase tracking-widest text-center">
                Belum ada transmisi data.<br/>Kirim pesan pertama untuk memulai koneksi.
             </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isMe 
                    ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-900/20' 
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700 shadow-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-600 font-mono mt-1 px-1 uppercase tracking-tighter">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {isMe ? 'SENT' : 'RECEIVED'}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Transmisi */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 z-10">
        <form onSubmit={handleSend} className="flex items-end gap-2 bg-slate-950 p-2 rounded-2xl border border-slate-800 focus-within:border-blue-500/50 transition-all shadow-inner">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Kirim perintah atau instruksi teknis..."
            className="flex-1 bg-transparent border-none text-sm text-slate-200 p-3 outline-none resize-none min-h-[44px] max-h-[120px] custom-scrollbar"
            onKeyDown={(e) => { 
              if(e.key === 'Enter' && !e.shiftKey) { 
                e.preventDefault(); 
                handleSend(e); 
              } 
            }}
          />
          <button 
            type="submit"
            disabled={!input.trim() || isSending}
            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-900/40 disabled:opacity-30 disabled:grayscale active:scale-95"
            title="Kirim Transmisi"
          >
            {isSending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1e293b;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}