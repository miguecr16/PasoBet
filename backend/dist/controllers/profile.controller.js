"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
const getProfile = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return next(new error_middleware_1.AppError('No auth token', 401));
        const usuario = await prisma_1.prisma.usuario.findUnique({
            where: { id: userId },
            select: {
                id: true, email: true, nombre: true, creadoEn: true,
                _count: { select: { apuestas: true } }
            }
        });
        if (!usuario)
            return next(new error_middleware_1.AppError('User not found', 404));
        // Advanced Stats Calculation
        const apuestas = await prisma_1.prisma.apuesta.groupBy({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return next(new error_middleware_1.AppError('No auth token', 401));
        const { nombre } = req.body;
        const updatedUser = await prisma_1.prisma.usuario.update({
            where: { id: userId },
            data: { nombre },
            select: { id: true, email: true, nombre: true }
        });
        res.status(200).json({ success: true, data: updatedUser });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        const { currentPassword, newPassword } = req.body;
        if (!userId)
            return next(new error_middleware_1.AppError('No auth token', 401));
        if (!currentPassword || !newPassword) {
            return next(new error_middleware_1.AppError('Please provide current and new password', 400));
        }
        const usuario = await prisma_1.prisma.usuario.findUnique({ where: { id: userId } });
        if (!usuario || !(await bcryptjs_1.default.compare(currentPassword, usuario.password))) {
            return next(new error_middleware_1.AppError('Incorrect current password', 401));
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 12);
        await prisma_1.prisma.usuario.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        res.status(200).json({ success: true, message: 'Password changed successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
