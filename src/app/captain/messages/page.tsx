import React from 'react';
import { auth } from '../../../auth';
import { prisma } from '../../../app/lib/prisma';
import Link from 'next/link';
import { MessageSquare, ArrowRight, ShieldAlert } from 'lucide-react';

export default async function CaptainMessagesPage() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
  if (!currentUser) return null;

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: currentUser.id }, { receiverId: currentUser.id }] },
    include: { sender: true, receiver: true },
    orderBy: { createdAt: 'desc' }
  });

  const partnersMap = new Map();
  messages.forEach(msg => {
      const partner = msg.senderId === currentUser.id ? msg.receiver : msg.sender;
      if (!partnersMap.has(partner.id)) {
          // Fix: Safely access content, casting to any if type definition is missing 'content'
          const content = (msg as any).content || 'Attachment';
          
          partnersMap.set(partner.id, { 
              ...partner, 
              lastMessage: content, 
              timestamp: msg.createdAt 
          });
      }
  });
  const partners = Array.from(partnersMap.values());

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-white mb-8 flex items-center gap-3 uppercase italic">
            <ShieldAlert className="text-red-500" /> Intercepts & Comms
        </h1>
        <div className="grid gap-4">
            {partners.length === 0 ? (
                <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
                    <p className="text-slate-500">No active transmissions.</p>
                </div>
            ) : (
                partners.map((partner: any) => (
                    <Link key={partner.id} href={`/captain/messages/${partner.id}`} className="block bg-slate-900 border border-slate-800 p-6 rounded-xl hover:border-red-500/50 transition-all group">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center text-lg font-bold text-red-500 border border-red-900/30">
                                    {partner.name?.[0] || '?'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{partner.name}</h3>
                                    <p className="text-sm text-slate-400 truncate max-w-md">{partner.lastMessage}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500 font-mono mb-2">{new Date(partner.timestamp).toLocaleDateString()}</p>
                                <ArrowRight size={16} className="ml-auto text-slate-600 group-hover:text-red-400" />
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