import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

export const getEvents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;

    const whereFeria: any = {};
    if (status) whereFeria.estado = status;

    const ferias = await prisma.feria.findMany({
      where: whereFeria,
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

    // Mapear a estructura jerárquica real: Feria -> Modalidades -> Sexos -> Rangos/Competencias
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

      // Convertir Maps a Arrays para JSON
      const modalidades = Array.from(modalidadesMap.values()).map(mod => ({
        ...mod,
        sexos: Array.from(mod.sexos.values()).map((s: any) => ({
          ...s,
          // Ordenar competencias por edad
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

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;

    const competencia = await prisma.competencia.findUnique({
      where: { id },
      include: {
        categoria: {
          include: {
            modalidad: true,
            sexo: true,
            rangoEdad: true
          }
        },
        participaciones: {
          include: {
            caballo: true
          }
        }
      }
    }) as any;

    if (!competencia) {
      return next(new AppError('Competencia no encontrada', 404));
    }

    const pools = await prisma.poolApuestas.findMany({
      where: { competenciaId: id }
    });

    const totalPool = pools.reduce((sum: number, p: any) => sum + p.totalApostado, 0);

    const event = {
      id: competencia.id,
      name: competencia.categoria.nombre,
      modalidad: competencia.categoria.modalidad.nombre,
      sexo: competencia.categoria.sexo.nombre,
      edadRange: competencia.categoria.rangoEdad.nombre,
      slug: competencia.categoria.slug,
      status: competencia.estado,
      totalPool,
      horses: competencia.participaciones.map((p: any) => {
        const cab = p.caballo;
        const horsePool = pools.find((pl: any) => pl.caballoId === cab.id)?.totalApostado || 0;
        const poolPercentage = totalPool > 0 ? (horsePool / totalPool) * 100 : 0;
        
        return {
          horseId: cab.id,
          odds: cab.cuotaActual || cab.cuotaBase,
          poolPercentage: parseFloat(poolPercentage.toFixed(2)), 
          horse: {
            id: cab.id,
            name: cab.nombre,
            breed: cab.criadero,
            stats: {
              carrerasJugadas: cab.carrerasJugadas,
              victorias: cab.victorias,
              segundos: cab.segundos,
              terceros: cab.terceros
            }
          }
        };
      })
    };

    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
};

