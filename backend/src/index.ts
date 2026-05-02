import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { errorHandler, AppError } from './middleware/error.middleware';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Enable CORS for all routes (Dev mode)
app.use(cors());

// Parse JSON bodies
app.use(express.json());

// Basic health check route
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'PasoBet API is running' });
});

// Setup Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

import { setupSockets } from './socket/socket.handler';
setupSockets(io);

import routes from './routes';
app.use('/api', routes);

// 404 Route handler
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
