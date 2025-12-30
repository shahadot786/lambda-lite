import { io as socketClient, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function connectToBackend() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';

  socket = socketClient(backendUrl, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('Worker connected to backend WebSocket');
  });

  socket.on('disconnect', () => {
    console.log('Worker disconnected from backend WebSocket');
  });

  return socket;
}

export function emitJobUpdate(jobId: string, data: any) {
  if (socket && socket.connected) {
    socket.emit('job:update:worker', { jobId, ...data });
    console.log('Worker emitted job update:', jobId, data.status);
  }
}

export function getSocket(): Socket | null {
  return socket;
}
