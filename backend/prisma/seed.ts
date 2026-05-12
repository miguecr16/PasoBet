import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const MODALIDADES = [
  { nombre: 'Paso Fino', slug: 'paso-fino' },
  { nombre: 'Trocha', slug: 'trocha' },
  { nombre: 'Trocha y Galope', slug: 'trocha-y-galope' },
  { nombre: 'Trote y Galope', slug: 'trote-y-galope' },
  { nombre: 'Asnales y Mulares', slug: 'asnales-y-mulares' },
];

const SEXOS = ['Machos', 'Hembras'];

const RANGOS_EDAD = [
  { edadMin: 36, edadMax: 48, label: '36-48' },
  { edadMin: 48, edadMax: 60, label: '48-60' },
  { edadMin: 60, edadMax: 78, label: '60-78' },
  { edadMin: 78, edadMax: 100, label: '78-100' },
  { edadMin: 100, edadMax: null, label: 'Mayor 100' },
];

const FERIAS = [
  { nombre: 'Gran Premio Nacional del Paso Fino', lugar: 'Bogotá, D.C.', estado: 'activa' },
  { nombre: 'Feria de las Flores', lugar: 'Medellín, Antioquia', estado: 'proxima' },
  { nombre: 'Copa Manizales', lugar: 'Manizales, Caldas', estado: 'proxima' },
  { nombre: 'Exposición Equina Grado A', lugar: 'Cali, Valle del Cauca', estado: 'proxima' },
];

async function main() {
  console.log('🌱 Iniciando seed optimizado...');

  await prisma.apuesta.deleteMany();
  await prisma.poolApuestas.deleteMany();
  await prisma.participacion.deleteMany();
  await prisma.competencia.deleteMany();
  await prisma.competitionCategory.deleteMany();
  await prisma.competitionModality.deleteMany();
  await prisma.competitionSex.deleteMany();
  await prisma.competitionAgeRange.deleteMany();
  await prisma.feria.deleteMany();
  await prisma.caballo.deleteMany();
  await prisma.usuario.deleteMany();

  const password = await bcrypt.hash('admin123', 12);
  await prisma.usuario.createMany({
    data: [
      { email: 'admin@pasobet.com', password, nombre: 'Admin PasoBet', role: 'ADMIN', saldo: 1000000 },
      { email: 'user@pasobet.com', password, nombre: 'Carlos Rodríguez', role: 'USER', saldo: 250000 },
    ],
  });

  const mods = await Promise.all(MODALIDADES.map(m => prisma.competitionModality.create({ data: m })));
  const sexes = await Promise.all(SEXOS.map(s => prisma.competitionSex.create({ data: { nombre: s } })));
  const ages = await Promise.all(RANGOS_EDAD.map(a => prisma.competitionAgeRange.create({
    data: { nombre: a.label, edadMin: a.edadMin, edadMax: a.edadMax }
  })));

  const catsData = [];
  for (const m of mods) {
    for (const s of sexes) {
      for (const a of ages) {
        catsData.push({
          modalidadId: m.id,
          sexoId: s.id,
          rangoEdadId: a.id,
          nombre: `${m.nombre} ${s.nombre} ${a.nombre}`,
          slug: `${m.slug}-${s.nombre.toLowerCase()}-${a.nombre.toLowerCase().replace(' ', '-')}`,
        });
      }
    }
  }
  await prisma.competitionCategory.createMany({ data: catsData });
  const allCats = await prisma.competitionCategory.findMany();

  const horsesData = [];
  for (let i = 1; i <= 40; i++) {
    horsesData.push({
      nombre: `Ejemplar ${i}`,
      criadero: i % 2 === 0 ? 'Criadero El Roble' : 'Rancho Alegre',
      sexo: i % 2 === 0 ? 'Machos' : 'Hembras',
      edadMeses: 36 + (i * 2),
      cuotaBase: 1.5 + (Math.random() * 3),
    });
  }
  await prisma.caballo.createMany({ data: horsesData });
  const allHorses = await prisma.caballo.findMany();

  for (const fData of FERIAS) {
    const f = await prisma.feria.create({
      data: {
        nombre: fData.nombre,
        lugar: fData.lugar,
        estado: fData.estado,
        fechaInicio: new Date(),
        fechaFin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      }
    });

    const compsToCreate = allCats.map(cat => ({
      feriaId: f.id,
      categoriaId: cat.id,
      estado: fData.estado === 'activa' ? 'abierta' : 'inactiva',
    }));
    await prisma.competencia.createMany({ data: compsToCreate });
    
    if (fData.estado === 'activa') {
      const createdComps = await prisma.competencia.findMany({ where: { feriaId: f.id } });
      
      const partsData = [];
      const poolsData = [];
      
      for (const comp of createdComps) {
        const cat = allCats.find(c => c.id === comp.categoriaId);
        const horseSex = cat?.nombre.includes('Machos') ? 'Machos' : 'Hembras';
        const matchingHorses = allHorses.filter(h => h.sexo === horseSex).slice(0, 4);
        
        for (const h of matchingHorses) {
          partsData.push({ competenciaId: comp.id, caballoId: h.id });
          poolsData.push({ competenciaId: comp.id, caballoId: h.id, totalApostado: 0 });
        }
      }
      
      await prisma.participacion.createMany({ data: partsData });
      await prisma.poolApuestas.createMany({ data: poolsData });
    }

  }

  console.log('✅ Seed optimizado completado!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
