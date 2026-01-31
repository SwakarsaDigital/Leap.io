import React from 'react';
import { auth } from '../../../auth';
import { prisma } from '../../../app/lib/prisma';
import { redirect } from 'next/navigation';
import { User, Shield, Building } from 'lucide-react';

export default async function ClientProfilePage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/login');

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <Shield className="text-blue-500" /> Identity Profile
        </h1>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
            <div className="flex items-center gap-6 mb-8 border-b border-slate-800 pb-8">
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                    {user.name?.[0]?.toUpperCase() || 'C'}
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                    <p className="text-blue-400 font-mono text-sm">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold uppercase tracking-wider">
                        {user.role}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-slate-500 text-xs uppercase font-bold mb-2">Company Name</label>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 flex items-center gap-2">
                        <Building size={16} className="text-slate-500" />
                        {user.company || 'Not set'}
                    </div>
                </div>
                <div>
                    <label className="block text-slate-500 text-xs uppercase font-bold mb-2">Account ID</label>
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-300 font-mono">
                        {user.id}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}