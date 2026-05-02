import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error.middleware';

export const getWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next(new AppError('No auth token', 401));

    const usuario = await prisma.usuario.findUnique({
      where: { id: userId }
    });

    if (!usuario) {
      return next(new AppError('Wallet/User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: {
        id: usuario.id,
        userId: usuario.id,
        balance: usuario.saldo,
        transactions: [] // Transacciones eliminadas en el nuevo esquema
      }
    });
  } catch (error) {
    next(error);
  }
};

export const deposit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { amount } = req.body;
    if (!userId) return next(new AppError('No auth token', 401));

    if (!amount || amount < 10000 || amount > 10000000) {
      return next(new AppError('Monto de depósito debe estar entre $10,000 y $10,000,000 COP', 400));
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario) return next(new AppError('User not found', 404));

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: { saldo: { increment: amount } }
    });

    res.status(200).json({
      success: true,
      data: {
        wallet: { id: updatedUser.id, balance: updatedUser.saldo, userId: updatedUser.id },
        transaction: {
          id: `DEP-${Date.now()}`,
          amount,
          type: 'DEPOSIT',
          status: 'COMPLETED',
          description: 'Depósito simulado'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const withdraw = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    const { amount } = req.body;
    if (!userId) return next(new AppError('No auth token', 401));

    if (!amount || amount <= 0) {
      return next(new AppError('Monto inválido', 400));
    }

    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });
    if (!usuario) return next(new AppError('User not found', 404));

    if (usuario.saldo < amount) {
      return next(new AppError('Saldo insuficiente', 400));
    }

    const updatedUser = await prisma.usuario.update({
      where: { id: userId },
      data: { saldo: { decrement: amount } }
    });

    res.status(200).json({
      success: true,
      data: {
        wallet: { id: updatedUser.id, balance: updatedUser.saldo, userId: updatedUser.id },
        transaction: {
          id: `WIT-${Date.now()}`,
          amount,
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
          description: 'Retiro simulado'
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
