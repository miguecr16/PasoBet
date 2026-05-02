"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdraw = exports.deposit = exports.getWallet = void 0;
const prisma_1 = require("../lib/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
const getWallet = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return next(new error_middleware_1.AppError('No auth token', 401));
        const usuario = await prisma_1.prisma.usuario.findUnique({
            where: { id: userId }
        });
        if (!usuario) {
            return next(new error_middleware_1.AppError('Wallet/User not found', 404));
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
    }
    catch (error) {
        next(error);
    }
};
exports.getWallet = getWallet;
const deposit = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const { amount } = req.body;
        if (!userId)
            return next(new error_middleware_1.AppError('No auth token', 401));
        if (!amount || amount < 10000 || amount > 10000000) {
            return next(new error_middleware_1.AppError('Monto de depósito debe estar entre $10,000 y $10,000,000 COP', 400));
        }
        const usuario = await prisma_1.prisma.usuario.findUnique({ where: { id: userId } });
        if (!usuario)
            return next(new error_middleware_1.AppError('User not found', 404));
        const updatedUser = await prisma_1.prisma.usuario.update({
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
    }
    catch (error) {
        next(error);
    }
};
exports.deposit = deposit;
const withdraw = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const { amount } = req.body;
        if (!userId)
            return next(new error_middleware_1.AppError('No auth token', 401));
        if (!amount || amount <= 0) {
            return next(new error_middleware_1.AppError('Monto inválido', 400));
        }
        const usuario = await prisma_1.prisma.usuario.findUnique({ where: { id: userId } });
        if (!usuario)
            return next(new error_middleware_1.AppError('User not found', 404));
        if (usuario.saldo < amount) {
            return next(new error_middleware_1.AppError('Saldo insuficiente', 400));
        }
        const updatedUser = await prisma_1.prisma.usuario.update({
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
    }
    catch (error) {
        next(error);
    }
};
exports.withdraw = withdraw;
