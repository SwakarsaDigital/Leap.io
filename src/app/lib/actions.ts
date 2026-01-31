'use server';

import { prisma } from './prisma';
import { auth } from '../../auth';
import { revalidatePath } from 'next/cache';

/**
 * --- SISTEM IDENTITAS & ROLE ---
 */

// 1. Inisialisasi Freelancer (Onboarding Form)
export async function initializeFreelancer(formData: { 
  role_class: string, 
  bio: string,
  username: string 
}) {
  const session = await auth();
  if (!session?.user?.email) return { success: false, error: "Sesi tidak valid." };

  const classStats: Record<string, { logic: number, speed: number, aesthetic: number }> = {
    'Frontend Paladin': { logic: 40, speed: 60, aesthetic: 90 },
    'Backend Necromancer': { logic: 95, speed: 50, aesthetic: 20 },
    'Fullstack Sorcerer': { logic: 70, speed: 70, aesthetic: 70 },
    'DevOps Warden': { logic: 80, speed: 90, aesthetic: 10 }
  };

  const selectedStats = classStats[formData.role_class] || classStats['Fullstack Sorcerer'];

  try {
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        role: 'freelancer',
        username: formData.username,
        bio: formData.bio,
        logic: selectedStats.logic,
        speed: selectedStats.speed,
        aesthetic: selectedStats.aesthetic,
        level: 1,
        xp: 0,
        maxXp: 1000,
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'IDENTITY_INITIALIZED',
        detail: `Agen baru lahir sebagai ${formData.role_class}.`,
        userId: updatedUser.id,
      }
    });

    revalidatePath('/guild');
    revalidatePath('/guild/profile');
    return { success: true };
  } catch (error) {
    return { success: false, error: "Gagal menginisialisasi identitas." };
  }
}

// 2. Upgrade Identitas Cepat (Client -> Freelancer Default)
export async function upgradeToFreelancer() {
  const session = await auth();
  if (!session?.user?.email) return { success: false, error: "Sesi tidak valid." };

  try {
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        role: 'freelancer',
        speed: 50,
        logic: 50,
        aesthetic: 50,
        level: 1,
        xp: 0,
        maxXp: 1000,
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'IDENTITY_UPGRADE',
        detail: 'User upgraded from Client to Freelancer status.',
        userId: user.id,
      }
    });

    revalidatePath('/guild/profile');
    revalidatePath('/guild');
    return { success: true };
  } catch (error) {
    console.error("Upgrade error:", error);
    return { success: false, error: "Gagal memperbarui identitas." };
  }
}

/**
 * --- SISTEM MANAJEMEN PROYEK (CLIENT) ---
 */

export async function createProject(name: string, retainerFee: number) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const project = await prisma.project.create({
      data: {
        name,
        retainerFee: Number(retainerFee),
        clientId: session.user.id,
        status: 'active',
      }
    });

    await prisma.activityLog.create({
      data: {
        action: 'PROJECT_LAUNCHED',
        detail: `Proyek baru diinisialisasi: ${name}`,
        userId: session.user.id,
      }
    });

    revalidatePath('/client');
    revalidatePath('/guild/profile');
    return { success: true, project };
  } catch (error) {
    console.error("Project launch failed:", error);
    return { success: false, error: "Gagal menyimpan proyek." };
  }
}

/**
 * --- QUEST & KANBAN SYSTEM ---
 */

// Aliased for compatibility with different component calls
export async function moveQuestCard(questId: string, newStatus: string) {
  return updateQuestStatus(questId, newStatus);
}

export async function updateQuestStatus(questId: string, newStatus: string) {
  try {
    await prisma.quest.update({
      where: { id: questId },
      data: { status: newStatus },
    });
    revalidatePath('/guild/quests');
    revalidatePath('/captain/missions');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal update status' };
  }
}

// Aliased for compatibility
export async function submitQuestLoot(questId: string, commitLink: string, videoLink: string) {
    return submitLoot(questId, commitLink, videoLink);
}

export async function submitLoot(questId: string, commitLink: string, videoLink: string) {
  try {
    if (!commitLink || !videoLink) throw new Error("Proof is mandatory");

    await prisma.quest.update({
      where: { id: questId },
      data: {
        status: 'review', // Standardized to 'review' for loot_drop
        commitLink: commitLink,
        videoLink: videoLink,
      },
    });
    
    revalidatePath('/guild/quests');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Gagal mengirim loot' };
  }
}

// Aliased for compatibility
export async function reviewQuestLoot(questId: string, decision: 'approve' | 'reject') {
    // We need to fetch the quest to get userId and reward if we reuse logic
    const quest = await prisma.quest.findUnique({ where: { id: questId } });
    if (!quest) return { success: false, message: 'Quest not found' };
    
    return reviewQuest(questId, decision, quest.assignedToId || '', quest.reward);
}

export async function reviewQuest(questId: string, decision: 'approve' | 'reject', userId: string, reward: number) {
  try {
    if (decision === 'approve') {
      if (!userId) throw new Error("User ID missing");

      const currentUser = await prisma.user.findUnique({ where: { id: userId } });
      if (!currentUser) throw new Error("User not found");

      let newXp = (currentUser.xp || 0) + (reward || 0);
      let newLevel = currentUser.level || 1;
      let newMaxXp = currentUser.maxXp || 1000;
      let leveledUp = false;

      while (newXp >= newMaxXp) {
        newXp = newXp - newMaxXp;
        newLevel = newLevel + 1;
        newMaxXp = Math.floor(newMaxXp * 1.2);
        leveledUp = true;
      }

      await prisma.$transaction([
        prisma.quest.update({ where: { id: questId }, data: { status: 'done' } }),
        prisma.user.update({
          where: { id: userId },
          data: { 
            xp: newXp,
            level: newLevel,
            maxXp: newMaxXp,
            activities: {
              create: [
                { action: "Quest Completed", detail: "Loot approved by Captain", xpGained: reward || 0 },
                ...(leveledUp ? [{ action: "LEVEL UP!", detail: `Reached Level ${newLevel}.`, xpGained: 0 }] : [])
              ]
            }
          }
        })
      ]);
    } else {
      await prisma.quest.update({ where: { id: questId }, data: { status: 'in_progress' } }); // Back to combat
    }

    revalidatePath('/captain/missions'); 
    revalidatePath('/guild/quests');   
    return { success: true };
  } catch (error) {
    console.error("Review failed:", error);
    return { success: false, error: 'Review failed' };
  }
}

/**
 * --- CRYOSLEEP & RECRUITMENT ---
 */

export async function toggleSummon(projectId: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === 'maintenance' ? 'summoned' : 'maintenance';
    await prisma.project.update({
      where: { id: projectId },
      data: { 
        status: newStatus,
        lastSummoned: newStatus === 'summoned' ? new Date() : undefined
      }
    });
    revalidatePath('/guild/cryosleep');
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Summon failed' };
  }
}

export async function getAvailableFreelancers() {
  try {
    return await prisma.user.findMany({
      where: { role: 'freelancer' },
      select: {
        id: true,
        name: true,
        level: true,
        xp: true,
        speed: true,
        logic: true,
        aesthetic: true,
        image: true,
        username: true,
      },
      orderBy: { level: 'desc' },
      take: 6
    });
  } catch (error) {
    return [];
  }
}

/**
 * --- CLIENT ACTIONS ---
 */
export async function launchProject(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return { success: false, message: 'Unauthorized' };
    }

    // Ambil data user dari database untuk mendapatkan ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
        return { success: false, message: 'User not found' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const budget = Number(formData.get('budget'));
    const freelancerId = formData.get('freelancerId') as string; // Bisa string kosong

    if (!name || !description || !budget) {
      return { success: false, message: 'Semua kolom wajib diisi' };
    }

    // Buat Proyek Baru
    const project = await prisma.project.create({
      data: {
        name,
        retainerFee: budget, // Mapping budget to retainerFee
        clientId: user.id,
        status: 'active',
      },
    });

    // Jika ada freelancer yang dipilih, buat Quest awal atau assign project?
    if (freelancerId && freelancerId !== '') {
        await prisma.quest.create({
            data: {
                title: `Initial Setup: ${name}`,
                description: description,
                reward: Math.floor(budget * 0.1), // 10% XP dari budget
                difficulty: 'medium',
                status: 'todo',
                projectId: project.id,
                assignedToId: freelancerId
            }
        });
    } else {
        // Buat Open Quest
        await prisma.quest.create({
            data: {
                title: `Project Kickoff: ${name}`,
                description: description,
                reward: Math.floor(budget * 0.1),
                difficulty: 'medium',
                status: 'open', // Open for grabs
                projectId: project.id
            }
        });
    }

    revalidatePath('/client');
    return { success: true, message: 'Project launched successfully' };
  } catch (error) {
    console.error('Failed to launch project:', error);
    return { success: false, message: 'Database error: Failed to launch project.' };
  }
}

/**
 * --- CHAT & COMMUNICATIONS (DIRECT UPLINK) ---
 */

// 1. Mengambil partner chat terbaru untuk Sidebar
export async function getRecentChatPartners() {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id }
        ]
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, image: true, role: true } },
        receiver: { select: { id: true, name: true, image: true, role: true } }
      }
    });

    const partnersMap = new Map();
    messages.forEach((msg) => {
      const partner = msg.senderId === session.user.id ? msg.receiver : msg.sender;
      if (partner && partner.id !== session.user.id && !partnersMap.has(partner.id)) {
        partnersMap.set(partner.id, {
            ...partner,
            // FIX: Menggunakan 'text' dan casting 'as any' untuk keamanan jika tipe belum update
            lastMessage: (msg as any).text || (msg as any).content || 'New Message' 
        });
      }
    });

    return Array.from(partnersMap.values());
  } catch (error) {
    console.error("Gagal mengambil partner chat:", error);
    return [];
  }
}

// 2. Mengirim Pesan
export async function sendMessage(receiverId: string, text: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const message = await prisma.message.create({
      data: {
        text: text, // FIX: Menggunakan 'text' sebagai nama kolom di database
        senderId: session.user.id,
        receiverId: receiverId,
      }
    });

    revalidatePath('/client'); 
    revalidatePath(`/client/chat/${receiverId}`);
    revalidatePath(`/guild/messages/${receiverId}`);
    return { success: true, message };
  } catch (error) {
    console.error("Chat error:", error);
    return { success: false, error: "Gagal mengirim pesan." };
  }
}

// 3. Mengambil Riwayat Chat
export async function getChatHistory(otherUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return [];

  try {
    return await prisma.message.findMany({
      where: {
        OR: [
          { senderId: session.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: session.user.id }
        ]
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: { select: { name: true, role: true, image: true } }
      }
    });
  } catch (error) {
    console.error("Gagal mengambil riwayat chat:", error);
    return [];
  }
}