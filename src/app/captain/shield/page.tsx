'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Send, 
  User, 
  Terminal, 
  Wifi, 
  Activity,
  Search,
  MoreVertical,
  Paperclip,
  Mic,
  AlertTriangle
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_CLIENTS = [
  { id: '1', name: 'Alumka Corp', status: 'online', unread: 2, project: 'E-Commerce Revamp' },
  { id: '2', name: 'Dwipa Group', status: 'offline', unread: 0, project: 'Booking System' },
  { id: '3', name: 'Maju Mobilindo', status: 'busy', unread: 5, project: 'POS Integration' },
  { id: '4', name: 'Global Tech', status: 'online', unread: 0, project: 'AI Dashboard' },
];

const MOCK_MESSAGES: Record<string, any[]> = {
  '1': [
    { id: 1, sender: 'system', text: 'ENCRYPTED CONNECTION ESTABLISHED via LEAP-SECURE-V1.', time: '09:00' },
    { id: 2, sender: 'client', text: 'Hi Captain, we have a situation with the payment gateway.', time: '09:05' },
    { id: 3, sender: 'me', text: 'Copy that. I am reviewing the logs now. Is it the Stripe API?', time: '09:06' },
    { id: 4, sender: 'client', text: 'Yes, getting timeout errors.', time: '09:07' },
  ],
  '2': [
    { id: 1, sender: 'system', text: 'CHANNEL OFFLINE. LAST SYNC: 2 DAYS AGO.', time: '00:00' },
  ],
  '3': [
    { id: 1, sender: 'client', text: 'URGENT: Server down!', time: '10:00' },
    { id: 2, sender: 'client', text: 'Please respond.', time: '10:01' },
    { id: 3, sender: 'client', text: 'Customers are waiting.', time: '10:05' },
  ]
};

export default function ClientShieldPage() {
  const [selectedClient, setSelectedClient] = useState(MOCK_CLIENTS[0]);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<any[]>(MOCK_MESSAGES['1']);
  // FIX: Simpan Session ID di state agar konsisten antara server/client (atau set di useEffect)
  const [sessionId, setSessionId] = useState<string>(''); 
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Generate Session ID hanya di Client (saat mount) untuk menghindari Hydration Error
  useEffect(() => {
    setSessionId(Math.random().toString(36).substr(2, 9).toUpperCase());
  }, []);

  // Auto-scroll ke bawah saat pesan bertambah
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Ganti Client
  const handleSelectClient = (client: any) => {
    setSelectedClient(client);
    setMessages(MOCK_MESSAGES[client.id] || []);
  };

  // Kirim Pesan (Simulasi)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: 'me',
      text: inputMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Simulasi balasan otomatis
    setTimeout(() => {
      const reply = {
        id: Date.now() + 1,
        sender: 'client',
        text: 'Understood. Waiting for your update.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, reply]);
    }, 2000);
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col animate-in fade-in duration-700 max-w-7xl mx-auto">
      
      {/* --- HEADER SHIELD --- */}
      <div className="flex items-center justify-between mb-6 bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md shadow-lg">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-3 rounded-lg shadow-inner border border-blue-400/20">
            <ShieldCheck size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">CLIENT SHIELD <span className="text-green-500 text-xs align-top animate-pulse">● ACTIVE</span></h1>
            <p className="text-slate-400 text-xs font-mono flex items-center gap-2">
              <Lock size={12} /> SECURE CHANNEL // END-TO-END ENCRYPTED // NO FREELANCER ACCESS
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Wifi size={14} className="text-green-500" />
            <span>LATENCY: 24ms</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-blue-500" />
            <span>SERVER: STABLE</span>
          </div>
        </div>
      </div>

      {/* --- MAIN INTERFACE --- */}
      <div className="flex-1 flex gap-6 overflow-hidden rounded-2xl border border-slate-800 bg-black/40 shadow-2xl relative">
        
        {/* Decorative Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {/* --- LEFT SIDEBAR (CLIENT LIST) --- */}
        <div className="w-80 bg-slate-900/90 border-r border-slate-800 flex flex-col z-10 hidden md:flex">
          <div className="p-4 border-b border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
              <input 
                type="text" 
                placeholder="Search encrypted ID..." 
                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {MOCK_CLIENTS.map(client => (
              <button
                key={client.id}
                onClick={() => handleSelectClient(client)}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-all relative overflow-hidden group ${
                  selectedClient.id === client.id 
                  ? 'bg-indigo-900/20 border border-indigo-500/30' 
                  : 'hover:bg-slate-800 border border-transparent'
                }`}
              >
                {/* Active Indicator Bar */}
                {selectedClient.id === client.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500"></div>
                )}

                <div className="relative">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    selectedClient.id === client.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white'
                  }`}>
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                    client.status === 'online' ? 'bg-green-500' : 
                    client.status === 'busy' ? 'bg-red-500' : 'bg-slate-500'
                  }`}></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className={`text-sm font-bold truncate ${selectedClient.id === client.id ? 'text-white' : 'text-slate-300'}`}>{client.name}</h4>
                    {client.unread > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.2rem] text-center">
                        {client.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate font-mono">#{client.project}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* --- RIGHT AREA (CHAT TERMINAL) --- */}
        <div className="flex-1 flex flex-col bg-slate-950/50 z-10 w-full">
          
          {/* Chat Header */}
          <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <h3 className="font-bold text-white flex items-center gap-2">
                  {selectedClient.name} 
                  {selectedClient.status === 'online' && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
                </h3>
                <p className="text-xs text-slate-500 font-mono flex items-center gap-1">
                  <Terminal size={10} /> SECURE_SESSION_ID: {sessionId || 'INITIALIZING...'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <Search size={18} />
              </button>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <AlertTriangle size={18} className="text-yellow-500" />
              </button>
              <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                <MoreVertical size={18} />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            <div className="flex justify-center my-4">
              <span className="text-[10px] font-mono text-slate-600 bg-slate-900 px-3 py-1 rounded border border-slate-800">
                Messages are end-to-end encrypted. Freelancers cannot access this channel.
              </span>
            </div>

            {messages.map((msg) => {
              const isMe = msg.sender === 'me';
              const isSystem = msg.sender === 'system';

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="text-xs font-mono text-green-500/70 flex items-center gap-2">
                      <Terminal size={12} /> {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className={`p-4 rounded-2xl text-sm relative ${
                      isMe 
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                      : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700'
                    }`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">{msg.time}</span>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-slate-900 border-t border-slate-800">
            <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 focus-within:border-indigo-500/50 transition-colors">
              <button type="button" className="p-2 text-slate-500 hover:text-white rounded-lg transition-colors hidden sm:block">
                <Paperclip size={20} />
              </button>
              <textarea 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type classified message..." 
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none py-2 max-h-32 min-h-[40px]"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
              <button type="button" className="p-2 text-slate-500 hover:text-white rounded-lg transition-colors hidden sm:block">
                <Mic size={20} />
              </button>
              <button 
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/20"
              >
                <Send size={20} />
              </button>
            </form>
            <div className="text-center mt-2">
               <span className="text-[9px] text-slate-600 font-mono uppercase tracking-widest hidden sm:inline-block">
                 Leap Secure Protocol v4.2 • Unauthorized access is prohibited
               </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}