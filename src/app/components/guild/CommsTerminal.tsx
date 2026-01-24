'use client';

import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { 
  Send, 
  ShieldCheck, 
  Terminal, 
  Lock, 
  Activity,
  Loader2,
  MoreVertical,
  MessageCircle,
  User,
  Shield
} from 'lucide-react';

interface Message {
  id: string;
  text: string;
  senderId: string;
  createdAt: Date | string;
  sender: { name: string };
}

interface CommsTerminalProps {
  initialMessages?: Message[];
  currentUserId: string;
  recipientId: string;
  recipientName: string;
  onSendMessage?: (message: string, recipientId: string) => Promise<void>;
}

/**
 * Komponen CommsTerminal
 * Menggabungkan fungsi pengiriman pesan dengan desain terminal premium.
 */
export default function App({ 
  initialMessages = [], 
  currentUserId, 
  recipientId, 
  recipientName,
  onSendMessage 
}: CommsTerminalProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sinkronisasi pesan awal jika berubah dari props
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Mengatur scroll otomatis ke pesan terbaru
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Menangani pengiriman pesan
  const handleSendMessage = async () => {
    if (!input.trim() || isSending) return;

    const messageContent = input;
    setInput('');
    setIsSending(true);

    // 1. Pembaruan Optimistik (Tampilkan di UI seketika)
    const tempId = Math.random().toString(36).substr(2, 9);
    const optimisticMsg: Message = {
      id: tempId,
      text: messageContent,
      senderId: currentUserId,
      createdAt: new Date(),
      sender: { name: 'Anda' }
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      // 2. Panggil Server Action / Prop Function
      if (onSendMessage) {
        await onSendMessage(messageContent, recipientId);
      }
    } catch (error) {
      console.error("Transmission failed:", error);
      // Opsional: Hapus pesan yang gagal atau beri tanda error
      // alert("Signal Interrupted: Transmission failed.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSend = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSendMessage();
  };

  return (
    <div className="flex flex-col h-[650px] w-full bg-slate-950 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl relative font-sans ring-1 ring-white/5">
      
      {/* Efek Latar Belakang Digital (Grid) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-blue-500/5 via-transparent to-transparent"></div>

      {/* Header Terminal */}
      <div className="h-20 border-b border-white/5 bg-slate-900/40 flex items-center justify-between px-8 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-xl animate-pulse"></div>
            <div className="p-2.5 bg-blue-950/50 rounded-xl border border-blue-500/30 relative z-10">
              <ShieldCheck className="text-blue-400" size={22} />
            </div>
          </div>
          <div className="text-left">
            <h3 className="text-white font-bold text-base tracking-tight">Uplink: {recipientName}</h3>
            <div className="flex items-center gap-2">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></span>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em]">
                Secure Channel <span className="text-slate-600">// 256-BIT AES</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex flex-col items-end font-mono">
            <span className="text-[10px] text-blue-400 font-bold">NODE: TERMINAL_01</span>
            <span className="text-[9px] text-slate-500 italic">FREQ: 2.4GHZ_SEC</span>
          </div>
          <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Area Pesan */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8 z-10 custom-scrollbar bg-transparent">
        {isLoading ? (
          <div className="h-full flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p className="text-xs text-slate-500 font-mono animate-pulse uppercase tracking-widest">Establishing Connection...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 gap-4">
             <div className="p-6 bg-slate-900/30 rounded-full border border-white/5">
                <MessageCircle size={40} strokeWidth={1} className="text-slate-600" />
             </div>
             <div className="text-center space-y-1">
               <p className="text-xs font-mono uppercase tracking-[0.3em] text-slate-500">No active transmissions</p>
               <p className="text-[10px] text-slate-600">Waiting for data packets...</p>
             </div>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div className={`max-w-[80%] sm:max-w-[70%] flex gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  
                  {/* Avatar Circle */}
                  <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                    isMe 
                    ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' 
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                  }`}>
                    {isMe ? <Shield size={14} /> : <User size={14} />}
                  </div>

                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`relative p-4 rounded-2xl text-sm leading-relaxed transition-all duration-300 ${
                      isMe 
                      ? 'bg-blue-600 text-white rounded-tr-none shadow-xl shadow-blue-900/20 group-hover:bg-blue-500' 
                      : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/50 backdrop-blur-sm group-hover:border-slate-600'
                    }`}>
                      {/* Accent corner for "hacker" feel */}
                      <div className={`absolute top-0 ${isMe ? 'right-0' : 'left-0'} w-2 h-2 border-t border-white/20`}></div>
                      
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    
                    <div className={`flex items-center gap-2 mt-1.5 px-1 font-mono text-[9px] uppercase tracking-tighter transition-opacity duration-300 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                      <span className="text-slate-500">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending...'}
                      </span>
                      <span className="text-slate-700">•</span>
                      <span className={isMe ? 'text-blue-500/70 font-bold' : 'text-slate-600'}>
                        {isMe ? 'Authorized' : 'Verified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={scrollRef} />
      </div>

      {/* Input Transmisi */}
      <div className="p-6 bg-slate-900/60 border-t border-white/5 backdrop-blur-xl z-20">
        <form onSubmit={handleSend} className="relative group">
          {/* Glowing border effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-[1.25rem] opacity-0 group-focus-within:opacity-100 transition-opacity blur-[2px]"></div>
          
          <div className="relative flex items-end gap-3 bg-slate-950 p-2.5 rounded-[1.25rem] border border-slate-800/50 shadow-2xl transition-all">
            <div className="p-3 text-slate-600 hidden sm:block">
              <Terminal size={18} />
            </div>
            
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter secure command or message..."
              className="flex-1 bg-transparent border-none text-sm text-slate-200 py-3 outline-none resize-none min-h-[46px] max-h-[150px] custom-scrollbar font-mono placeholder:text-slate-700"
              onKeyDown={(e) => { 
                if(e.key === 'Enter' && !e.shiftKey) { 
                  e.preventDefault(); 
                  handleSendMessage(); 
                } 
              }}
            />

            <button 
              type="submit"
              disabled={!input.trim() || isSending}
              className="group/btn relative flex items-center justify-center w-12 h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all duration-300 shadow-lg shadow-blue-900/40 disabled:opacity-20 disabled:grayscale active:scale-90 overflow-hidden"
              title="Execute Transmission"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
              {isSending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={18} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-3 flex justify-between items-center px-2">
           <div className="flex items-center gap-3">
              <span className="text-[8px] text-slate-600 font-mono tracking-widest uppercase">System status: <span className="text-emerald-500/60">Optimal</span></span>
           </div>
           <div className="flex items-center gap-1.5 opacity-30">
              <Lock size={10} className="text-slate-500" />
              <span className="text-[8px] text-slate-600 font-mono tracking-tighter">E2E ENCRYPTED</span>
           </div>
        </div>
      </div>

      {/* CSS untuk Scrollbar Custom */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.2);
        }
      `}</style>
    </div>
  );
}