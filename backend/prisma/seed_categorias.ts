import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MODALIDADES = [
  { nombre: 'Paso Fino', slug: 'paso-fino' },
  { nombre: 'Trocha', slug: 'trocha' },
  { nombre: 'Trocha y Galope', slug: 'trocha-y-galope' },
  { nombre: 'Trote y Galope', slug: 'trote-y-galope' },
  { nombre: 'Asnales y Mulares', slug: 'asnales-y-mulares' }
];

const SEXOS = [
  { nombre: 'Machos' },
  { nombre: 'Hembras' }
];

const EDADES = [
  { nombre: '36-48 meses', min: 36, max: 48 },
  { nombre: '48-60 meses', min: 48, max: 60 },
  { nombre: '60-78 meses', min: 60, max: 78 },
  { nombre: '78-100 meses', min: 78, max: 100 },
  { nombre: 'Mayor 100 meses', min: 100, max: null }
];

async function main() {
  console.log('🚀 Iniciando seed de categorías jerárquicas...');

  // 1. Crear Modalidades
  console.log('Creating Modalities...');
  for (const mod of MODALIDADES) {
    await prisma.competitionModality.upsert({
      where: { nombre: mod.nombre },
      update: {},
      create: { nombre: mod.nombre, slug: mod.slug }
    });
  }

  // 2. Crear Sexos
  console.log('Creating Sexes...');
  for (const sexo of SEXOS) {
    await prisma.competitionSex.upsert({
      where: { nombre: sexo.nombre },
      update: {},
      create: { nombre: sexo.nombre }
    });
  }

  // 3. Crear Rangos de Edad
  console.log('Creating Age Ranges...');
  for (const edad of EDADES) {
    await prisma.competitionAgeRange.upsert({
      where: { nombre: edad.nombre },
      update: {},
      create: { 
        nombre: edad.nombre, 
        edadMin: edad.min, 
        edadMax: edad.max 
      }
    });
  }

  // Obtener todos para cruzar IDs
  const dbModalities = await prisma.competitionModality.findMany();
  const dbSexes = await prisma.competitionSex.findMany();
  const dbAges = await prisma.competitionAgeRange.findMany();

  // 4. Crear Categorías de Unión (Junction Table)
  console.log('Building Junction Categories...');
  for (const mod of dbModalities) {
    for (const sexo of dbSexes) {
      for (const age of dbAges) {
        const nombreCompleto = `${mod.nombre} - ${sexo.nombre} - ${age.nombre}`;
        const slug = `${mod.slug}-${sexo.nombre.toLowerCase()}-${age.nombre.toLowerCase().replace(/ /g, '-')}`;

        await prisma.competitionCategory.upsert({
          where: { nombre: nombreCompleto },
          update: {},
          create: {
            nombre: nombreCompleto,
            slug,
            modalidadId: mod.id,
            sexoId: sexo.id,
            rangoEdadId: age.id,
            activa: true
          }
        });
        console.log(`✅ ${nombreCompleto}`);
      }
    }
  }

  console.log('✨ Jerarquía profesional establecida correctamente.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
