"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = require("../lib/prisma");
const jwt_1 = require("../lib/jwt");
const error_middleware_1 = require("../middleware/error.middleware");
/**
 * Convierte un registro de Usuario de la BD al formato que espera el frontend.
 * El frontend usa { firstName, lastName, id (string) } pero la BD guarda { nombre, id (string) }.
 */
function toFrontendUser(usuario) {
    const partes = (usuario.nombre ?? '').split(' ');
    const firstName = partes[0] ?? '';
    const lastName = partes.slice(1).join(' ') || '';
    return {
        id: usuario.id,
        email: usuario.email,
        firstName,
        lastName,
        role: usuario.role,
        saldo: Number(usuario.saldo),
        nombre: usuario.nombre,
    };
}
const register = async (req, res, next) => {
    try {
        const { email, password, firstName, lastName, nombre: nombreDirecto } = req.body;
        const nombre = nombreDirecto ?? `${firstName ?? ''} ${lastName ?? ''}`.trim();
        if (!email || !password || !nombre) {
            return next(new error_middleware_1.AppError('Por favor proporciona email, password y nombre', 400));
        }
        const existingUser = await prisma_1.prisma.usuario.findUnique({ where: { email } });
        if (existingUser) {
            return next(new error_middleware_1.AppError('El correo electrónico ya está registrado', 409));
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const usuario = await prisma_1.prisma.usuario.create({
            data: { email, password: hashedPassword, nombre, saldo: 0 }
        });
        const token = (0, jwt_1.generateToken)({ userId: usuario.id, email: usuario.email, role: usuario.role });
        res.status(201).json({
            success: true,
            data: { token, user: toFrontendUser(usuario) }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new error_middleware_1.AppError('Por favor proporciona email y contraseña', 400));
        }
        const usuario = await prisma_1.prisma.usuario.findUnique({ where: { email } });
        if (!usuario) {
            return next(new error_middleware_1.AppError('El usuario no existe', 404));
        }
        if (!(await bcryptjs_1.default.compare(password, usuario.password))) {
            return next(new error_middleware_1.AppError('La contraseña es incorrecta', 401));
        }
        const token = (0, jwt_1.generateToken)({ userId: usuario.id, email: usuario.email, role: usuario.role });
        res.status(200).json({
            success: true,
            data: { token, user: toFrontendUser(usuario) }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const getMe = async (req, res, next) => {
    try {
        const userId = req.user?.userId;
        if (!userId)
            return next(new error_middleware_1.AppError('No auth token', 401));
        const usuario = await prisma_1.prisma.usuario.findUnique({ where: { id: userId } });
        if (!usuario)
            return next(new error_middleware_1.AppError('User not found', 404));
        res.status(200).json({
            success: true,
            data: { user: toFrontendUser(usuario) }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMe = getMe;
