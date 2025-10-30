import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/**
 * WebSocket Gateway for Real-Time Communication
 *
 * Features:
 * - User authentication via JWT
 * - Real-time notifications
 * - Community-specific rooms
 * - User presence tracking
 * - Typing indicators
 * - Live updates for posts, comments, reactions
 *
 * Events emitted:
 * - notification: New notification for user
 * - post:new: New post in community
 * - comment:new: New comment on post
 * - reaction:new: New reaction
 * - user:online: User came online
 * - user:offline: User went offline
 * - typing:start: User started typing
 * - typing:stop: User stopped typing
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/ws',
})
export class AppWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppWebSocketGateway.name);

  // Map to track connected users: userId -> socketId[]
  private connectedUsers = new Map<string, string[]>();

  // Map to track user info: socketId -> userId
  private socketToUser = new Map<string, string>();

  constructor(private jwtService: JwtService) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {
    try {
      // Get token from handshake auth or query
      const token =
        client.handshake.auth?.token || client.handshake.query?.token;

      if (!token) {
        this.logger.warn(`Client ${client.id} attempted connection without token`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token as string);
      const userId = payload.sub;

      if (!userId) {
        this.logger.warn(`Invalid token for client ${client.id}`);
        client.disconnect();
        return;
      }

      // Store user connection
      this.socketToUser.set(client.id, userId);

      const userSockets = this.connectedUsers.get(userId) || [];
      userSockets.push(client.id);
      this.connectedUsers.set(userId, userSockets);

      // Join user's personal room
      client.join(`user:${userId}`);

      // Emit online status to all
      this.server.emit('user:online', { userId, timestamp: new Date() });

      this.logger.log(`User ${userId} connected (socket: ${client.id})`);
      this.logger.debug(`Total connections for user ${userId}: ${userSockets.length}`);
    } catch (error) {
      this.logger.error(`Connection error for socket ${client.id}:`, error.message);
      client.disconnect();
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket) {
    const userId = this.socketToUser.get(client.id);

    if (userId) {
      // Remove socket from user's list
      const userSockets = this.connectedUsers.get(userId) || [];
      const updatedSockets = userSockets.filter((id) => id !== client.id);

      if (updatedSockets.length === 0) {
        // User completely disconnected (no more sockets)
        this.connectedUsers.delete(userId);
        this.server.emit('user:offline', { userId, timestamp: new Date() });
        this.logger.log(`User ${userId} disconnected (all sockets closed)`);
      } else {
        this.connectedUsers.set(userId, updatedSockets);
        this.logger.debug(`User ${userId} still has ${updatedSockets.length} connection(s)`);
      }

      this.socketToUser.delete(client.id);
    }

    this.logger.log(`Socket ${client.id} disconnected`);
  }

  /**
   * Join a community room
   */
  @SubscribeMessage('join:community')
  handleJoinCommunity(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { communityId: string },
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    const roomName = `community:${data.communityId}`;
    client.join(roomName);
    this.logger.log(`User ${userId} joined community room: ${roomName}`);

    return { success: true, room: roomName };
  }

  /**
   * Leave a community room
   */
  @SubscribeMessage('leave:community')
  handleLeaveCommunity(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { communityId: string },
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    const roomName = `community:${data.communityId}`;
    client.leave(roomName);
    this.logger.log(`User ${userId} left community room: ${roomName}`);

    return { success: true, room: roomName };
  }

  /**
   * Typing indicator - start
   */
  @SubscribeMessage('typing:start')
  handleTypingStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId?: string; postId?: string },
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    if (data.conversationId) {
      // Typing in a conversation
      client.to(`conversation:${data.conversationId}`).emit('typing:start', {
        userId,
        conversationId: data.conversationId,
      });
    } else if (data.postId) {
      // Typing a comment on a post
      client.to(`post:${data.postId}`).emit('typing:start', {
        userId,
        postId: data.postId,
      });
    }
  }

  /**
   * Typing indicator - stop
   */
  @SubscribeMessage('typing:stop')
  handleTypingStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId?: string; postId?: string },
  ) {
    const userId = this.socketToUser.get(client.id);
    if (!userId) return;

    if (data.conversationId) {
      client.to(`conversation:${data.conversationId}`).emit('typing:stop', {
        userId,
        conversationId: data.conversationId,
      });
    } else if (data.postId) {
      client.to(`post:${data.postId}`).emit('typing:stop', {
        userId,
        postId: data.postId,
      });
    }
  }

  /**
   * Subscribe to a post (for live comments/reactions)
   */
  @SubscribeMessage('subscribe:post')
  handleSubscribePost(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { postId: string },
  ) {
    const roomName = `post:${data.postId}`;
    client.join(roomName);
    return { success: true, room: roomName };
  }

  /**
   * Unsubscribe from a post
   */
  @SubscribeMessage('unsubscribe:post')
  handleUnsubscribePost(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { postId: string },
  ) {
    const roomName = `post:${data.postId}`;
    client.leave(roomName);
    return { success: true, room: roomName };
  }

  // ======================
  // Server-side emit methods (called from other services)
  // ======================

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.debug(`Notification sent to user ${userId}`);
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  /**
   * Broadcast new post to community
   */
  broadcastNewPost(communityId: string, post: any) {
    this.server.to(`community:${communityId}`).emit('post:new', post);
    this.logger.debug(`New post broadcast to community ${communityId}`);
  }

  /**
   * Broadcast new comment to post watchers
   */
  broadcastNewComment(postId: string, comment: any) {
    this.server.to(`post:${postId}`).emit('comment:new', comment);
    this.logger.debug(`New comment broadcast to post ${postId}`);
  }

  /**
   * Broadcast new reaction to post watchers
   */
  broadcastNewReaction(postId: string, reaction: any) {
    this.server.to(`post:${postId}`).emit('reaction:new', reaction);
    this.logger.debug(`New reaction broadcast to post ${postId}`);
  }

  /**
   * Broadcast message to conversation
   */
  broadcastMessage(conversationId: string, message: any) {
    this.server.to(`conversation:${conversationId}`).emit('message:new', message);
    this.logger.debug(`New message broadcast to conversation ${conversationId}`);
  }

  /**
   * Broadcast bridge status update
   */
  broadcastBridgeUpdate(userId: string, bridgeTransaction: any) {
    this.server.to(`user:${userId}`).emit('bridge:update', bridgeTransaction);
    this.logger.debug(`Bridge update sent to user ${userId}`);
  }

  /**
   * Broadcast event update to attendees
   */
  broadcastEventUpdate(eventId: string, update: any) {
    this.server.to(`event:${eventId}`).emit('event:update', update);
    this.logger.debug(`Event update broadcast to event ${eventId}`);
  }

  /**
   * Get online status of users
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get list of online users
   */
  getOnlineUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Get number of connections for a user
   */
  getUserConnectionCount(userId: string): number {
    return this.connectedUsers.get(userId)?.length || 0;
  }

  /**
   * Get total number of connected sockets
   */
  getTotalConnections(): number {
    return this.socketToUser.size;
  }

  /**
   * Get total number of unique users
   */
  getTotalUniqueUsers(): number {
    return this.connectedUsers.size;
  }
}
