import React from 'react';
import { auth } from '../../../auth';
import { prisma } from '../../../app/lib/prisma';
import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';

export default async function ClientMessagesPage() {
  const session = await auth();
  if (!session?.user?.email) return null;

  // Ambil user ID
  const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
  });

  if (!currentUser) return null;

  // Logic sederhana untuk mengambil daftar chat
  // Di sini kita ambil semua pesan yang melibatkan user, lalu filter unik di JS
  const messages = await prisma.message.findMany({
    where: {
        OR: [
            { senderId: currentUser.id },
            { receiverId: currentUser.id }
        ]
    },
    include: {
        sender: true,
        receiver: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Filter partner unik
  const partnersMap = new Map();
  messages.forEach(msg => {
      const partner = msg.senderId === currentUser.id ? msg.receiver : msg.sender;
      if (!partnersMap.has(partner.id)) {
          // Menggunakan 'any' untuk msg agar properti 'content' bisa diakses jika tipenya belum sinkron
          const content = (msg as any).content || 'Attachment/Media';
          
          partnersMap.set(partner.id, {
              ...partner,
              lastMessage: content,
              timestamp: msg.createdAt
          });
      }
  });
  const partners = Array.from(partnersMap.values());

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <MessageSquare className="text-blue-500" /> Secure Comms
        </h1>

        <div className="grid gap-4">
            {partners.length === 0 ? (
                <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
                    <p className="text-slate-500">No active transmissions.</p>
                </div>
            ) : (
                partners.map((partner: any) => (
                    <Link 
                        key={partner.id} 
                        href={`/client/chat/${partner.id}`}
                        className="block bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-blue-500/50 transition-all group"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-lg font-bold text-white group-hover:bg-blue-600 transition-colors">
                                    {partner.name?.[0] || '?'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{partner.name}</h3>
                                    <p className="text-sm text-slate-400 truncate max-w-md">{partner.lastMessage}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 font-mono mb-2">
                                    {new Date(partner.timestamp).toLocaleDateString()}
                                </p>
                                <ArrowRight size={16} className="ml-auto text-slate-600 group-hover:text-blue-400" />
                            </div>
                        </div>
                    </Link>
                ))
            )}
        </div>
      </div>
    </div>
  );
}