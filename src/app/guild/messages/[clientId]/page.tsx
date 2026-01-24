import { auth } from "../../../../auth";
import { prisma } from "../../../lib/prisma";
import { redirect } from "next/navigation";
import CommsTerminal from "../../../components/guild/CommsTerminal";
import Shell from "../../../components/layout/Shell";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, Signal, Lock, Radio } from "lucide-react";
import { sendMessageAction } from "../../../lib/message-actions";

// Definisikan params sebagai Promise (Next.js 15)
interface PageProps {
  params: Promise<{ clientId: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Await params di Next.js 15
  const { clientId } = await params;
  const freelancerId = session.user.id;

  try {
    // 1. Ambil data Client
    const clientUser = await prisma.user.findUnique({
      where: { id: clientId },
      select: { name: true, email: true }
    });

    // Jika Client tidak ditemukan di database
    if (!clientUser) {
      return (
        <Shell userRole="freelancer" isLoggedIn={true}>
          <div className="max-w-4xl mx-auto p-6 flex items-center justify-center h-[80vh]">
              <div className="p-8 text-center text-red-400 font-mono border border-red-500/30 bg-red-950/20 rounded-xl animate-pulse shadow-[0_0_30px_rgba(220,38,38,0.1)]">
                <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-red-500" />
                <h2 className="text-xl font-bold tracking-widest uppercase mb-2">Target Signal Lost</h2>
                <p className="text-sm text-red-400/70 mb-8">Client credentials could not be verified in the registry.</p>
                <Link href="/guild/messages" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-mono border border-emerald-500/30 px-6 py-3 rounded bg-emerald-950/30 hover:bg-emerald-950/50 transition-all uppercase text-xs tracking-wider">
                  <ArrowLeft className="w-4 h-4" /> Return to Comms
                </Link>
              </div>
          </div>
        </Shell>
      );
    }

    // 2. Ambil Riwayat Chat
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: freelancerId, receiverId: clientId },
          { senderId: clientId, receiverId: freelancerId }
        ]
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        text: true, 
        senderId: true,
        createdAt: true
      }
    });

    // Transform messages untuk match type CommsTerminal
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      text: msg.text,
      senderId: msg.senderId,
      createdAt: msg.createdAt
    }));

    return (
      <Shell userRole="freelancer" isLoggedIn={true}>
        {/* Container Utama dengan Background Grid Sci-Fi */}
        <div className="flex flex-col h-[calc(100vh-2rem)] overflow-hidden bg-slate-950 relative">
          
          {/* Background Elements */}
          <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-emerald-900/10 to-transparent pointer-events-none" />

          {/* Header Status Bar (Mission Control Style) */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-900/30 bg-slate-900/80 backdrop-blur-md z-20 shrink-0 shadow-lg">
             {/* Kiri: Tombol Kembali & Info Client */}
             <div className="flex items-center gap-4">
                <Link 
                  href="/guild/messages" 
                  className="group flex items-center justify-center w-10 h-10 rounded-lg bg-slate-800 border border-slate-700 hover:border-emerald-500 hover:bg-emerald-900/20 transition-all"
                  title="Back to Inbox"
                >
                  <ArrowLeft className="w-5 h-5 text-slate-400 group-hover:text-emerald-400" />
                </Link>
                
                <div className="h-8 w-px bg-slate-800 hidden sm:block"></div>
                
                <div>
                  <h1 className="text-emerald-400 font-bold tracking-widest text-xs uppercase flex items-center gap-2">
                    <Radio className="w-3 h-3 animate-pulse" /> Secure Uplink
                  </h1>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    TARGET: <span className="text-slate-300 font-bold">{clientUser.name || "UNKNOWN"}</span>
                  </p>
                </div>
             </div>

             {/* Kanan: Indikator Status */}
             <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                   <span className="text-[10px] text-emerald-600 font-mono flex items-center gap-1">
                     <Lock className="w-3 h-3" /> ENCRYPTED
                   </span>
                   <span className="text-[9px] text-slate-600 font-mono">P2P // 256-BIT</span>
                </div>
                
                <div className="flex flex-col items-end">
                   <div className="flex items-end gap-0.5 h-4">
                     <div className="w-1 h-2 bg-emerald-500 rounded-sm"></div>
                     <div className="w-1 h-3 bg-emerald-500 rounded-sm"></div>
                     <div className="w-1 h-4 bg-emerald-500 rounded-sm"></div>
                     <div className="w-1 h-3 bg-emerald-500/50 animate-pulse rounded-sm"></div>
                   </div>
                </div>
             </div>
          </div>

          {/* Area Chat Utama */}
          <div className="flex-1 p-4 md:p-6 overflow-hidden relative z-10 flex flex-col">
            <CommsTerminal 
              initialMessages={formattedMessages as any}
              currentUserId={freelancerId}
              recipientName={clientUser.name || clientUser.email || "Unknown Client"}
              recipientId={clientId}
              onSendMessage={sendMessageAction}
            />
          </div>
        </div>
      </Shell>
    );

  } catch (error) {
    console.error("Database Connection Error:", error);
    
    return (
      <Shell userRole="freelancer" isLoggedIn={true}>
        <div className="max-w-4xl mx-auto p-6 flex flex-col items-center justify-center h-[calc(100vh-100px)]">
            <div className="p-10 text-center text-red-400 font-mono border border-red-500/30 bg-red-950/20 rounded-xl max-w-lg shadow-[0_0_50px_rgba(220,38,38,0.1)] backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10 mix-blend-overlay"></div>
                <AlertTriangle className="w-16 h-16 mx-auto mb-6 text-red-500 animate-pulse" />
                <h2 className="text-2xl font-bold mb-3 uppercase tracking-widest text-white">System Failure</h2>
                <p className="mb-6 text-sm text-red-300/80 leading-relaxed">
                  Unable to establish uplink with the central database. <br/>The connection timed out or was refused.
                </p>
                <div className="text-[10px] bg-black/80 p-4 rounded-lg text-left overflow-auto max-h-32 font-mono text-red-500/70 mb-8 border border-red-900/50 shadow-inner">
                  {String(error)}
                </div>
                <Link 
                  href="/guild/messages" 
                  className="inline-flex items-center gap-2 px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all text-sm font-bold uppercase tracking-wider shadow-lg shadow-red-900/20 hover:scale-105"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Abort Mission
                </Link>
            </div>
        </div>
      </Shell>
    );
  }
}