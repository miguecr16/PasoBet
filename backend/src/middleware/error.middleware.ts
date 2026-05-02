// Error definitions
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global Error Middleware
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: err,
      stack: err.stack
    });
  } else {
    // Production
    if (err.isOperational) {
      res.status(err.statusCode).json({
        success: false,
        message: err.message
      });
    } else {
      console.error('ERROR 💥', err);
      res.status(500).json({
        success: false,
        message: 'Something went very wrong!'
      });
    }
  }
};
