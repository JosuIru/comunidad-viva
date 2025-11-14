import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { EventsGateway } from '../notifications/events/events.gateway';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  async getConversations(userId: string) {
    // Get all unique users the current user has messaged with
    const sentMessages = await this.prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });

    const receivedMessages = await this.prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const userIds = [
      ...new Set([
        ...sentMessages.map(m => m.receiverId),
        ...receivedMessages.map(m => m.senderId),
      ]),
    ];

    // Get user details and last message for each conversation
    const conversations = await Promise.all(
      userIds.map(async (otherUserId) => {
        const lastMessage = await this.prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        });

        const unreadCount = await this.prisma.message.count({
          where: {
            senderId: otherUserId,
            receiverId: userId,
            read: false,
          },
        });

        const user = await this.prisma.User.findUnique({
          where: { id: otherUserId },
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        });

        return {
          user,
          lastMessage,
          unreadCount,
        };
      }),
    );

    return conversations.sort((a, b) =>
      (b.lastMessage?.createdAt?.getTime() || 0) - (a.lastMessage?.createdAt?.getTime() || 0)
    );
  }

  async getMessages(userId: string, otherUserId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Mark received messages as read
    await this.prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    return messages;
  }

  async sendMessage(senderId: string, receiverId: string, sendMessageDto: SendMessageDto) {
    const receiver = await this.prisma.User.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('User not found');
    }

    const message = await this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        content: sendMessageDto.content,
        metadata: sendMessageDto.attachments ? { attachments: sendMessageDto.attachments } : null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Send real-time notification to receiver
    this.eventsGateway.sendMessageNotification(receiverId, message);

    return message;
  }

  async markAsRead(messageId: string, userId: string) {
    const message = await this.prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.receiverId !== userId) {
      throw new Error('Unauthorized');
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }
}
