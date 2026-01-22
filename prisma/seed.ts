import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Create User (The Captain)
  // Upsert = Update if exists, Insert if new
  const captain = await prisma.user.upsert({
    where: { email: 'captain@leap.io' },
    update: {},
    create: {
      email: 'captain@leap.io',
      name: 'The Captain',
      role: 'captain',
      level: 99,
      xp: 9999,
      speed: 100,
      logic: 100,
      aesthetic: 100,
      image: '/images/captain.jpg',
    },
  });

  // 2. Create User (Freelancer Pemula)
  const freelancer = await prisma.user.upsert({
    where: { email: 'dev@leap.io' },
    update: {},
    create: {
      email: 'dev@leap.io',
      name: 'Cyber Freelancer',
      role: 'freelancer',
      level: 5,
      xp: 450,
      speed: 85,
      logic: 92,
      aesthetic: 78,
    },
  });

  // 3. Create Quests (Resetting quests first to avoid duplicates in dev)
  await prisma.quest.deleteMany({}); 
  
  const questsData = [
    {
      title: 'Refactor Auth Middleware',
      difficulty: 'hard',
      reward: 500,
      status: 'combat',
      assignedToId: freelancer.id,
    },
    {
      title: 'Design Frog Mascot SVG',
      difficulty: 'medium',
      reward: 300,
      status: 'todo',
      assignedToId: freelancer.id,
    },
    {
      title: 'Fix Hydration Error',
      difficulty: 'easy',
      reward: 150,
      status: 'loot_drop',
      commitLink: 'github.com/leap/fix-1',
      videoLink: 'loom.com/share/xyz',
      assignedToId: freelancer.id,
    },
  ];

  for (const q of questsData) {
    await prisma.quest.create({
      data: q,
    });
  }

  // 4. Create Cryosleep Projects (Passive Income)
  await prisma.project.deleteMany({}); // Reset projects first

  const projects = [
    {
      name: 'E-Commerce Alumka',
      client: 'Alumka Corp',
      status: 'maintenance',
      retainerFee: 500,
      emergencyRate: 150,
    },
    {
      name: 'Hotel Dwipa Booking',
      client: 'Dwipa Group',
      status: 'summoned', // Ceritanya ini lagi darurat
      retainerFee: 800,
      emergencyRate: 250,
      lastSummoned: new Date(),
    },
    {
      name: 'POS System Maju',
      client: 'Maju Mobilindo',
      status: 'maintenance',
      retainerFee: 300,
      emergencyRate: 100,
    },
  ];

  for (const p of projects) {
    await prisma.project.create({ data: p });
  }

  console.log('✅ Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });