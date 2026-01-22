// app/quests/page.tsx
import React from 'react';
import { prisma } from '../lib/prisma'; // Mengambil koneksi database
import QuestBoard from '../components/quest/QuestBoard'; // Mengambil komponen Client yang sudah kita buat

// Opsi ini memastikan data selalu fresh (tidak di-cache statis) saat halaman dibuka
export const dynamic = 'force-dynamic';

export default async function QuestPage() {
  // 1. Ambil data Quest dari Database (diurutkan dari yang terbaru)
  // Karena ini Server Component, kita bisa pakai 'await' langsung
  const quests = await prisma.quest.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col animate-in fade-in duration-500">
      {/* 2. Oper data dari DB ke komponen Visual (Client Component) */}
      <QuestBoard initialQuests={quests} />
    </div>
  );
}