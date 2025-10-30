import { useEffect, useState, useCallback } from 'react';
import { useWebSocket } from '../contexts/WebSocketContext';

interface Notification {
  type: string;
  data: any;
  timestamp: Date;
}

interface UseSocketReturn {
  socket: any;
  isConnected: boolean;
  notifications: Notification[];
  joinRoom: (room: string) => void;
  leaveRoom: (room: string) => void;
  clearNotifications: () => void;
  on: (event: string, listener: (data: any) => void) => () => void;
  emit: (event: string, data?: any) => void;
}

/**
 * Hook to use WebSocket functionality with notification handling
 *
 * This hook wraps the WebSocketContext and adds notification state management
 * compatible with the NotificationBell component
 */
export const useSocket = (): UseSocketReturn => {
  const webSocketContext = useWebSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Subscribe to notifications from WebSocket
  useEffect(() => {
    const unsubscribe = webSocketContext.onNotification((notification: any) => {
      console.log('[useSocket] Notification received:', notification);
      setNotifications((prev) => [...prev, {
        type: notification.type || 'notification',
        data: notification.data || notification,
        timestamp: new Date(notification.timestamp || Date.now()),
      }]);
    });

    return unsubscribe;
  }, [webSocketContext]);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Join a room (community or other)
  const joinRoom = useCallback((room: string) => {
    if (room.startsWith('community:')) {
      const communityId = room.replace('community:', '');
      webSocketContext.joinCommunity(communityId);
    } else if (room.startsWith('post:')) {
      const postId = room.replace('post:', '');
      webSocketContext.subscribeToPost(postId);
    } else {
      console.warn('[useSocket] Unknown room type:', room);
    }
  }, [webSocketContext]);

  // Leave a room
  const leaveRoom = useCallback((room: string) => {
    if (room.startsWith('community:')) {
      const communityId = room.replace('community:', '');
      webSocketContext.leaveCommunity(communityId);
    } else if (room.startsWith('post:')) {
      const postId = room.replace('post:', '');
      webSocketContext.unsubscribeFromPost(postId);
    } else {
      console.warn('[useSocket] Unknown room type:', room);
    }
  }, [webSocketContext]);

  // Generic event listener wrapper
  const on = useCallback((event: string, listener: (data: any) => void) => {
    // Map event names to WebSocket context methods
    switch (event) {
      case 'notification':
        return webSocketContext.onNotification(listener);
      case 'post:new':
        return webSocketContext.onPostNew(listener);
      case 'comment:new':
        return webSocketContext.onCommentNew(listener);
      case 'reaction:new':
        return webSocketContext.onReactionNew(listener);
      case 'user:online':
        return webSocketContext.onUserOnline(listener);
      case 'user:offline':
        return webSocketContext.onUserOffline(listener);
      case 'bridge:update':
        return webSocketContext.onBridgeUpdate(listener);
      case 'message:new':
        return webSocketContext.onMessageNew(listener);
      default:
        console.warn('[useSocket] Unknown event type:', event);
        return () => {};
    }
  }, [webSocketContext]);

  // Emit events (for typing indicators, etc.)
  const emit = useCallback((event: string, data?: any) => {
    if (event === 'typing:start') {
      webSocketContext.startTyping(data || {});
    } else if (event === 'typing:stop') {
      webSocketContext.stopTyping(data || {});
    } else {
      console.warn('[useSocket] Cannot emit unknown event:', event);
    }
  }, [webSocketContext]);

  return {
    socket: webSocketContext.socket,
    isConnected: webSocketContext.isConnected,
    notifications,
    joinRoom,
    leaveRoom,
    clearNotifications,
    on,
    emit,
  };
};
