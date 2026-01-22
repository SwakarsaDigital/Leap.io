'use client';

import React, { useState } from 'react';
import { PlusCircle, X, Rocket, Loader2, DollarSign, Target } from 'lucide-react';
// Menggunakan alias @/ untuk memastikan resolusi path yang stabil di Next.js
import { createProject } from '../../lib/actions';

/**
 * Komponen LaunchProjectButton
 * Menangani modal untuk membuat proyek baru oleh Client.
 */
export default function LaunchProjectButton({ variant = 'default' }: { variant?: 'default' | 'ghost' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [retainerFee, setRetainerFee] = useState('100');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Memanggil server action untuk menyimpan proyek ke database
      const result = await createProject(projectName, Number(retainerFee));
      if (result.success) {
        setIsOpen(false);
        setProjectName('');
        setRetainerFee('100');
      } else {
        // Menampilkan pesan error jika gagal
        console.error("Launch error:", result.error);
      }
    } catch (error) {
      console.error("Gagal meluncurkan proyek:", error);
    } finally {
      setLoading(false);
    }
  };

  // Varian tombol untuk ditempatkan di Header
  if (variant === 'ghost') {
    return (
      <>
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-blue-900/40 group"
        >
          <Rocket size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" /> 
          Luncurkan Proyek Baru
        </button>
        {isOpen && (
          <Modal 
            onClose={() => setIsOpen(false)} 
            onSubmit={handleSubmit} 
            loading={loading} 
            projectName={projectName} 
            setProjectName={setProjectName} 
            retainerFee={retainerFee} 
            setRetainerFee={setRetainerFee} 
          />
        )}
      </>
    );
  }

  // Tampilan tombol standar di dalam kartu daftar proyek
  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/5 px-3 py-1.5 rounded-lg border border-blue-500/20"
      >
        <PlusCircle size={14} /> Proyek Baru
      </button>

      {isOpen && (
        <Modal 
          onClose={() => setIsOpen(false)} 
          onSubmit={handleSubmit} 
          loading={loading} 
          projectName={projectName} 
          setProjectName={setProjectName} 
          retainerFee={retainerFee} 
          setRetainerFee={setRetainerFee} 
        />
      )}
    </>
  );
}

/**
 * Sub-komponen Modal Formulir
 */
function Modal({ onClose, onSubmit, loading, projectName, setProjectName, retainerFee, setRetainerFee }: any) {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-300">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                    <Rocket className="text-blue-500" /> Inisialisasi Proyek
                </h3>
                <p className="text-slate-400 text-xs mb-6 font-mono uppercase tracking-tighter">Protokol Deployment Misi Baru</p>

                <form onSubmit={onSubmit} className="space-y-4 text-left">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Nama Operasi / Proyek</label>
                        <div className="relative group">
                            <Target className="absolute left-3 top-2.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="text" 
                                required
                                placeholder="Misal: Portal E-Commerce V2"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none placeholder:text-slate-700 transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Biaya Bulanan (USD)</label>
                        <div className="relative group">
                            <DollarSign className="absolute left-3 top-2.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input 
                                type="number" 
                                required
                                min="1"
                                placeholder="100"
                                value={retainerFee}
                                onChange={(e) => setRetainerFee(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:border-blue-500 focus:outline-none transition-all font-mono"
                            />
                        </div>
                        <p className="text-[9px] text-slate-600 mt-2 italic">*Biaya pemeliharaan otomatis saat mode Cryosleep aktif.</p>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                            Batalkan
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading || !projectName}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed group"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : (
                                <>
                                    Luncurkan Misi
                                    <Rocket size={14} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}