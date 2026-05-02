import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../lib/jwt';
import { AppError } from './error.middleware';

// Augment Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided. Please authenticate.', 401));
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return next(new AppError('Invalid or expired token', 401));
  }

  req.user = decoded;
  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (req.user.role !== 'ADMIN') {
    return next(new AppError('Access denied. Admin role required.', 403));
  }

  next();
};
