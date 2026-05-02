"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticate = void 0;
const jwt_1 = require("../lib/jwt");
const error_middleware_1 = require("./error.middleware");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new error_middleware_1.AppError('No token provided. Please authenticate.', 401));
    }
    const token = authHeader.split(' ')[1];
    const decoded = (0, jwt_1.verifyToken)(token);
    if (!decoded) {
        return next(new error_middleware_1.AppError('Invalid or expired token', 401));
    }
    req.user = decoded;
    next();
};
exports.authenticate = authenticate;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return next(new error_middleware_1.AppError('Authentication required', 401));
    }
    if (req.user.role !== 'ADMIN') {
        return next(new error_middleware_1.AppError('Access denied. Admin role required.', 403));
    }
    next();
};
exports.requireAdmin = requireAdmin;
