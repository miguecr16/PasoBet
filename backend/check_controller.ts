import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const ferias = await prisma.feria.findMany({
    orderBy: { creadoEn: 'desc' },
    include: {
      competencias: {
        where: { estado: { not: 'inactiva' } },
        include: {
          categoria: {
            include: {
              modalidad: true,
              sexo: true,
              rangoEdad: true,
            }
          },
          _count: { select: { apuestas: true, participaciones: true } }
        }
      }
    }
  });

  const result = ferias.map((f: any) => {
    const modalidadesMap = new Map();

    f.competencias.forEach((comp: any) => {
      const cat = comp.categoria;
      const mod = cat.modalidad;
      const sexo = cat.sexo;
      const age = cat.rangoEdad;

      if (!modalidadesMap.has(mod.id)) {
        modalidadesMap.set(mod.id, {
          id: mod.id,
          nombre: mod.nombre,
          slug: mod.slug,
          sexos: new Map()
        });
      }

      const modObj = modalidadesMap.get(mod.id);
      if (!modObj.sexos.has(sexo.id)) {
        modObj.sexos.set(sexo.id, {
          id: sexo.id,
          nombre: sexo.nombre,
          competencias: []
        });
      }

      modObj.sexos.get(sexo.id).competencias.push({
        id: comp.id,
        categoriaId: cat.id,
        nombre: cat.nombre,
        slug: cat.slug,
        status: comp.estado,
        ageRange: {
          id: age.id,
          nombre: age.nombre,
          min: age.edadMin,
          max: age.edadMax
        },
        horseCount: comp._count.participaciones,
        betCount: comp._count.apuestas
      });
    });

    const modalidades = Array.from(modalidadesMap.values()).map(mod => ({
      ...mod,
      sexos: Array.from(mod.sexos.values()).map((s: any) => ({
        ...s,
        competencias: s.competencias.sort((a: any, b: any) => a.ageRange.min - b.ageRange.min)
      }))
    }));

    return {
      id: f.id,
      name: f.nombre,
      location: f.lugar,
      startDate: f.fechaInicio,
      endDate: f.fechaFin,
      status: f.estado,
      modalidades
    };
  });

  console.log(JSON.stringify(result, null, 2));
}

main().finally(() => prisma.$disconnect());
