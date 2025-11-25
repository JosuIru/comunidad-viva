# useSocket Hook Documentation

A custom React hook for managing WebSocket connections using Socket.IO client.

## Features

- Auto-connects to WebSocket server on component mount
- Auto-disconnects on component unmount
- Automatic authentication using userId from localStorage
- Reconnection logic with configurable retry attempts
- Room management (join/leave)
- Built-in notification handling
- Custom event listeners
- TypeScript support with full type safety

## Installation

socket.io-client is already installed (v4.8.1).

## Usage

### Basic Setup

Before using the hook, ensure that `userId` is stored in localStorage:

```typescript
localStorage.setItem('userId', 'your-user-id');
```

### Import and Use

```typescript
import { useSocket } from '@/hooks/useSocket';

function MyComponent() {
  const {
    socket,
    isConnected,
    notifications,
    joinRoom,
    leaveRoom,
    clearNotifications,
    on,
    off,
    emit
  } = useSocket();

  // Your component logic
}
```

## API Reference

### Return Values

| Property | Type | Description |
|----------|------|-------------|
| `socket` | `Socket \| null` | The Socket.IO socket instance |
| `isConnected` | `boolean` | Connection status |
| `notifications` | `Notification[]` | Array of received notifications |
| `joinRoom` | `(room: string) => void` | Join a Socket.IO room |
| `leaveRoom` | `(room: string) => void` | Leave a Socket.IO room |
| `clearNotifications` | `() => void` | Clear all notifications |
| `on` | `(event: string, listener: EventListener) => void` | Listen for custom events |
| `off` | `(event: string, listener: EventListener) => void` | Remove event listener |
| `emit` | `(event: string, data?: any) => void` | Emit custom events |

### Types

```typescript
interface Notification {
  type: string;
  data: any;
  timestamp: Date;
}

type EventListener = (data: any) => void;
```

## Configuration

The hook connects to the WebSocket server using:
- Environment variable: `NEXT_PUBLIC_SOCKET_URL`
- Default fallback: `ws://localhost:4000`

### Reconnection Settings

- **reconnection**: Enabled
- **reconnectionDelay**: 1000ms (1 second)
- **reconnectionDelayMax**: 5000ms (5 seconds)
- **reconnectionAttempts**: 5 attempts
- **autoConnect**: true
- **transports**: websocket (primary), polling (fallback)

## Examples

### Joining and Leaving Rooms

```typescript
useEffect(() => {
  if (isConnected) {
    joinRoom('chat-room-1');
  }

  return () => {
    if (isConnected) {
      leaveRoom('chat-room-1');
    }
  };
}, [isConnected, joinRoom, leaveRoom]);
```

### Listening for Custom Events

```typescript
useEffect(() => {
  const handleMessage = (data: any) => {
    console.log('Message received:', data);
  };

  on('message', handleMessage);

  return () => {
    off('message', handleMessage);
  };
}, [on, off]);
```

### Emitting Events

```typescript
const sendMessage = () => {
  emit('send_message', {
    room: 'chat-room-1',
    message: 'Hello, everyone!'
  });
};
```

### Handling Notifications

```typescript
useEffect(() => {
  if (notifications.length > 0) {
    notifications.forEach(notif => {
      console.log(`Notification: ${notif.type}`, notif.data);
    });
  }
}, [notifications]);
```

## Backend Events

The hook automatically handles these events:

### Emitted Events (Client → Server)

- `authenticate`: Sent on connection with `{ userId }`
- `join_room`: Join a room with `{ room }`
- `leave_room`: Leave a room with `{ room }`

### Listened Events (Server → Client)

- `connect`: Connection established
- `disconnect`: Connection closed
- `connect_error`: Connection error occurred
- `reconnect`: Reconnection successful
- `reconnect_attempt`: Reconnection attempt in progress
- `reconnect_error`: Reconnection error
- `reconnect_failed`: All reconnection attempts failed
- `authenticated`: Authentication successful
- `notification`: New notification received

## Best Practices

1. **Store userId in localStorage before using the hook**
   ```typescript
   localStorage.setItem('userId', 'user-123');
   ```

2. **Clean up event listeners in useEffect**
   ```typescript
   useEffect(() => {
     const handler = (data) => console.log(data);
     on('event', handler);
     return () => off('event', handler);
   }, [on, off]);
   ```

3. **Check connection status before emitting events**
   ```typescript
   if (isConnected) {
     emit('my_event', data);
   }
   ```

4. **Join rooms after connection is established**
   ```typescript
   useEffect(() => {
     if (isConnected) {
       joinRoom('my-room');
     }
   }, [isConnected]);
   ```

## Troubleshooting

### Connection Issues

If the socket doesn't connect:
1. Verify `userId` is in localStorage
2. Check the backend server is running on port 4000
3. Verify CORS settings on the backend
4. Check browser console for error messages

### Environment Variables

To use a different WebSocket URL, set:
```env
NEXT_PUBLIC_SOCKET_URL=ws://your-server-url:port
```

## Notes

- The hook uses `useRef` to maintain a stable socket reference
- Connection is established only once on mount
- All event listeners are cleaned up on unmount
- The hook will not connect if no userId is found in localStorage
