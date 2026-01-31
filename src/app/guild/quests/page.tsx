import React from 'react';
import { auth } from '../../../auth';
import { prisma } from '../../lib/prisma';
import QuestBoard, { Quest } from '../../components/quest/QuestBoard';

// Memastikan halaman selalu mengambil data terbaru dari database
export const dynamic = 'force-dynamic';

export default async function QuestsPage() {
  // 1. Ambil Session User untuk mengetahui Role
  const session = await auth();
  const userRole = session?.user?.role || 'freelancer';

  // 2. Ambil Data Quests dari Database
  // Kita urutkan berdasarkan update terakhir agar perubahan status terlihat di atas
  const rawQuests = await prisma.quest.findMany({
    orderBy: {
      updatedAt: 'desc',
    },
    include: {
      assignedTo: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  // 3. Transformasi Data agar sesuai dengan Interface QuestBoard
  // Data dari Prisma (Date object) perlu di-serialize ke string agar aman dikirim ke Client Component
  const initialQuests: Quest[] = rawQuests.map((quest: { id: any; title: any; description: any; projectId: any; reward: any; difficulty: any; status: any; commitLink: any; videoLink: any; createdAt: { toISOString: () => any; }; assignedTo: any; }) => ({
    id: quest.id,
    title: quest.title,
    description: quest.description,
    projectId: quest.projectId,
    reward: quest.reward,
    difficulty: quest.difficulty,
    status: quest.status, // Values: 'open', 'in_progress', 'review', 'done'
    commitLink: quest.commitLink,
    videoLink: quest.videoLink,
    createdAt: quest.createdAt.toISOString(), // Convert Date to ISO string
    assignee: quest.assignedTo, 
  }));

  // 4. Render QuestBoard (Client Component)
  return (
    <div className="h-[calc(100vh-64px)] overflow-hidden bg-[#050505]">
      <QuestBoard initialQuests={initialQuests} userRole={userRole} />
    </div>
  );
}