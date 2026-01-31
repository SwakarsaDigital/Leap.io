import React from 'react';
import { auth } from '../../../auth';
import AiRecruiter from '../../../app/components/landing/AiRecruiter';
import { redirect } from 'next/navigation';
import { Bot } from 'lucide-react';

export default async function ClientRecruitmentPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== 'client') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Bot className="text-blue-500" /> AI Recruiter Hub
            </h1>
            <p className="text-slate-400 mt-2">Deploy new squads using our advanced matchmaking algorithm.</p>
        </header>
        
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
             <AiRecruiter userEmail={session.user.email || ''} />
        </div>
      </div>
    </div>
  );
}