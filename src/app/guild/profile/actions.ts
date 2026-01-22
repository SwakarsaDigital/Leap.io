'use server';

import { prisma } from '../../lib/prisma';
import { auth } from '../../../auth';
import { revalidatePath } from 'next/cache';

/**
 * 1. UPGRADE IDENTITY (Client -> Freelancer)
 */
export async function upgradeToFreelancer() {
  const session = await auth();
  
  if (!session?.user?.email) {
    return { success: false, error: "Sesi tidak valid. Silakan login kembali." };
  }

  try {
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        role: 'freelancer',
        speed: 50,
        logic: 50,
        aesthetic: 50,
        level: 1,
        xp: 0,
      }
    });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (user) {
      await prisma.activityLog.create({
        data: {
          action: 'IDENTITY_UPGRADE',
          detail: 'User upgraded from Client to Freelancer status.',
          userId: user.id,
        }
      });
    }

    revalidatePath('/guild/profile');
    revalidatePath('/guild');
    
    return { success: true };
  } catch (error) {
    console.error("Upgrade error:", error);
    return { success: false, error: "Gagal memperbarui identitas di database." };
  }
}

/**
 * 2. SEND MESSAGE (Persistensi Chat)
 */
export async function sendMessage(receiverId: string, text: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const message = await prisma.message.create({
      data: {
        text,
        senderId: session.user.id,
        receiverId: receiverId,
      }
    });

    revalidatePath('/client');
    return { success: true, message };
  } catch (error) {
    console.error("Send message error:", error);
    throw new Error("Gagal mengirim pesan.");
  }
}

/**
 * 3. GET AVAILABLE FREELANCERS (Untuk AI Recruiter)
 */
export async function getAvailableFreelancers() {
  return await prisma.user.findMany({
    where: {
      role: { in: ['freelancer', 'captain'] }
    },
    select: {
      id: true,
      name: true,
      image: true,
      level: true,
      xp: true,
      speed: true,
      logic: true,
      aesthetic: true,
    },
    orderBy: { level: 'desc' },
    take: 6
  });
}

/**
 * 4. UPDATE QUEST STATUS (Kanban Board)
 */
export async function updateQuestStatus(id: string, newStatus: string) {
  await prisma.quest.update({
    where: { id },
    data: { status: newStatus },
  });
  revalidatePath('/quests');
}

/**
 * 5. SUBMIT LOOT (Penyelesaian Quest)
 */
export async function submitLoot(id: string, commitLink: string, videoLink: string) {
  await prisma.quest.update({
    where: { id },
    data: { 
      status: 'loot_drop',
      commitLink,
      videoLink
    },
  });
  revalidatePath('/quests');
}

/**
 * 6. TOGGLE SUMMON (Cryosleep Stasis)
 */
export async function toggleSummon(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'summoned' ? 'maintenance' : 'summoned';
    await prisma.project.update({
        where: { id },
        data: { 
            status: newStatus,
            lastSummoned: newStatus === 'summoned' ? new Date() : undefined
        }
    });
    revalidatePath('/guild/cryosleep');
}