import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { OfferType, OfferStatus } from '@prisma/client';

@Injectable()
export class OffersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  async create(userId: string, data: any) {
    return this.prisma.offer.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(filters?: {
    type?: OfferType;
    category?: string;
    lat?: number;
    lng?: number;
    radius?: number;
  }) {
    return this.prisma.offer.findMany({
      where: {
        status: OfferStatus.ACTIVE,
        ...(filters?.type && { type: filters.type }),
        ...(filters?.category && { category: filters.category }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId?: string) {
    // Increment views
    await this.prisma.offer.update({
      where: { id },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        groupBuy: true,
        timeBank: true,
        event: true,
        interestedUsers: userId
          ? {
              where: {
                userId,
              },
              select: {
                id: true,
              },
            }
          : false,
      },
    });

    if (!offer) return null;

    const { interestedUsers, ...offerData } = offer;
    return {
      ...offerData,
      userIsInterested: interestedUsers && interestedUsers.length > 0,
    };
  }

  async toggleInterest(offerId: string, userId: string) {
    // Check if user is already interested
    const existingInterest = await this.prisma.offerInterest.findUnique({
      where: {
        userId_offerId: {
          userId,
          offerId,
        },
      },
    });

    if (existingInterest) {
      // Remove interest
      await this.prisma.$transaction([
        this.prisma.offerInterest.delete({
          where: { id: existingInterest.id },
        }),
        this.prisma.offer.update({
          where: { id: offerId },
          data: {
            interested: {
              decrement: 1,
            },
          },
        }),
      ]);

      return { interested: false };
    } else {
      // Fetch offer and user data for notifications
      const [offer, user] = await Promise.all([
        this.prisma.offer.findUnique({
          where: { id: offerId },
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        }),
        this.prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true },
        }),
      ]);

      // Add interest
      await this.prisma.$transaction([
        this.prisma.offerInterest.create({
          data: {
            userId,
            offerId,
          },
        }),
        this.prisma.offer.update({
          where: { id: offerId },
          data: {
            interested: {
              increment: 1,
            },
          },
        }),
      ]);

      // Send email notification to offer owner
      if (offer && user && offer.user.email && offer.userId !== userId) {
        await this.emailService.sendOfferInterest(
          offer.user.email,
          user.name,
          user.email,
          offer.title,
        );
      }

      return { interested: true };
    }
  }

  async update(id: string, userId: string, data: any) {
    return this.prisma.offer.update({
      where: { id, userId },
      data,
    });
  }

  async delete(id: string, userId: string) {
    return this.prisma.offer.update({
      where: { id, userId },
      data: { status: OfferStatus.CANCELLED },
    });
  }

  async findUserOffers(userId: string) {
    return this.prisma.offer.findMany({
      where: {
        userId,
        status: {
          not: OfferStatus.CANCELLED,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        interestedUsers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
