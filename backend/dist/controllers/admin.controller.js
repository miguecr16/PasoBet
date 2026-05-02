"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settleEvent = exports.assignHorse = exports.listHorses = exports.createHorse = exports.updateEventStatus = exports.createEvent = void 0;
const prisma_1 = require("../lib/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
// --- Events / Ferias ---
const createEvent = async (req, res, next) => {
    try {
        const { name, location, startDate, endDate } = req.body;
        const feria = await prisma_1.prisma.feria.create({
            data: {
                nombre: name,
                lugar: location || 'Por definir',
                fechaInicio: startDate ? new Date(startDate) : new Date(),
                fechaFin: endDate ? new Date(endDate) : new Date(),
                estado: 'activa'
            }
        });
        res.status(201).json({ success: true, data: feria });
    }
    catch (error) {
        next(error);
    }
};
exports.createEvent = createEvent;
const updateEventStatus = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const competencia = await prisma_1.prisma.competencia.update({
            where: { id },
            data: { estado: status }
        });
        res.status(200).json({ success: true, data: competencia });
    }
    catch (error) {
        next(error);
    }
};
exports.updateEventStatus = updateEventStatus;
// --- Horses ---
const createHorse = async (req, res, next) => {
    try {
        const { name, breed, odds } = req.body;
        const caballo = await prisma_1.prisma.caballo.create({
            data: {
                nombre: name,
                criadero: breed,
                cuotaBase: odds || 2.0,
                cuotaActual: odds || 2.0
            }
        });
        res.status(201).json({ success: true, data: caballo });
    }
    catch (error) {
        next(error);
    }
};
exports.createHorse = createHorse;
const listHorses = async (req, res, next) => {
    try {
        const caballos = await prisma_1.prisma.caballo.findMany({ orderBy: { nombre: 'asc' } });
        res.status(200).json({ success: true, data: caballos });
    }
    catch (error) {
        next(error);
    }
};
exports.listHorses = listHorses;
const assignHorse = async (req, res, next) => {
    try {
        const { eventId, horseId } = req.body; // eventId aquí es competenciaId
        const participacion = await prisma_1.prisma.participacion.create({
            data: {
                competenciaId: eventId,
                caballoId: horseId
            }
        });
        res.status(201).json({ success: true, data: participacion });
    }
    catch (error) {
        next(error);
    }
};
exports.assignHorse = assignHorse;
// --- Settlement ---
const settleEvent = async (req, res, next) => {
    try {
        const { eventId, winnerHorseId } = req.body; // eventId aquí es competenciaId
        const competencia = await prisma_1.prisma.competencia.findUnique({ where: { id: eventId } });
        if (!competencia || competencia.estado === 'cerrada') {
            return next(new error_middleware_1.AppError('Competencia inválida o ya cerrada', 400));
        }
        const participacion = await prisma_1.prisma.participacion.findFirst({
            where: { competenciaId: eventId, caballoId: winnerHorseId }
        });
        if (!participacion)
            return next(new error_middleware_1.AppError('El caballo ganador no pertenece a la competencia', 400));
        await prisma_1.prisma.$transaction(async (tx) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.settleEvent = settleEvent;
