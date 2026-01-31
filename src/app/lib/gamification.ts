import { prisma } from './prisma'

// Logic: Level Up setiap kelipatan 1000 XP (Linear Progression untuk MVP)
const XP_PER_LEVEL = 1000

export async function awardXpToUser(userId: string, xpAmount: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, xp: true, level: true, maxXp: true }
  })

  if (!user) return null

  let newXp = user.xp + xpAmount
  let newLevel = user.level
  let newMaxXp = user.maxXp

  // Level Up Logic
  if (newXp >= user.maxXp) {
    newLevel += 1
    newXp = newXp - user.maxXp // Carry over excess XP
    newMaxXp = newMaxXp + 200 // Increase requirement for next level (Dynamic scaling)
    
    // TODO: Trigger Notification "LEVEL UP!"
  }

  // Update Database
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      xp: newXp,
      level: newLevel,
      maxXp: newMaxXp,
      activities: {
        create: {
          action: 'QUEST_COMPLETE',
          detail: `Earned ${xpAmount} XP.`,
          xpGained: xpAmount
        }
      }
    }
  })

  return updatedUser
}