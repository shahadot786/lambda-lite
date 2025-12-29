import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('WebSocket client connected:', socket.id);

    socket.on('disconnect', () => {
      console.log('WebSocket client disconnected:', socket.id);
    });
  });

  console.log('WebSocket server initialized');
  return io;
}

export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
}

export function emitJobUpdate(jobId: string, data: any) {
  if (io) {
    io.emit('job:update', { jobId, ...data });
    console.log('Emitted job update:', jobId, data.status);
  }
}
