import React from 'react';
import { FlaskConical } from 'lucide-react';

export default function GuildLabPage() {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8 flex items-center justify-center">
        <div className="text-center max-w-md">
            <FlaskConical size={64} className="mx-auto text-green-500 mb-6 opacity-50" />
            <h1 className="text-2xl font-bold text-white mb-2">The Lab</h1>
            <p className="text-slate-500">
                Area eksperimen. Di sini kamu bisa mencoba fitur beta atau alat bantu dev yang sedang dikembangkan.
            </p>
        </div>
    </div>
  );
}