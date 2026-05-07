import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
  const [mods, sexes, ages, cats, ferias, horses] = await Promise.all([
    prisma.competitionModality.count(),
    prisma.competitionSex.count(),
    prisma.competitionAgeRange.count(),
    prisma.competitionCategory.count(),
    prisma.feria.count(),
    prisma.caballo.count(),
  ]);
  console.log({ mods, sexes, ages, cats, ferias, horses });
}
check().finally(() => prisma.$disconnect());
