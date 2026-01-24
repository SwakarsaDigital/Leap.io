'use server';

import { auth } from '../../auth';
import { prisma } from './prisma';
import { revalidatePath } from 'next/cache';

export async function sendMessageAction(content: string, receiverId: string) {
  const session = await auth();
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized: Signal lost.");
  }

  if (!content.trim()) {
    return;
  }

  try {
    // Simpan pesan ke database
    await prisma.message.create({
      data: {
        text: content, // Pastikan field di schema.prisma adalah 'text' atau 'content' (sesuaikan dgn schema Anda, di schema sebelumnya tertulis 'text')
        senderId: session.user.id,
        receiverId: receiverId,
        isRead: false,
      },
    });

    // Refresh halaman chat untuk kedua pihak
    revalidatePath(`/guild/messages/${receiverId}`);
    revalidatePath(`/client/chat/${session.user.id}`);
    
    return { success: true };
  } catch (error) {
    console.error("Transmission Failed:", error);
    throw new Error("Failed to send transmission.");
  }
}