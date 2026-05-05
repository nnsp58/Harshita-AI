import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

class SocketService {
  constructor() {
    this.socket = null;
    this.userId = null;
  }

  connect(userId) {
    if (this.socket) return;
    this.userId = userId;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('📡 Connected to Rawan WebSocket');
      // Join user-specific room
      if (this.userId) {
        this.socket.emit('join_user', this.userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('📡 Disconnected from Rawan WebSocket');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeToJob(jobId, callback) {
    if (!this.socket) return;
    const room = `job_${jobId}`;
    this.socket.emit('join_job', jobId);
    
    // Generic handlers that can use the callback
    this.socket.on('state_change', (data) => {
      if (data.jobId === jobId) callback('state_change', data);
    });
    
    this.socket.on('job_completed', (data) => {
       if (data.id === jobId) callback('job_completed', data);
    });
    
    this.socket.on('job_failed', (data) => {
       if (data.id === jobId) callback('job_failed', data);
    });
  }

  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }
}

const socketService = new SocketService();
export default socketService;
