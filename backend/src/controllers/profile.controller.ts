import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next(new AppError('No auth token', 401));

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, nombre: true, creadoEn: true,
        _count: { select: { apuestas: true } }
      }
    });

    if (!usuario) return next(new AppError('User not found', 404));

    // Advanced Stats Calculation
    const apuestas = await prisma.apuesta.groupBy({
      by: ['estado'],
      where: { usuarioId: userId },
      _count: { id: true },
      _sum: { monto: true, posiblePago: true }
    });

    let totalBets = 0;
    let wonBets = 0;
    let totalWagered = 0;
    let totalWon = 0; 

    apuestas.forEach(group => {
      totalBets += group._count.id;
      totalWagered += Number(group._sum.monto || 0);
      if (group.estado === 'ganada') { 
        wonBets += group._count.id;
        totalWon += Number(group._sum.posiblePago || 0); 
      }
    });

    const winRate = totalBets > 0 ? (wonBets / totalBets) * 100 : 0;
    const roi = totalWagered > 0 ? ((totalWon - totalWagered) / totalWagered) * 100 : 0;

    const stats = {
      raw: apuestas,
      metrics: {
        totalBets,
        wonBets,
        totalWagered,
        totalWon,
        winRate: parseFloat(winRate.toFixed(1)),
        roi: parseFloat(roi.toFixed(1))
      }
    };

    res.status(200).json({ success: true, data: { user: usuario, stats } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next(new AppError('No auth token', 401));
    const { nombre } = req.body;

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: { nombre },
      select: { id: true, email: true, nombre: true }
    });

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;
    if (!userId) return next(new AppError('No auth token', 401));

    if (!currentPassword || !newPassword) {
      return next(new AppError('Please provide current and new password', 400));
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario || !(await bcrypt.compare(currentPassword, usuario.password))) {
      return next(new AppError('Incorrect current password', 401));
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.usuario.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};
