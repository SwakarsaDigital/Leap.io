import { auth } from "../../../auth";
import { prisma } from "../../lib/prisma";
import Link from "next/link";
import { MessageSquare, ArrowRight, User } from "lucide-react";
import Shell from "../../components/layout/Shell";

async function getConversations(userId: string) {
  // Mengambil pesan di mana user ini adalah pengirim atau penerima
  // Catatan: Ini adalah query sederhana. Untuk produksi, sebaiknya gunakan group by yang lebih efisien.
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId },
        { receiverId: userId }
      ]
    },
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      sender: {
        select: { id: true, name: true, email: true }
      },
      receiver: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  // Memproses pesan untuk mendapatkan "kontak unik" terakhir
  const conversationsMap = new Map();
  
  messages.forEach((msg: any) => {
    // Tentukan siapa "lawan bicara"
    const otherUser = msg.senderId === userId ? msg.receiver : msg.sender;
    
    if (!conversationsMap.has(otherUser.id)) {
      conversationsMap.set(otherUser.id, {
        userId: otherUser.id,
        name: otherUser.name || otherUser.email,
        lastMessage: msg.content,
        timestamp: msg.createdAt,
        unread: false // Logika unread bisa ditambahkan nanti
      });
    }
  });

  return Array.from(conversationsMap.values());
}

export default async function InboxPage() {
  const session = await auth();
  if (!session?.user?.id) return <div>Unauthorized Access.</div>;

  const conversations = await getConversations(session.user.id);

  return (
    <Shell isLoggedIn={false}>
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400 font-mono tracking-tight flex items-center gap-3">
              <MessageSquare className="w-8 h-8" />
              INCOMING TRANSMISSIONS
            </h1>
            <p className="text-slate-400 mt-2 font-mono text-sm">
              Secure channels established with clients.
            </p>
          </div>
          <div className="bg-emerald-950/30 px-4 py-2 rounded border border-emerald-500/20 text-emerald-400 font-mono text-xs">
            STATUS: ONLINE
          </div>
        </div>

        <div className="grid gap-4">
          {conversations.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-slate-700 rounded-lg">
              <p className="text-slate-500 font-mono">No active transmissions detected.</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <Link 
                href={`/guild/messages/${conv.userId}`} 
                key={conv.userId}
                className="group relative overflow-hidden bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-lg transition-all duration-300 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 group-hover:border-emerald-500/50 transition-colors">
                      <User className="w-6 h-6 text-slate-400 group-hover:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-200 group-hover:text-emerald-300 font-mono">
                        {conv.name}
                      </h3>
                      <p className="text-sm text-slate-500 truncate max-w-md font-mono mt-1">
                        <span className="text-emerald-500/50 mr-2">{'>'}</span>
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-slate-600 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-800">
                      {new Date(conv.timestamp).toLocaleDateString()}
                    </span>
                    <ArrowRight className="w-5 h-5 text-slate-700 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}