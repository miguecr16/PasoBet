import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
  const [cats, ferias, horses, bets] = await Promise.all([
    prisma.competitionCategory.count(),
    prisma.feria.count(),
    prisma.caballo.count(),
    prisma.apuesta.count(),
  ]);
  console.log({ cats, ferias, horses, bets });
}
check().finally(() => prisma.$disconnect());
