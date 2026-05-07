import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const MODALIDADES = [
  'Paso Fino',
  'Trocha',
  'Trocha y Galope',
  'Trote y Galope',
  'Asnales y Mulares',
];

const SEXOS = ['Machos', 'Hembras'];

const RANGOS_EDAD = [
  { edadMin: 36, edadMax: 48, label: '36-48' },
  { edadMin: 48, edadMax: 60, label: '48-60' },
  { edadMin: 60, edadMax: 78, label: '60-78' },
  { edadMin: 78, edadMax: 100, label: '78-100' },
  { edadMin: 100, edadMax: null, label: 'Mayor 100' },
];

function makeSlug(modalidad: string, sexo: string, label: string) {
  return `${modalidad}-${sexo}-${label}`
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

async function main() {
  console.log('🌱 Iniciando seed de la base de datos profesional...');

  await prisma.apuesta.deleteMany();
  await prisma.poolApuestas.deleteMany();
  await prisma.participacion.deleteMany();
  await prisma.competencia.deleteMany();
  await prisma.competitionCategory.deleteMany();
  await prisma.feria.deleteMany();
  await prisma.caballo.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🗑️  Base de datos limpiada');

  const adminPassword = await bcrypt.hash('admin123', 12);
  const demoPassword = await bcrypt.hash('demo123', 12);

  await prisma.usuario.create({
    data: {
      email: 'admin@pasobet.com',
      password: adminPassword,
      nombre: 'Administrador PasoBet',
      role: 'ADMIN',
      saldo: 500000,
    },
  });

  await prisma.usuario.create({
    data: {
      email: 'demo@pasobet.com',
      password: demoPassword,
      nombre: 'Carlos Rodríguez',
      role: 'USER',
      saldo: 100000,
    },
  });

  console.log('👤 Usuarios creados');

  const horsesData = [
    { nombre: 'Relámpago Dorado', criadero: 'Hacienda El Roble', sexo: 'Machos', edadMeses: 42 },
    { nombre: 'Cielo Plateado', criadero: 'Finca Las Palmas', sexo: 'Hembras', edadMeses: 54 },
    { nombre: 'Tornado del Sur', criadero: 'Rancho Viento Libre', sexo: 'Machos', edadMeses: 66 },
    { nombre: 'Espíritu Libre', criadero: 'Hacienda Santa Clara', sexo: 'Hembras', edadMeses: 82 },
    { nombre: 'Don Supremo', criadero: 'Establo El Campeón', sexo: 'Machos', edadMeses: 98 },
    { nombre: 'Luna Plateada', criadero: 'Hacienda La Luna', sexo: 'Hembras', edadMeses: 108 },
    { nombre: 'Fuego Vivo', criadero: 'Finca Fuego', sexo: 'Machos', edadMeses: 120 },
    { nombre: 'Rey de Copas', criadero: 'Establo Real', sexo: 'Hembras', edadMeses: 74 },
  ];

  const caballos = await Promise.all(
    horsesData.map((caballo) => prisma.caballo.create({ data: caballo }))
  );

  console.log(`🐴 ${caballos.length} caballos creados`);

  const categorias = [] as Array<{
    modalidad: string;
    sexo: string;
    edadMin: number;
    edadMax: number | null;
    nombre: string;
    slug: string;
  }>;

  for (const modalidad of MODALIDADES) {
    for (const sexo of SEXOS) {
      for (const rango of RANGOS_EDAD) {
        categorias.push({
          modalidad,
          sexo,
          edadMin: rango.edadMin,
          edadMax: rango.edadMax,
          nombre: `${modalidad} ${sexo} ${rango.label}`,
          slug: makeSlug(modalidad, sexo, rango.label),
        });
      }
    }
  }

  await prisma.competitionCategory.createMany({ data: categorias });
  console.log(`🏷️  ${categorias.length} categorías oficiales creadas`);

  const feria = await prisma.feria.create({
    data: {
      nombre: 'Expoequina Medellín 2026',
      lugar: 'Plaza Mayor, Medellín',
      fechaInicio: new Date('2026-09-09'),
      fechaFin: new Date('2026-09-12'),
      estado: 'activa',
    },
  });

  const activeCategorySlugs = [
    'paso-fino-machos-36-48',
    'paso-fino-hembas-60-78',
    'trocha-y-galope-hembas-mayor-100',
    'trote-y-galope-machos-78-100',
  ];

  const activeCategories = await prisma.competitionCategory.findMany({
    where: { slug: { in: activeCategorySlugs } },
  });

  const competencias = await Promise.all(
    activeCategories.map((categoria) => prisma.competencia.create({
      data: {
        feriaId: feria.id,
        categoriaId: categoria.id,
        estado: 'abierta',
      },
    }))
  );

  console.log(`🎯 ${competencias.length} competencias activas creadas para la feria demo`);

  const horsesToAssign = caballos.slice(0, 4);

  for (const competencia of competencias) {
    for (const horse of horsesToAssign) {
      await prisma.participacion.create({
        data: {
          competenciaId: competencia.id,
          caballoId: horse.id,
        },
      });
      await prisma.poolApuestas.create({
        data: {
          competenciaId: competencia.id,
          caballoId: horse.id,
          totalApostado: 0,
        },
      });
    }
  }

  console.log('🔗 Participaciones y pools iniciales creados');
  console.log('✅ Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

