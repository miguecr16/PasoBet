import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos profesional...');

  // Limpiar datos existentes en el orden correcto
  await prisma.apuesta.deleteMany();
  await prisma.participacion.deleteMany();
  await prisma.caballo.deleteMany();
  await prisma.categoriaEvento.deleteMany();
  await prisma.feria.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('🗑️  Base de datos limpiada');

  // 1. Crear Usuarios
  const adminPassword = await bcrypt.hash('admin123', 12);
  const demoPassword = await bcrypt.hash('demo123', 12);

  const admin = await prisma.usuario.create({
    data: {
      email: 'admin@pasobet.com',
      password: adminPassword,
      nombre: 'Administrador PasoBet',
      role: 'ADMIN',
      saldo: 500000,
    },
  });

  const demo = await prisma.usuario.create({
    data: {
      email: 'demo@pasobet.com',
      password: demoPassword,
      nombre: 'Carlos Rodríguez',
      role: 'USER',
      saldo: 100000,
    },
  });

  console.log('👤 Usuarios creados');

  // 2. Crear Caballos
  const caballosData = [
    { nombre: 'Relámpago Dorado', criadero: 'Hacienda El Roble' },
    { nombre: 'Cielo Plateado', criadero: 'Finca Las Palmas' },
    { nombre: 'Tornado del Sur', criadero: 'Rancho Viento Libre' },
    { nombre: 'Espíritu Libre', criadero: 'Hacienda Santa Clara' },
    { nombre: 'Don Supremo', criadero: 'Establo El Campeón' },
    { nombre: 'Luna Plateada', criadero: 'Hacienda La Luna' },
    { nombre: 'Fuego Vivo', criadero: 'Finca Fuego' },
    { nombre: 'Rey de Copas', criadero: 'Establo Real' },
  ];

  const caballos = await Promise.all(
    caballosData.map((c) => prisma.caballo.create({ data: c }))
  );

  console.log(`🐴 ${caballos.length} caballos creados`);

  // 3. Crear Categorías base
  const categoriasData = [
    { nombre: 'Paso Fino Colombiano (P4)' },
    { nombre: 'Trocha y Galope (P2)' },
    { nombre: 'Trocha Pura (P3)' },
    { nombre: 'Trote y Galope (P1)' },
  ];

  // 4. Crear Feria
  const feria = await prisma.feria.create({
    data: {
      nombre: 'Exposición Equina Grado A - Medellín 2026',
      lugar: 'Plaza Mayor, Medellín',
      fechaInicio: new Date('2026-08-15'),
      fechaFin: new Date('2026-08-18'),
      estado: 'activa',
      categorias: {
        create: categoriasData.map(cat => ({
          nombre: cat.nombre,
          estado: 'abierta'
        }))
      }
    },
    include: {
      categorias: true
    }
  });

  // --- 5. Participaciones (Asignar caballos a categorías) ---
  console.log('🔗 Asignando caballos a categorías...');
  
  for (const cat of feria.categorias) {
    // Tomamos 4 caballos al azar para cada categoría
    const randomHorses = await prisma.caballo.findMany({
      take: 4,
      skip: 0
    });

    for (const horse of randomHorses) {
      await prisma.participacion.create({
        data: {
          categoriaId: cat.id,
          caballoId: horse.id
        }
      });

      // Crear Pool inicial para cada caballo
      await prisma.poolApuestas.create({
        data: {
          categoriaId: cat.id,
          caballoId: horse.id,
          totalApostado: 0
        }
      });
    }
    console.log(`✅ Categoría ${cat.nombre} creada con ${randomHorses.length} participaciones`);
  }



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

