"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyBets = exports.placeBet = void 0;
const prisma_1 = require("../lib/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
const placeBet = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return next(new error_middleware_1.AppError('No auth token', 401));
        const { eventId, horseId, amount } = req.body; // eventId aquí es competenciaId
        if (!eventId || !horseId || !amount) {
            return next(new error_middleware_1.AppError('Faltan campos requeridos para la apuesta', 400));
        }
        if (amount < 1000 || amount > 2000000) {
            return next(new error_middleware_1.AppError('El monto debe estar entre $1,000 y $2,000,000 COP', 400));
        }
        const competencia = await prisma_1.prisma.competencia.findUnique({ where: { id: eventId } });
        if (!competencia || competencia.estado !== 'abierta') {
            return next(new error_middleware_1.AppError('La competencia no está disponible para apuestas', 400));
        }
        const caballo = await prisma_1.prisma.caballo.findUnique({
            where: { id: horseId }
        });
        // Verificar participación
        const participacion = await prisma_1.prisma.participacion.findFirst({
            where: { caballoId: horseId, competenciaId: eventId }
        });
        if (!participacion)
            return next(new error_middleware_1.AppError('El caballo no participa en esta competencia', 400));
        // Transaction
        const result = await prisma_1.prisma.$transaction(async (tx) => {
            const usuario = await tx.usuario.findUnique({ where: { id: userId } });
            if (!usuario || Number(usuario.saldo) < amount) {
                throw new error_middleware_1.AppError('Saldo insuficiente', 400);
            }
            // Decrement balance
            await tx.usuario.update({
                where: { id: usuario.id },
                data: { saldo: { decrement: amount } }
            });
            const cuota = caballo.cuotaActual || caballo.cuotaBase;
            const posiblePago = amount * cuota;
            const apuesta = await tx.apuesta.create({
                data: {
                    usuarioId: usuario.id,
                    competenciaId: eventId,
                    caballoId: horseId,
                    monto: amount,
                    cuotaTomada: cuota,
                    posiblePago
                },
                include: {
                    caballo: true,
                    competencia: {
                        include: { categoria: true }
                    }
                }
            });
            // Actualizar PoolApuestas
            await tx.poolApuestas.upsert({
                where: {
                    competenciaId_caballoId: {
                        competenciaId: eventId,
                        caballoId: horseId
                    }
                },
                update: { totalApostado: { increment: amount } },
                create: { competenciaId: eventId, caballoId: horseId, totalApostado: amount }
            });
            return { bet: apuesta, newBalance: Number(usuario.saldo) - amount };
        });
        // ─── PARIMUTUEL ODDS CALCULATION ASYNC ───
        calculateOddsAsync(eventId).catch(err => console.error('Error calculando cuotas asíncronas:', err));
        res.status(201).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.placeBet = placeBet;
async function calculateOddsAsync(competenciaId) {
    try {
        const allPools = await prisma_1.prisma.poolApuestas.findMany({
            where: { competenciaId }
        });
        const totalPool = allPools.reduce((sum, p) => sum + p.totalApostado, 0);
        const houseEdge = 0.15;
        const netPool = totalPool * (1 - houseEdge);
        const participaciones = await prisma_1.prisma.participacion.findMany({
            where: { competenciaId },
            include: { caballo: true }
        });
        const updates = participaciones.map(p => {
            const cab = p.caballo;
            const horsePool = allPools.find(pl => pl.caballoId === cab.id)?.totalApostado || 0;
            let newOdds = cab.cuotaBase;
            if (horsePool > 0) {
                const calculatedOdds = netPool / horsePool;
                newOdds = calculatedOdds < 1.01 ? 1.01 : calculatedOdds;
            }
            return prisma_1.prisma.caballo.update({
                where: { id: cab.id },
                data: { cuotaActual: parseFloat(newOdds.toFixed(2)) }
            });
        });
        if (updates.length > 0) {
            await prisma_1.prisma.$transaction(updates);
        }
    }
    catch (err) {
        console.error('Fallo en el worker de cálculo de cuotas:', err);
    }
}
const getMyBets = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return next(new error_middleware_1.AppError('No auth token', 401));
        const { status, page = '1', limit = '10' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const where = { usuarioId: userId };
        if (status)
            where.estado = status;
        const apuestas = await prisma_1.prisma.apuesta.findMany({
            where,
            skip: (pageNum - 1) * limitNum,
            take: limitNum,
            orderBy: { creadoEn: 'desc' },
            include: {
                caballo: true,
                competencia: {
                    include: { categoria: true }
                }
            }
        });
        const total = await prisma_1.prisma.apuesta.count({ where });
        const bets = apuestas.map(ap => ({
            id: ap.id,
            amount: ap.monto,
            odds: ap.cuotaTomada,
            potentialPayout: ap.posiblePago,
            status: ap.estado,
            createdAt: ap.creadoEn,
            horse: { name: ap.caballo.nombre },
            event: { name: ap.competencia.categoria.nombre }
        }));
        res.status(200).json({
            success: true,
            data: bets,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyBets = getMyBets;
