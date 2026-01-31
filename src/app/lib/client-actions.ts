'use server'

import { prisma } from './prisma'
import { auth } from '../../auth' // Menggunakan alias @/auth agar konsisten
import { revalidatePath } from 'next/cache'

export async function launchProject(formData: FormData) {
  // 1. Cek Sesi (Security)
  const session = await auth()
  if (!session?.user?.email) {
    return { success: false, message: 'Unauthorized: No active session.' }
  }

  // 2. Ambil Data dari Form
  const projectName = formData.get('name') as string
  const budgetStr = formData.get('budget') as string
  const description = formData.get('description') as string
  const freelancerId = formData.get('freelancerId') as string // Tangkap ID Freelancer
  const budget = parseInt(budgetStr) || 1000

  if (!projectName) {
    return { success: false, message: 'Project Name is required.' }
  }

  try {
    // 3. Cari User ID berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return { success: false, message: 'User profile not found.' }
    }

    // 4. Buat Project Baru di Database
    const newProject = await prisma.project.create({
      data: {
        name: projectName,
        status: 'active', // Project langsung aktif
        retainerFee: budget,
        clientId: user.id, // Hubungkan dengan Client yang sedang login
      }
    })

    // 5. Auto-Generate Starter Quest (SINGLE MAIN QUEST)
    // Jika freelancerId ada (tidak string kosong), quest akan assigned ke dia.
    // Jika tidak ada, assignedToId jadi null (Open Job).
    const targetAgent = freelancerId && freelancerId !== "" ? freelancerId : null;

    // Format deskripsi lengkap agar Freelancer melihat detail tugas dalam satu kartu
    const fullDescription = `
**PROJECT DIRECTIVE:** ${projectName}

**MISSION BRIEF:**
${description}

**REWARD & BUDGET:**
Budget: $${budget} (Upon Completion)

**ADDITIONAL FILES (ASSETS):**
(Waiting for client upload secure link...)
    `.trim();

    // HANYA MEMBUAT 1 QUEST UTAMA (Bukan createMany)
    await prisma.quest.create({
      data: {
        title: `Execute Project: ${projectName}`, // Judul Quest Utama
        description: fullDescription,             // Deskripsi lengkap yang diformat
        difficulty: 'hard',                       // Project utama biasanya level Hard
        reward: 500,                              // XP Besar untuk project utama
        status: 'todo',
        assignedToId: targetAgent,                // Direct Assignment ke Freelancer
        projectId: newProject.id
      }
    })

    // 6. Refresh Halaman
    revalidatePath('/client') 
    revalidatePath('/quests') 
    
    return { success: true, message: `Project deployed! Assignment sent to ${targetAgent ? 'selected agent' : 'open board'}.` }

  } catch (error) {
    console.error('Launch Project Error:', error)
    return { success: false, message: 'System Malfunction: Failed to deploy project.' }
  }
}