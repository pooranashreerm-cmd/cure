import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { JwtPayload } from '../types';

class SocketService {
  private io: SocketIOServer | null = null;

  public init(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
      if (token) {
        try {
          const rawToken = token.startsWith('Bearer ') ? token.slice(7) : token;
          const decoded = jwt.verify(rawToken, config.jwtSecret) as JwtPayload;
          socket.data.user = decoded;
        } catch (err) {
          // Allow connection as guest if dev, but track unauthenticated
        }
      }
      next();
    });

    this.io.on('connection', (socket) => {
      const user = socket.data.user;
      if (user) {
        socket.join(`user:${user.userId}`);
        if (user.patientId) socket.join(`patient:${user.patientId}`);
        if (user.doctorId) socket.join(`doctor:${user.doctorId}`);
        if (user.workerId) socket.join(`worker:${user.workerId}`);
        if (user.pharmacyId) socket.join(`pharmacy:${user.pharmacyId}`);
      }

      socket.on('join-queue', (doctorId: string) => {
        socket.join(`queue:doctor:${doctorId}`);
      });

      socket.on('disconnect', () => {
        // Disconnected
      });
    });

    console.log('[Socket.IO] Real-time WebSocket service initialized.');
  }

  public emitToUser(userId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public emitToPatient(patientId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`patient:${patientId}`).emit(event, data);
  }

  public emitToDoctorQueue(doctorId: string, event: string, data: any) {
    if (!this.io) return;
    this.io.to(`queue:doctor:${doctorId}`).emit(event, data);
    this.io.emit(event, data); // Also broadcast global queue update for public displays
  }

  public emitBroadcast(event: string, data: any) {
    if (!this.io) return;
    this.io.emit(event, data);
  }
}

export const socketService = new SocketService();
