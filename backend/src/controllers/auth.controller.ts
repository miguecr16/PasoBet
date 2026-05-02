import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { generateToken } from '../lib/jwt';
import { AppError } from '../middleware/error.middleware';

/**
 * Convierte un registro de Usuario de la BD al formato que espera el frontend.
 * El frontend usa { firstName, lastName, id (string) } pero la BD guarda { nombre, id (string) }.
 */
function toFrontendUser(usuario: {
  id: string;
  nombre: string | null;
  email: string;
  role: string;
  saldo: any; // Decimal type from prisma
  creadoEn: Date;
}) {
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

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, nombre: nombreDirecto } = req.body;

    const nombre = nombreDirecto ?? `${firstName ?? ''} ${lastName ?? ''}`.trim();

    if (!email || !password || !nombre) {
      return next(new AppError('Por favor proporciona email, password y nombre', 400));
    }

    const existingUser = await prisma.usuario.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('El correo electrónico ya está registrado', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const usuario = await prisma.usuario.create({
      data: { email, password: hashedPassword, nombre, saldo: 0 }
    });

    const token = generateToken({ userId: usuario.id, email: usuario.email, role: usuario.role });

    res.status(201).json({
      success: true,
      data: { token, user: toFrontendUser(usuario) }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Por favor proporciona email y contraseña', 400));
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return next(new AppError('El usuario no existe', 404));
    }

    if (!(await bcrypt.compare(password, usuario.password))) {
      return next(new AppError('La contraseña es incorrecta', 401));
    }

    const token = generateToken({ userId: usuario.id, email: usuario.email, role: usuario.role });

    res.status(200).json({
      success: true,
      data: { token, user: toFrontendUser(usuario) }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return next(new AppError('No auth token', 401));

    const usuario = await prisma.usuario.findUnique({ where: { id: userId } });

    if (!usuario) return next(new AppError('User not found', 404));

    res.status(200).json({
      success: true,
      data: { user: toFrontendUser(usuario) }
    });
  } catch (error) {
    next(error);
  }
};
