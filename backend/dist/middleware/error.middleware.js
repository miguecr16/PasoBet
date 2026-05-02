"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
// Error definitions
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
            error: err,
            stack: err.stack
        });
    }
    else {
        // Production
        if (err.isOperational) {
            res.status(err.statusCode).json({
                success: false,
                message: err.message
            });
        }
        else {
            console.error('ERROR 💥', err);
            res.status(500).json({
                success: false,
                message: 'Something went very wrong!'
            });
        }
    }
};
exports.errorHandler = errorHandler;
