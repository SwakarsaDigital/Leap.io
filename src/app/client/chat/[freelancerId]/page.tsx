import React from 'react';
// Memperbaiki jalur impor ke jalur relatif karena alias @/ tidak terdeteksi
import { auth } from '../../../../auth';
import { prisma } from '../../../lib/prisma';
import ChatTerminal from '../../../components/client/ChatTerminal';
import { ChevronLeft, Shield } from 'lucide-react';

/**
 * Halaman Chat Dinamis
 * Memungkinkan komunikasi langsung antara Client dan Freelancer.
 * Menggunakan jalur relatif untuk memastikan kompatibilitas kompilasi.
 */
export default async function App({ params }: { params: Promise<{ freelancerId: string }> }) {
  // Autentikasi sesi
  const session = await auth();
  const { freelancerId } = await params;

  // Proteksi rute manual jika sesi tidak ditemukan
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p className="font-mono text-xs uppercase tracking-widest">Akses Ditolak: Sesi Diperlukan</p>
      </div>
    );
  }

  // Mengambil detail freelancer dari database untuk header
  const freelancer = await prisma.user.findUnique({
    where: { id: freelancerId },
    select: { name: true, role: true }
  });

  // Penanganan jika agen tidak ditemukan
  if (!freelancer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
        <p className="font-mono text-xs uppercase tracking-widest text-red-500">Agen Tidak Ditemukan</p>
        <a href="/client" className="text-slate-500 hover:text-white transition-colors text-[10px] font-bold uppercase no-underline border border-slate-800 px-4 py-2 rounded-lg">
          Kembali ke War Room
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in duration-700">
      {/* Navigasi Header */}
      <div className="mb-6 flex items-center justify-between">
        <a 
          href="/client" 
          className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest no-underline group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          Kembali ke War Room
        </a>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full shadow-sm">
           <Shield size={12} className="text-blue-400" />
           <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter">Protokol Direct Uplink</span>
        </div>
      </div>

      {/* Komponen Chat Utama */}
      <ChatTerminal 
        currentUserId={session.user.id}
        otherUserId={freelancerId}
        otherUserName={freelancer.name || 'Agen Elit'}
      />
      
      {/* Bagian Tips / Info */}
      <div className="mt-8 p-6 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center gap-6 shadow-inner">
         <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl border border-slate-700 shadow-lg">
            💡
         </div>
         <div className="text-left">
            <h4 className="text-white font-bold text-sm uppercase tracking-tight">Saran Kapten:</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-lg">
              Gunakan jalur aman ini untuk memberikan direktif teknis secara spesifik. 
              Freelancer akan menerima notifikasi di terminal mereka dan dapat segera memulai Fase Pertempuran (Combat Phase).
            </p>
         </div>
      </div>
    </div>
  );
}