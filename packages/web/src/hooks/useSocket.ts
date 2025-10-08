import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Notification {
  type: string;
  data: any;
  timestamp: Date;
}

type EventListener = (data: any) => void;

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  notifications: Notification[];
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  clearNotifications: () => void;
  on: (event: string, listener: EventListener) => void;
  off: (event: string, listener: EventListener) => void;
  emit: (event: string, data?: any) => void;
}

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Get userId from localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.warn('No userId found in localStorage. WebSocket will not connect.');
      return;
    }

    // Connect to WebSocket server
    const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:4000';
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      autoConnect: true,
    });

    socketRef.current = newSocket;

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('WebSocket connected:', newSocket.id);
      setIsConnected(true);

      // Authenticate user with userId from localStorage
      newSocket.emit('authenticate', { userId });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('WebSocket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log('WebSocket reconnection attempt:', attemptNumber);
    });

    newSocket.on('reconnect_error', (error) => {
      console.error('WebSocket reconnection error:', error);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('WebSocket reconnection failed');
    });

    // Authentication response
    newSocket.on('authenticated', (data) => {
      console.log('User authenticated:', data);
    });

    // Notification listener
    newSocket.on('notification', (notification: Notification) => {
      console.log('Notification received:', notification);
      setNotifications((prev) => [...prev, notification]);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      newSocket.removeAllListeners();
      newSocket.close();
      socketRef.current = null;
    };
  }, []); // Empty dependency array - connect only once on mount

  // Join room helper
  const joinRoom = useCallback((room: string) => {
    if (socketRef.current && isConnected) {
      console.log('Joining room:', room);
      socketRef.current.emit('join_room', { room });
    } else {
      console.warn('Cannot join room: socket not connected');
    }
  }, [isConnected]);

  // Leave room helper
  const leaveRoom = useCallback((room: string) => {
    if (socketRef.current && isConnected) {
      console.log('Leaving room:', room);
      socketRef.current.emit('leave_room', { room });
    } else {
      console.warn('Cannot leave room: socket not connected');
    }
  }, [isConnected]);

  // Clear notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Listen for custom events
  const on = useCallback((event: string, listener: EventListener) => {
    if (socketRef.current) {
      console.log('Registering listener for event:', event);
      socketRef.current.on(event, listener);
    } else {
      console.warn('Cannot register listener: socket not initialized');
    }
  }, []);

  // Remove custom event listener
  const off = useCallback((event: string, listener: EventListener) => {
    if (socketRef.current) {
      console.log('Removing listener for event:', event);
      socketRef.current.off(event, listener);
    }
  }, []);

  // Emit custom events
  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current && isConnected) {
      console.log('Emitting event:', event, data);
      socketRef.current.emit(event, data);
    } else {
      console.warn('Cannot emit event: socket not connected');
    }
  }, [isConnected]);

  return {
    socket,
    isConnected,
    notifications,
    joinRoom,
    leaveRoom,
    clearNotifications,
    on,
    off,
    emit,
  };
};
