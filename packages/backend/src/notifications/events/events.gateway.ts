import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('EventsGateway');
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Remove user from map
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        break;
      }
    }
  }

  @SubscribeMessage('authenticate')
  handleAuthenticate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { userId: string },
  ) {
    this.userSockets.set(data.userId, client.id);
    this.logger.log(`User ${data.userId} authenticated with socket ${client.id}`);
    return { event: 'authenticated', data: { success: true } };
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);
    this.logger.log(`Client ${client.id} joined room ${data.room}`);
    return { event: 'room_joined', data: { room: data.room } };
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    this.logger.log(`Client ${client.id} left room ${data.room}`);
    return { event: 'room_left', data: { room: data.room } };
  }

  // Send notification to specific user
  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
      this.logger.log(`Notification sent to user ${userId}`);
    }
  }

  // Send notification to room
  sendNotificationToRoom(room: string, notification: any) {
    this.server.to(room).emit('notification', notification);
    this.logger.log(`Notification sent to room ${room}`);
  }

  // Broadcast to all connected clients
  broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
    this.logger.log('Notification broadcasted to all clients');
  }

  // Send new message notification
  sendMessageNotification(receiverId: string, message: any) {
    this.sendNotificationToUser(receiverId, {
      type: 'new_message',
      data: message,
      timestamp: new Date(),
    });
  }

  // Send offer notification
  sendOfferNotification(userId: string, offer: any) {
    this.sendNotificationToUser(userId, {
      type: 'new_offer',
      data: offer,
      timestamp: new Date(),
    });
  }

  // Send event notification
  sendEventNotification(userIds: string[], event: any) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, {
        type: 'new_event',
        data: event,
        timestamp: new Date(),
      });
    });
  }
}
