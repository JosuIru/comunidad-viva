import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { OfferType, OfferStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

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
    communityId?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    nearLat?: number;
    nearLng?: number;
    maxDistance?: number;
  }) {
    // Support both parameter names for proximity
    const userLat = filters?.nearLat || filters?.lat;
    const userLng = filters?.nearLng || filters?.lng;
    const maxDistanceKm = filters?.maxDistance || filters?.radius;

    // Build where clause
    const where: any = {
      status: OfferStatus.ACTIVE,
      ...(filters?.type && { type: filters.type }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.communityId && { communityId: filters.communityId }),
    };

    // Fetch all offers matching basic filters
    let offers = await this.prisma.offer.findMany({
      where,
      select: {
        id: true,
        userId: true,
        communityId: true,
        type: true,
        category: true,
        title: true,
        description: true,
        images: true,
        priceEur: true,
        priceCredits: true,
        stock: true,
        lat: true,
        lng: true,
        address: true,
        tags: true,
        status: true,
        featured: true,
        views: true,
        interested: true,
        createdAt: true,
        updatedAt: true,
        User: {
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

    // Apply proximity filter if coordinates and distance are provided
    if (userLat && userLng && maxDistanceKm && maxDistanceKm > 0) {
      offers = offers.filter((offer) => {
        if (!offer.lat || !offer.lng) return false;

        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(offer.lat - userLat);
        const dLng = this.toRadians(offer.lng - userLng);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(this.toRadians(userLat)) *
            Math.cos(this.toRadians(offer.lat)) *
            Math.sin(dLng / 2) *
            Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;

        return distance <= maxDistanceKm;
      });
    }

    return offers;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
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
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        GroupBuy: true,
        TimeBankOffer: true,
        Event: true,
        OfferInterest: userId
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

    const { OfferInterest, ...offerData } = offer;
    return {
      ...offerData,
      userIsInterested: OfferInterest && OfferInterest.length > 0,
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
            User: {
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
            id: uuidv4(),
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
      if (offer && user && offer.User.email && offer.userId !== userId) {
        await this.emailService.sendOfferInterest(
          offer.User.email,
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
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        OfferInterest: {
          include: {
            User: {
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
