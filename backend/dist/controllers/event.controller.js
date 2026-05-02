"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventById = exports.getEvents = void 0;
const prisma_1 = require("../lib/prisma");
const error_middleware_1 = require("../middleware/error.middleware");
const getEvents = async (req, res, next) => {
    try {
        const { status } = req.query;
        const whereFeria = {};
        if (status)
            whereFeria.estado = status;
        const ferias = await prisma_1.prisma.feria.findMany({
            where: whereFeria,
            orderBy: { creadoEn: 'desc' },
            include: {
                competencias: {
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
        const result = ferias.map((f) => ({
            id: f.id,
            name: f.nombre,
            location: f.lugar,
            startDate: f.fechaInicio,
            endDate: f.fechaFin,
            status: f.estado,
            categories: f.competencias.map((comp) => ({
                id: comp.id, // IMPORTANTE: El ID aquí es el de la Competencia (Feria+Categoria)
                name: comp.categoria.nombre,
                status: comp.estado,
                horseCount: comp.participaciones.length,
                betCount: comp._count.apuestas,
                horses: comp.participaciones.slice(0, 3).map((p) => ({
                    id: p.caballo.id,
                    name: p.caballo.nombre
                }))
            }))
        }));
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getEvents = getEvents;
const getEventById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const competencia = await prisma_1.prisma.competencia.findUnique({
            where: { id },
            include: {
                categoria: true,
                participaciones: {
                    include: {
                        caballo: true
                    }
                }
            }
        });
        if (!competencia) {
            return next(new error_middleware_1.AppError('Competencia no encontrada', 404));
        }
        const pools = await prisma_1.prisma.poolApuestas.findMany({
            where: { competenciaId: id }
        });
        const totalPool = pools.reduce((sum, p) => sum + p.totalApostado, 0);
        const event = {
            id: competencia.id,
            name: competencia.categoria.nombre,
            status: competencia.estado,
            totalPool,
            horses: competencia.participaciones.map((p) => {
                const cab = p.caballo;
                const horsePool = pools.find(pl => pl.caballoId === cab.id)?.totalApostado || 0;
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
    }
    catch (error) {
        next(error);
    }
};
exports.getEventById = getEventById;
