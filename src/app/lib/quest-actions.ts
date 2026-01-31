'use server'

import { prisma } from './prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '../../auth' // Menggunakan alias default Next.js untuk src/
import { awardXpToUser } from './gamification'

// --- ACTION 1: Pindah Kartu (Drag & Drop) ---
export async function moveQuestCard(questId: string, newStatus: string) {
  try {
    await prisma.quest.update({
      where: { id: questId },
      data: { status: newStatus },
    })
    revalidatePath('/quests')
    return { success: true }
  } catch (error) {
    console.error('Failed to move quest:', error)
    return { success: false, error: 'Database error' }
  }
}

// --- ACTION 2: Submit Loot (Freelancer) ---
// Dipanggil oleh QuestBoard.tsx saat user klik "Claim Loot"
export async function submitQuestLoot(questId: string, commitLink: string, videoLink: string) {
  // 1. Validation: "No Proof, No Loot"
  if (!commitLink || !commitLink.includes('http')) {
    return { success: false, message: 'Invalid Commit Link. Must include http/https.' }
  }
  
  if (!videoLink || !videoLink.includes('http')) {
    return { success: false, message: 'Invalid Video Link. Screen record is mandatory.' }
  }

  try {
    // 2. Update Database
    // Status diubah ke 'review' agar Captain bisa mengecek sebelum 'done'
    await prisma.quest.update({
      where: { id: questId },
      data: {
        status: 'review', 
        commitLink: commitLink,
        videoLink: videoLink,
        updatedAt: new Date(),
      },
    })
    
    revalidatePath('/quests')
    return { success: true, message: 'Loot Dropped! Waiting for Captain review.' }
  } catch (error) {
    console.error('Loot submission failed:', error)
    return { success: false, message: 'System Malfunction: Database update failed.' }
  }
}

// --- ACTION 3: Captain's Review (The Hammer & The Shield) ---
// Dipanggil saat Captain klik "Approve" atau "Refactor"
export async function reviewQuestLoot(questId: string, decision: 'approve' | 'reject') {
  const session = await auth()
  
  // Security Check: Hanya Captain yang bisa akses
  // Pastikan role user di database Anda sudah diset 'captain'
  if (session?.user?.role !== 'captain') {
    return { success: false, message: 'ACCESS DENIED: Captain clearance required.' }
  }

  try {
    const quest = await prisma.quest.findUnique({ where: { id: questId } })
    if (!quest) return { success: false, message: 'Quest not found.' }

    if (decision === 'approve') {
      // A. Approve Scenario
      // 1. Mark as Done
      await prisma.quest.update({
        where: { id: questId },
        data: { status: 'done' }
      })

      // 2. Award XP to Assignee (Gamification Hook)
      if (quest.assignedToId) {
        await awardXpToUser(quest.assignedToId, quest.reward)
      }

      revalidatePath('/quests')
      return { success: true, message: 'Quest Approved. XP Transferred.' }

    } else {
      // B. Reject Scenario (Refactor Hammer)
      // 1. Kembalikan ke 'in_progress' agar Freelancer memperbaikinya
      await prisma.quest.update({
        where: { id: questId },
        data: { status: 'in_progress' } // Send back to combat
      })

      revalidatePath('/quests')
      return { success: true, message: 'Quest Rejected. Sent back to combat.' }
    }

  } catch (error) {
    console.error('Review failed:', error)
    return { success: false, message: 'System Malfunction.' }
  }
}