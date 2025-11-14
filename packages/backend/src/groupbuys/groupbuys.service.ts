import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { CreateGroupBuyDto } from './dto/create-groupbuy.dto';
import { JoinGroupBuyDto } from './dto/join-groupbuy.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';

@Injectable()
export class GroupBuysService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Create a new group buy
   */
  async createGroupBuy(userId: string, createGroupBuyDto: CreateGroupBuyDto) {
    const { offerId, minParticipants, maxParticipants, deadline, pickupLat, pickupLng, pickupAddress, priceBreaks } = createGroupBuyDto;

    // Validate offer exists and belongs to user
    const offer = await this.prisma.offer.findUnique({
      where: { id: offerId },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    if (offer.userId !== userId) {
      throw new ForbiddenException('You can only create group buys for your own offers');
    }

    if (offer.type !== 'GROUP_BUY') {
      throw new BadRequestException('Offer must be of type GROUP_BUY');
    }

    // Validate min < max
    if (minParticipants >= maxParticipants) {
      throw new BadRequestException('minParticipants must be less than maxParticipants');
    }

    // Validate deadline is in the future
    if (new Date(deadline) <= new Date()) {
      throw new BadRequestException('Deadline must be in the future');
    }

    // Validate price breaks are ordered correctly
    const sortedBreaks = [...priceBreaks].sort((a, b) => a.minQuantity - b.minQuantity);
    for (let i = 0; i < sortedBreaks.length - 1; i++) {
      if (sortedBreaks[i].pricePerUnit <= sortedBreaks[i + 1].pricePerUnit) {
        throw new BadRequestException('Price must decrease as quantity increases');
      }
    }

    // Create group buy with price breaks
    const groupBuy = await this.prisma.groupBuy.create({
      data: {
        offerId,
        minParticipants,
        maxParticipants,
        currentParticipants: 0,
        deadline: new Date(deadline),
        pickupLat,
        pickupLng,
        pickupAddress,
        priceBreaks: {
          create: priceBreaks.map(pb => ({
            minQuantity: pb.minQuantity,
            pricePerUnit: pb.pricePerUnit,
            savings: pb.savings,
          })),
        },
      },
      include: {
        offer: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        priceBreaks: {
          orderBy: { minQuantity: 'asc' },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
    });

    return groupBuy;
  }

  /**
   * Get active group buys
   */
  async getActiveGroupBuys(params?: {
    category?: string;
    limit?: number;
    offset?: number;
    nearLat?: number;
    nearLng?: number;
    maxDistance?: number; // km
  }) {
    const { category, limit = 20, offset = 0, nearLat, nearLng, maxDistance = 10 } = params || {};

    const where: any = {
      deadline: { gte: new Date() },
      offer: {
        status: 'ACTIVE',
      },
    };

    if (category) {
      where.offer.category = category;
    }

    // If location provided, filter by proximity
    let groupBuys;
    if (nearLat && nearLng) {
      groupBuys = await this.prisma.$queryRaw<any[]>`
        SELECT
          gb.*,
          ST_Distance(
            ST_MakePoint(${nearLng}, ${nearLat})::geography,
            ST_MakePoint(gb."pickupLng", gb."pickupLat")::geography
          ) / 1000 as distance_km
        FROM "GroupBuy" gb
        INNER JOIN "Offer" o ON gb."offerId" = o.id
        WHERE
          gb.deadline >= NOW()
          AND o.status = 'ACTIVE'
          AND ST_DWithin(
            ST_MakePoint(${nearLng}, ${nearLat})::geography,
            ST_MakePoint(gb."pickupLng", gb."pickupLat")::geography,
            ${maxDistance * 1000}
          )
        ORDER BY distance_km ASC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      const findOptions: any = {
        where,
        include: {
          offer: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
          priceBreaks: {
            orderBy: { minQuantity: 'asc' },
          },
          participants: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
        orderBy: { deadline: 'asc' },
        take: limit,
      };

      // Only include skip if offset is defined and greater than 0
      if (offset !== undefined && offset > 0) {
        findOptions.skip = offset;
      }

      groupBuys = await this.prisma.groupBuy.findMany(findOptions);
    }

    // Calculate current pricing tier for each group buy
    const enrichedGroupBuys = groupBuys.map(gb => {
      const totalQuantity = gb.participants?.reduce((sum: number, p: any) => sum + p.quantity, 0) || 0;
      const currentTier = this.getCurrentPriceTier(gb.priceBreaks, totalQuantity);
      const nextTier = this.getNextPriceTier(gb.priceBreaks, totalQuantity);
      const progress = (gb.currentParticipants / gb.minParticipants) * 100;

      return {
        ...gb,
        totalQuantity,
        currentTier,
        nextTier,
        progress: Math.min(progress, 100),
        isActive: gb.currentParticipants >= gb.minParticipants,
      };
    });

    const total = await this.prisma.groupBuy.count({ where });

    return { groupBuys: enrichedGroupBuys, total, limit, offset };
  }

  /**
   * Get single group buy by ID
   */
  async getGroupBuy(groupBuyId: string) {
    const groupBuy = await this.prisma.groupBuy.findUnique({
      where: { id: groupBuyId },
      include: {
        offer: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
        priceBreaks: {
          orderBy: { minQuantity: 'asc' },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
      },
    });

    if (!groupBuy) {
      throw new NotFoundException('Group buy not found');
    }

    const totalQuantity = groupBuy.participants.reduce((sum, p) => sum + p.quantity, 0);
    const currentTier = this.getCurrentPriceTier(groupBuy.priceBreaks, totalQuantity);
    const nextTier = this.getNextPriceTier(groupBuy.priceBreaks, totalQuantity);
    const progress = (groupBuy.currentParticipants / groupBuy.minParticipants) * 100;

    return {
      ...groupBuy,
      totalQuantity,
      currentTier,
      nextTier,
      progress: Math.min(progress, 100),
      isActive: groupBuy.currentParticipants >= groupBuy.minParticipants,
    };
  }

  /**
   * Join a group buy
   */
  async joinGroupBuy(groupBuyId: string, userId: string, joinGroupBuyDto: JoinGroupBuyDto) {
    const { quantity } = joinGroupBuyDto;

    const groupBuy = await this.prisma.groupBuy.findUnique({
      where: { id: groupBuyId },
      include: {
        participants: true,
        offer: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!groupBuy) {
      throw new NotFoundException('Group buy not found');
    }

    // Validate deadline hasn't passed
    if (groupBuy.deadline < new Date()) {
      throw new BadRequestException('Group buy deadline has passed');
    }

    // Validate not already full
    if (groupBuy.currentParticipants >= groupBuy.maxParticipants) {
      throw new BadRequestException('Group buy is full');
    }

    // Check if user already joined
    const existingParticipation = groupBuy.participants.find(p => p.userId === userId);
    if (existingParticipation) {
      throw new BadRequestException('You have already joined this group buy');
    }

    // Add participant
    const participant = await this.prisma.groupBuyParticipant.create({
      data: {
        groupBuyId,
        userId,
        quantity,
        committed: false,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, email: true },
        },
      },
    });

    // Update participant count
    await this.prisma.groupBuy.update({
      where: { id: groupBuyId },
      data: {
        currentParticipants: { increment: 1 },
      },
    });

    // Send email to organizer about new participation
    if (groupBuy.offer.user.email) {
      await this.emailService.sendGroupBuyParticipation(
        groupBuy.offer.user.email,
        participant.user.name,
        groupBuy.offer.title,
        groupBuy.currentParticipants + 1,
        groupBuy.minParticipants,
      );
    }

    // Check if minimum reached
    const updated = await this.prisma.groupBuy.findUnique({
      where: { id: groupBuyId },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (updated && updated.currentParticipants === updated.minParticipants) {
      // Notify all participants that minimum goal has been reached
      const participantEmails = updated.participants
        .map(p => p.user.email)
        .filter((email): email is string => !!email);

      for (const email of participantEmails) {
        await this.emailService.sendGroupBuyParticipation(
          email,
          'La meta mínima',
          groupBuy.offer.title,
          updated.currentParticipants,
          updated.minParticipants,
        );
      }
    }

    return participant;
  }

  /**
   * Update participation (quantity or commitment)
   */
  async updateParticipation(
    groupBuyId: string,
    userId: string,
    updateParticipationDto: UpdateParticipationDto,
  ) {
    const participation = await this.prisma.groupBuyParticipant.findUnique({
      where: {
        groupBuyId_userId: { groupBuyId, userId },
      },
    });

    if (!participation) {
      throw new NotFoundException('Participation not found');
    }

    const groupBuy = await this.prisma.groupBuy.findUnique({
      where: { id: groupBuyId },
    });

    if (groupBuy && groupBuy.deadline < new Date()) {
      throw new BadRequestException('Cannot update after deadline');
    }

    const updated = await this.prisma.groupBuyParticipant.update({
      where: {
        groupBuyId_userId: { groupBuyId, userId },
      },
      data: updateParticipationDto,
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return updated;
  }

  /**
   * Leave a group buy
   */
  async leaveGroupBuy(groupBuyId: string, userId: string) {
    const participation = await this.prisma.groupBuyParticipant.findUnique({
      where: {
        groupBuyId_userId: { groupBuyId, userId },
      },
    });

    if (!participation) {
      throw new NotFoundException('Participation not found');
    }

    const groupBuy = await this.prisma.groupBuy.findUnique({
      where: { id: groupBuyId },
    });

    if (groupBuy && groupBuy.deadline < new Date()) {
      throw new BadRequestException('Cannot leave after deadline');
    }

    if (participation.committed) {
      throw new BadRequestException('Cannot leave after committing to purchase');
    }

    await this.prisma.groupBuyParticipant.delete({
      where: {
        groupBuyId_userId: { groupBuyId, userId },
      },
    });

    await this.prisma.groupBuy.update({
      where: { id: groupBuyId },
      data: {
        currentParticipants: { decrement: 1 },
      },
    });

    return { success: true };
  }

  /**
   * Close a group buy (organizer only)
   */
  async closeGroupBuy(groupBuyId: string, userId: string) {
    const groupBuy = await this.prisma.groupBuy.findUnique({
      where: { id: groupBuyId },
      include: {
        offer: true,
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
        priceBreaks: {
          orderBy: { minQuantity: 'desc' },
        },
      },
    });

    if (!groupBuy) {
      throw new NotFoundException('Group buy not found');
    }

    if (groupBuy.offer.userId !== userId) {
      throw new ForbiddenException('Only the organizer can close the group buy');
    }

    // Check if minimum participants reached
    if (groupBuy.currentParticipants < groupBuy.minParticipants) {
      throw new BadRequestException('Minimum participants not reached');
    }

    // Check if all participants have committed
    const uncommitted = groupBuy.participants.filter(p => !p.committed);
    if (uncommitted.length > 0) {
      throw new BadRequestException(`${uncommitted.length} participants haven't committed yet`);
    }

    // Update offer status to completed
    await this.prisma.offer.update({
      where: { id: groupBuy.offerId },
      data: { status: 'COMPLETED' },
    });

    // Calculate total quantity and final price
    const totalQuantity = groupBuy.participants.reduce((sum, p) => sum + p.quantity, 0);

    // Find applicable price break
    const applicablePriceBreak = groupBuy.priceBreaks.find(
      pb => totalQuantity >= pb.minQuantity
    );

    const finalPrice = applicablePriceBreak
      ? applicablePriceBreak.pricePerUnit * totalQuantity
      : (groupBuy.offer.priceEur || 0) * totalQuantity;

    const originalPrice = (groupBuy.offer.priceEur || 0) * totalQuantity;
    const savings = originalPrice - finalPrice;

    // Create orders for each participant
    const orderPromises = groupBuy.participants.map(async (participant) => {
      const participantTotal = applicablePriceBreak
        ? applicablePriceBreak.pricePerUnit * participant.quantity
        : (groupBuy.offer.priceEur || 0) * participant.quantity;

      return this.prisma.groupBuyOrder.create({
        data: {
          groupBuyId: groupBuy.id,
          userId: participant.userId,
          quantity: participant.quantity,
          pricePerUnit: applicablePriceBreak?.pricePerUnit || groupBuy.offer.priceEur || 0,
          totalAmount: participantTotal,
          status: 'PENDING',
        },
      });
    });

    await Promise.all(orderPromises);

    // Send notifications to all participants
    const participantEmails = groupBuy.participants
      .map(p => p.user.email)
      .filter((email): email is string => !!email);

    for (const email of participantEmails) {
      await this.emailService.sendGroupBuyClosed(
        email,
        groupBuy.offer.title,
        finalPrice,
        savings,
      );
    }

    return { success: true, message: 'Group buy closed successfully', ordersCreated: groupBuy.participants.length };
  }

  /**
   * Get user's group buy participations
   */
  async getUserParticipations(userId: string) {
    const participations = await this.prisma.groupBuyParticipant.findMany({
      where: { userId },
      include: {
        groupBuy: {
          include: {
            offer: {
              include: {
                user: {
                  select: { id: true, name: true, avatar: true },
                },
              },
            },
            priceBreaks: {
              orderBy: { minQuantity: 'asc' },
            },
            participants: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return participations.map(p => {
      const totalQuantity = p.groupBuy.participants.reduce((sum, part) => sum + part.quantity, 0);
      const currentTier = this.getCurrentPriceTier(p.groupBuy.priceBreaks, totalQuantity);
      const userTotal = p.quantity * (currentTier?.pricePerUnit || 0);

      return {
        ...p,
        totalQuantity,
        currentTier,
        userTotal,
      };
    });
  }

  // Helper methods

  private getCurrentPriceTier(priceBreaks: any[], totalQuantity: number) {
    if (!priceBreaks || priceBreaks.length === 0) return null;

    // Sort descending to find the highest applicable tier
    const sortedBreaks = [...priceBreaks].sort((a, b) => b.minQuantity - a.minQuantity);

    for (const tier of sortedBreaks) {
      if (totalQuantity >= tier.minQuantity) {
        return tier;
      }
    }

    // Return lowest tier if quantity is below all tiers
    return priceBreaks[0];
  }

  private getNextPriceTier(priceBreaks: any[], totalQuantity: number) {
    if (!priceBreaks || priceBreaks.length === 0) return null;

    const sortedBreaks = [...priceBreaks].sort((a, b) => a.minQuantity - b.minQuantity);

    for (const tier of sortedBreaks) {
      if (totalQuantity < tier.minQuantity) {
        return tier;
      }
    }

    return null; // Already at highest tier
  }
}
