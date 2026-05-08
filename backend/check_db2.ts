import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.competencia.count({ where: { estado: 'abierta' }});
  console.log('Competencias abiertas:', count);
  const ferias = await prisma.feria.findMany({ include: { competencias: true }});
  console.log(JSON.stringify(ferias, null, 2));
}
main().finally(() => prisma.$disconnect());
