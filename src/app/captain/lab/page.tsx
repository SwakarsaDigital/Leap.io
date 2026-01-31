import React from 'react';
import { FlaskConical } from 'lucide-react';

export default function CaptainLabPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
            <FlaskConical size={64} className="mx-auto text-red-500 mb-6 opacity-50" />
            <h1 className="text-2xl font-bold text-white mb-2">Tactical Lab Oversight</h1>
            <p className="text-slate-500">
                Fitur eksperimental sedang dalam pengembangan. Area ini digunakan untuk memantau riset dan pengembangan fitur baru guild.
            </p>
        </div>
    </div>
  );
}