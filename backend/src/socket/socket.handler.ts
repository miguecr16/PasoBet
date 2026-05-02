import { Server, Socket } from 'socket.io';
import { prisma } from '../lib/prisma';

export const setupSockets = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    // Join event room to get live odds updates
    socket.on('join_event', (eventId: string) => {
      socket.join(`event:${eventId}`);
      console.log(`[Socket] Socket ${socket.id} joined event:${eventId}`);
    });

    // Leave event room
    socket.on('leave_event', (eventId: string) => {
      socket.leave(`event:${eventId}`);
      console.log(`[Socket] Socket ${socket.id} left event:${eventId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] User disconnected: ${socket.id}`);
    });
  });

  // Simulate odds fluctuation for LIVE events every 30 seconds
  setInterval(async () => {
    try {
      const liveCompetencias = await prisma.competencia.findMany({
        where: { estado: 'en_vivo' }, 
        include: { 
          participaciones: {
            include: { caballo: true }
          }
        }
      });

      for (const comp of liveCompetencias) {
        for (const part of comp.participaciones) {
          const caballo = part.caballo;
          // Fluctuate odds by ±5%
          const cuotaAnterior = caballo.cuotaActual || caballo.cuotaBase;
          const fluctuation = 1 + (Math.random() * 0.1 - 0.05);
          let newOdds = cuotaAnterior * fluctuation;
          
          // Constrain between 1.01 and 100
          if (newOdds < 1.01) newOdds = 1.01;
          if (newOdds > 100) newOdds = 100;

          // Round to 2 decimal places
          newOdds = Math.round(newOdds * 100) / 100;

          if (newOdds !== cuotaAnterior) {
             await prisma.caballo.update({
               where: { id: caballo.id },
               data: { cuotaActual: newOdds }
             });

             io.to(`event:${comp.id}`).emit('odds_updated', {
               eventId: comp.id,
               horseId: caballo.id,
               horseName: caballo.nombre,
               odds: newOdds
             });
          }
        }
      }
    } catch (err) {
      console.error('[Socket] Error in odds simulation:', err);
    }
  }, 30000); // 30 seconds
};

