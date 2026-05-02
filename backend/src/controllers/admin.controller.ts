import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

// --- Events / Ferias ---

export const createEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, location, startDate, endDate } = req.body;

    const feria = await prisma.feria.create({
      data: {
        nombre: name,
        lugar: location || 'Por definir',
        fechaInicio: startDate ? new Date(startDate) : new Date(),
        fechaFin: endDate ? new Date(endDate) : new Date(),
        estado: 'activa'
      }
    });

    res.status(201).json({ success: true, data: feria });
  } catch (error) {
    next(error);
  }
};

export const updateEventStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const competencia = await prisma.competencia.update({
      where: { id },
      data: { estado: status }
    });

    res.status(200).json({ success: true, data: competencia });
  } catch (error) {
    next(error);
  }
};

// --- Horses ---

export const createHorse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, breed, odds } = req.body;

    const caballo = await prisma.caballo.create({
      data: {
        nombre: name,
        criadero: breed,
        cuotaBase: odds || 2.0,
        cuotaActual: odds || 2.0
      }
    });

    res.status(201).json({ success: true, data: caballo });
  } catch (error) {
    next(error);
  }
};

export const listHorses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const caballos = await prisma.caballo.findMany({ orderBy: { nombre: 'asc' } });
    res.status(200).json({ success: true, data: caballos });
  } catch (error) {
    next(error);
  }
};

export const assignHorse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, horseId } = req.body; // eventId aquí es competenciaId

    const participacion = await prisma.participacion.create({
      data: {
        competenciaId: eventId,
        caballoId: horseId
      }
    });

    res.status(201).json({ success: true, data: participacion });
  } catch (error) {
    next(error);
  }
};

// --- Settlement ---

export const settleEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { eventId, winnerHorseId } = req.body; // eventId aquí es competenciaId

    const competencia = await prisma.competencia.findUnique({ where: { id: eventId } });
    if (!competencia || competencia.estado === 'cerrada') {
      return next(new AppError('Competencia inválida o ya cerrada', 400));
    }

    const participacion = await prisma.participacion.findFirst({
      where: { competenciaId: eventId, caballoId: winnerHorseId }
    });
    if (!participacion) return next(new AppError('El caballo ganador no pertenece a la competencia', 400));

    await prisma.$transaction(async (tx: any) => {
      // Settle winning bets
      const winningBets = await tx.apuesta.findMany({
        where: { competenciaId: eventId, estado: 'pendiente', caballoId: winnerHorseId }
      });

      for (const bet of winningBets) {
        const payout = Number(bet.posiblePago) || Number(bet.monto) * bet.cuotaTomada;
        await tx.apuesta.update({
          where: { id: bet.id },
          data: { estado: 'ganada', posiblePago: payout }
        });

        await tx.usuario.update({
          where: { id: bet.usuarioId },
          data: { saldo: { increment: payout } }
        });
      }

      // Mark losing bets
      await tx.apuesta.updateMany({
        where: { competenciaId: eventId, estado: 'pendiente' },
        data: { estado: 'perdida' }
      });

      // Update competition status
      await tx.competencia.update({
        where: { id: eventId },
        data: { estado: 'cerrada' }
      });
    });

    res.status(200).json({ success: true, message: 'Competencia liquidada exitosamente' });
  } catch (error) {
    next(error);
  }
};

