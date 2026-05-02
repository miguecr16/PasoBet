import { io, Socket } from 'socket.io-client';
import type { OddsUpdatePayload } from '../types';

const SOCKET_URL = 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io(SOCKET_URL);
      this.socket.on('connect', () => {
        console.log('Connected to WebSocket');
      });
      this.socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinEvent(eventId: string) {
    if (this.socket) {
      this.socket.emit('join_event', eventId);
    }
  }

  leaveEvent(eventId: string) {
    if (this.socket) {
      this.socket.emit('leave_event', eventId);
    }
  }

  onOddsUpdate(callback: (data: OddsUpdatePayload) => void) {
    if (this.socket) {
      this.socket.on('odds_updated', callback);
    }
  }

  offOddsUpdate() {
    if (this.socket) {
      this.socket.off('odds_updated');
    }
  }
}

export const socketService = new SocketService();
