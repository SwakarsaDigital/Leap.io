import React from 'react';
import { auth } from '../../auth'; // Mengambil sesi user
import { prisma } from '../../app/lib/prisma'; // Mengambil koneksi database
import QuestBoard from '../../app/components/quest/QuestBoard'; // Komponen Client
import { redirect } from 'next/navigation';

// Opsi ini memastikan data selalu fresh (tidak di-cache statis) saat halaman dibuka
export const dynamic = 'force-dynamic';

export default async function QuestPage() {
  // 1. Ambil Session User
  const session = await auth();
  
  // Jika tidak login, tendang ke halaman login
  if (!session?.user) {
    redirect('/login');
  }

  const userId = session.user.id;
  // Pastikan mengambil role yang benar, casting ke any karena custom properties
  const userRole = (session.user as any)?.role || 'freelancer';

  // 2. Tentukan Filter Database Berdasarkan Role
  let whereClause: any = {};

  if (userRole === 'captain') {
    // CAPTAIN: Melihat SEMUA quest tanpa filter
    whereClause = {};
  } 
  else if (userRole === 'client') {
    // CLIENT: Hanya melihat quest dari Project miliknya sendiri
    whereClause = {
      project: {
        clientId: userId
      }
    };
  } 
  else {
    // FREELANCER (Default):
    // 1. Melihat quest yang ditugaskan ke dirinya sendiri (Assigned to Me)
    // 2. ATAU Melihat quest yang belum ada pemiliknya (assignedToId = null) -> Open for grab
    whereClause = {
      OR: [
        { assignedToId: userId }, // Tugas saya
        { assignedToId: null }    // Tugas kosong (Open Job)
      ]
    };
  }

  // 3. Ambil data Quest dari Database dengan Filter
  const rawQuests = await prisma.quest.findMany({
    where: whereClause, // <--- Filter dipasang di sini
    orderBy: { createdAt: 'desc' },
    include: {
      assignedTo: { 
        select: {
          name: true,
          image: true,
        },
      },
      // Opsional: Include project info jika ingin ditampilkan di kartu
      project: {
        select: {
          name: true,
          clientId: true
        }
      }
    },
  });

  // 4. Mapping Data (Adaptasi AssignedTo -> Assignee untuk UI)
  const quests = rawQuests.map((quest) => ({
    ...quest,
    assignee: quest.assignedTo, 
  }));

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col animate-in fade-in duration-500">
      {/* 5. Oper data & role ke komponen Visual */}
      <QuestBoard initialQuests={quests as any} userRole={userRole} />
    </div>
  );
}