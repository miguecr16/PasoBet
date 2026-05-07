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
            categoria: true,
            participaciones: {
              include: { caballo: true }
            },
            _count: { select: { apuestas: true } }
          }
        }
      }
    });

    // Mapear a la estructura de Ferias con categorías anidadas
    const result = ferias.map((f: any) => ({
      id: f.id,
      name: f.nombre,
      location: f.lugar,
      startDate: f.fechaInicio,
      endDate: f.fechaFin,
      status: f.estado,
      categories: f.competencias.map((comp: any) => ({
        id: comp.id,
        name: comp.categoria.nombre,
        modalidad: comp.categoria.modalidad,
        sexo: comp.categoria.sexo,
        edadMin: comp.categoria.edadMin,
        edadMax: comp.categoria.edadMax,
        slug: comp.categoria.slug,
        status: comp.estado,
        horseCount: comp.participaciones.length,
        betCount: comp._count.apuestas,
        horses: comp.participaciones.slice(0, 3).map((p: any) => ({
          id: p.caballo.id,
          name: p.caballo.nombre
        }))
      }))
    }));

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
        categoria: true,
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
      modalidad: competencia.categoria.modalidad,
      sexo: competencia.categoria.sexo,
      edadMin: competencia.categoria.edadMin,
      edadMax: competencia.categoria.edadMax,
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

