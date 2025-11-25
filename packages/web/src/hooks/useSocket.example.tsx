// Example usage of useSocket hook

import React, { useEffect } from 'react';
import { useSocket } from './useSocket';

export const ExampleComponent: React.FC = () => {
  const {
    socket,
    isConnected,
    notifications,
    joinRoom,
    leaveRoom,
    clearNotifications,
    on,
    emit
  } = useSocket();

  useEffect(() => {
    // Example: Listen for a custom event
    const handleCustomEvent = (data: any) => {
      console.log('Custom event received:', data);
    };

    // on() returns a cleanup function
    const unsubscribe = on('custom_event', handleCustomEvent);

    // Cleanup: Remove listener when component unmounts
    return unsubscribe;
  }, [on]);

  useEffect(() => {
    // Example: Join a room when connected
    if (isConnected) {
      joinRoom('general');
    }

    // Example: Leave room on unmount
    return () => {
      if (isConnected) {
        leaveRoom('general');
      }
    };
  }, [isConnected, joinRoom, leaveRoom]);

  const handleSendMessage = () => {
    // Example: Emit a custom event
    emit('send_message', {
      room: 'general',
      message: 'Hello, world!'
    });
  };

  return (
    <div>
      <h2>WebSocket Status</h2>
      <p>Connected: {isConnected ? 'Yes' : 'No'}</p>

      <h3>Notifications ({notifications.length})</h3>
      <ul>
        {notifications.map((notif, index) => (
          <li key={index}>
            {notif.type}: {JSON.stringify(notif.data)}
          </li>
        ))}
      </ul>

      <button onClick={clearNotifications}>Clear Notifications</button>
      <button onClick={handleSendMessage} disabled={!isConnected}>
        Send Message
      </button>

      <button onClick={() => joinRoom('room1')} disabled={!isConnected}>
        Join Room 1
      </button>

      <button onClick={() => leaveRoom('room1')} disabled={!isConnected}>
        Leave Room 1
      </button>
    </div>
  );
};
