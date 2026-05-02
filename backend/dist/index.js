"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const error_middleware_1 = require("./middleware/error.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Enable CORS for all routes (Dev mode)
app.use((0, cors_1.default)());
// Parse JSON bodies
app.use(express_1.default.json());
// Basic health check route
app.get('/health', (req, res) => {
    res.status(200).json({ success: true, message: 'PasoBet API is running' });
});
// Setup Socket.IO
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});
const socket_handler_1 = require("./socket/socket.handler");
(0, socket_handler_1.setupSockets)(io);
const routes_1 = __importDefault(require("./routes"));
app.use('/api', routes_1.default);
// 404 Route handler
app.use((req, res, next) => {
    next(new error_middleware_1.AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});
// Global Error Handler
app.use(error_middleware_1.errorHandler);
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
