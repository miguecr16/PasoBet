import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MODALIDADES = [
  { id: 'PASO_FINO', nombre: 'Paso Fino' },
  { id: 'TROCHA', nombre: 'Trocha' },
  { id: 'TROCHA_GALOPE', nombre: 'Trocha y Galope' },
  { id: 'TROTE_GALOPE', nombre: 'Trote y Galope' },
  { id: 'ASNALES_MULARES', nombre: 'Asnales y Mulares' }
];

const SEXOS = [
  { id: 'MACHO', nombre: 'Machos' },
  { id: 'HEMBRA', nombre: 'Hembras' }
];

const EDADES = [
  { min: 36, max: 48, label: '36-48' },
  { min: 48, max: 60, label: '48-60' },
  { min: 60, max: 78, label: '60-78' },
  { min: 78, max: 100, label: '78-100' },
  { min: 100, max: null, label: 'Mayor 100' }
];

async function main() {
  console.log('🚀 Iniciando seed de categorías maestras...');

  // Limpiar categorías existentes (por seguridad ya que hicimos reset, pero por si acaso)
  await prisma.competitionCategory.deleteMany();

  for (const mod of MODALIDADES) {
    for (const sexo of SEXOS) {
      for (const edad of EDADES) {
        const nombre = `${mod.nombre} ${sexo.nombre} ${edad.label}`;
        const slug = `${mod.id.toLowerCase()}-${sexo.id.toLowerCase()}-${edad.label.toLowerCase().replace(' ', '-')}`;

        await prisma.competitionCategory.create({
          data: {
            modalidad: mod.id,
            sexo: sexo.id,
            edadMin: edad.min,
            edadMax: edad.max,
            nombre,
            slug,
            activa: true
          }
        });
        console.log(`✅ Creada: ${nombre}`);
      }
    }
  }

  console.log('✨ Seed de categorías completado con éxito.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
