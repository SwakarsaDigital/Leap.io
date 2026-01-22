'use client';

import React, { useState } from 'react';
import { Zap, AlertCircle } from 'lucide-react';
import { upgradeToFreelancer } from './actions';

export function UpgradeButton({ role }: { role: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (role !== 'client') {
    return null;
  }

  const handleUpgrade = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await upgradeToFreelancer();
      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error || 'Gagal upgrade');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat upgrade');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      <button 
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/20 rounded-2xl p-6 flex items-center justify-between group hover:border-yellow-500/50 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20 group-hover:scale-110 transition-transform">
            <Zap size={24} className="text-yellow-400" />
          </div>
          <div className="text-left">
            <h4 className="text-white font-bold text-sm uppercase tracking-tight italic">
              {loading ? 'Upgrading...' : 'Upgrade ke Freelancer'}
            </h4>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Mulai terima proyek dan dapatkan penghasilan.</p>
          </div>
        </div>
        <Zap size={20} className="text-yellow-500 group-hover:text-orange-500 transition-colors" />
      </button>
    </div>
  );
}