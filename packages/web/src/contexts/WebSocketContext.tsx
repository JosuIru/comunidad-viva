import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface WebSocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinCommunity: (communityId: string) => void;
  leaveCommunity: (communityId: string) => void;
  subscribeToPost: (postId: string) => void;
  unsubscribeFromPost: (postId: string) => void;
  startTyping: (data: { conversationId?: string; postId?: string }) => void;
  stopTyping: (data: { conversationId?: string; postId?: string }) => void;
  onNotification: (callback: (notification: any) => void) => () => void;
  onPostNew: (callback: (post: any) => void) => () => void;
  onCommentNew: (callback: (comment: any) => void) => () => void;
  onReactionNew: (callback: (reaction: any) => void) => () => void;
  onUserOnline: (callback: (data: { userId: string; timestamp: Date }) => void) => () => void;
  onUserOffline: (callback: (data: { userId: string; timestamp: Date }) => void) => () => void;
  onBridgeUpdate: (callback: (bridge: any) => void) => () => void;
  onMessageNew: (callback: (message: any) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  token?: string | null;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children, token }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!token) {
      // No token, disconnect if connected
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

    const newSocket = io(`${wsUrl}/ws`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('[WebSocket] Connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Cleanup on unmount or token change
    return () => {
      if (socketRef.current) {
        console.log('[WebSocket] Cleaning up connection');
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  // Helper function to emit with error handling
  const emitSafe = useCallback((event: string, data?: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
      return true;
    }
    console.warn(`[WebSocket] Cannot emit '${event}': Not connected`);
    return false;
  }, [isConnected]);

  // Join a community room
  const joinCommunity = useCallback((communityId: string) => {
    emitSafe('join:community', { communityId });
  }, [emitSafe]);

  // Leave a community room
  const leaveCommunity = useCallback((communityId: string) => {
    emitSafe('leave:community', { communityId });
  }, [emitSafe]);

  // Subscribe to a post for live updates
  const subscribeToPost = useCallback((postId: string) => {
    emitSafe('subscribe:post', { postId });
  }, [emitSafe]);

  // Unsubscribe from a post
  const unsubscribeFromPost = useCallback((postId: string) => {
    emitSafe('unsubscribe:post', { postId });
  }, [emitSafe]);

  // Start typing indicator
  const startTyping = useCallback((data: { conversationId?: string; postId?: string }) => {
    emitSafe('typing:start', data);
  }, [emitSafe]);

  // Stop typing indicator
  const stopTyping = useCallback((data: { conversationId?: string; postId?: string }) => {
    emitSafe('typing:stop', data);
  }, [emitSafe]);

  // Event listener helpers with cleanup
  const onNotification = useCallback((callback: (notification: any) => void) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on('notification', callback);
    return () => {
      socketRef.current?.off('notification', callback);
    };
  }, []);

  const onPostNew = useCallback((callback: (post: any) => void) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on('post:new', callback);
    return () => {
      socketRef.current?.off('post:new', callback);
    };
  }, []);

  const onCommentNew = useCallback((callback: (comment: any) => void) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on('comment:new', callback);
    return () => {
      socketRef.current?.off('comment:new', callback);
    };
  }, []);

  const onReactionNew = useCallback((callback: (reaction: any) => void) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on('reaction:new', callback);
    return () => {
      socketRef.current?.off('reaction:new', callback);
    };
  }, []);

  const onUserOnline = useCallback((callback: (data: { userId: string; timestamp: Date }) => void) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on('user:online', callback);
    return () => {
      socketRef.current?.off('user:online', callback);
    };
  }, []);

  const onUserOffline = useCallback((callback: (data: { userId: string; timestamp: Date }) => void) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on('user:offline', callback);
    return () => {
      socketRef.current?.off('user:offline', callback);
    };
  }, []);

  const onBridgeUpdate = useCallback((callback: (bridge: any) => void) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on('bridge:update', callback);
    return () => {
      socketRef.current?.off('bridge:update', callback);
    };
  }, []);

  const onMessageNew = useCallback((callback: (message: any) => void) => {
    if (!socketRef.current) return () => {};

    socketRef.current.on('message:new', callback);
    return () => {
      socketRef.current?.off('message:new', callback);
    };
  }, []);

  const value: WebSocketContextType = {
    socket,
    isConnected,
    joinCommunity,
    leaveCommunity,
    subscribeToPost,
    unsubscribeFromPost,
    startTyping,
    stopTyping,
    onNotification,
    onPostNew,
    onCommentNew,
    onReactionNew,
    onUserOnline,
    onUserOffline,
    onBridgeUpdate,
    onMessageNew,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
