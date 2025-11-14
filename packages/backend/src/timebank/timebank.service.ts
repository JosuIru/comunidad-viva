import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { EmailService } from '../notifications/email.service';
import { TransactionStatus, CreditReason } from '@prisma/client';
import { CreateRequestDto } from './dto/create-request.dto';
import { CompleteTransactionDto } from './dto/complete-transaction.dto';
import { LoggerService } from '../common/logger.service';
import { AchievementsService } from '../achievements/achievements.service';

@Injectable()
export class TimeBankService {
  private readonly logger = new LoggerService('TimeBankService');

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
    private emailService: EmailService,
    private achievementsService: AchievementsService,
  ) {}

  /**
   * Create a time bank request/transaction
   */
  async createRequest(requesterId: string, createRequestDto: CreateRequestDto) {
    const { providerId, offerId, description, hours, scheduledFor } = createRequestDto;

    // Validate provider exists
    const provider = await this.prisma.user.findUnique({
      where: { id: providerId },
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Can't request from yourself
    if (requesterId === providerId) {
      throw new BadRequestException('Cannot create time bank request with yourself');
    }

    // Validate offer if provided
    if (offerId) {
      const offer = await this.prisma.timeBankOffer.findUnique({
        where: { id: offerId },
        include: { Offer: true },
      });
      if (!offer) {
        throw new NotFoundException('Time bank offer not found');
      }
      if (offer.Offer.userId !== providerId) {
        throw new BadRequestException('Offer does not belong to the specified provider');
      }
    }

    // Calculate credits (1 credit per hour, rounded)
    const credits = Math.round(hours);

    const transaction = await this.prisma.timeBankTransaction.create({
      data: {
        requesterId,
        providerId,
        offerId,
        description,
        hours,
        credits,
        scheduledFor: new Date(scheduledFor),
        status: TransactionStatus.PENDING,
      },
      include: {
        requester: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        provider: {
          select: { id: true, name: true, avatar: true, email: true },
        },
        timeBankOffer: {
          include: {
            Offer: true,
            Skill: true,
          },
        },
      },
    });

    // Send email notification to provider
    if (transaction.provider.email) {
      await this.emailService.sendTimeBankRequest(
        transaction.provider.email,
        transaction.requester.name,
        description,
        hours,
        new Date(scheduledFor),
      );
    }

    return transaction;
  }

  /**
   * Confirm or reject a pending transaction (provider only)
   */
  async confirmTransaction(transactionId: string, providerId: string, accept: boolean = true) {
    const transaction = await this.prisma.timeBankTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.providerId !== providerId) {
      throw new ForbiddenException('Only the provider can confirm this transaction');
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new BadRequestException('Transaction is not pending');
    }

    const newStatus = accept ? TransactionStatus.CONFIRMED : TransactionStatus.CANCELLED;

    const updated = await this.prisma.timeBankTransaction.update({
      where: { id: transactionId },
      data: { status: newStatus },
      include: {
        requester: { select: { id: true, name: true, avatar: true, email: true } },
        provider: { select: { id: true, name: true, avatar: true, email: true } },
      },
    });

    // Send email notification to requester
    if (updated.Requester.email) {
      await this.emailService.sendTimeBankConfirmation(
        updated.Requester.email,
        updated.Provider.name,
        updated.description,
        accept,
      );
    }

    return updated;
  }

  /**
   * Complete transaction with rating (bilateral validation)
   * Both parties must complete their side before credits are awarded
   */
  async completeTransaction(
    transactionId: string,
    userId: string,
    completeTransactionDto: CompleteTransactionDto,
  ) {
    const transaction = await this.prisma.timeBankTransaction.findUnique({
      where: { id: transactionId },
      include: {
        requester: { select: { id: true, name: true, avatar: true } },
        provider: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.CONFIRMED) {
      throw new BadRequestException('Transaction must be confirmed before completion');
    }

    const isRequester = transaction.requesterId === userId;
    const isProvider = transaction.providerId === userId;

    if (!isRequester && !isProvider) {
      throw new ForbiddenException('You are not part of this transaction');
    }

    const { rating, comment, impactStory, chainedFavor } = completeTransactionDto;

    // Update the appropriate fields
    const updateData: any = {};

    if (isRequester) {
      if (transaction.requesterRating !== null) {
        throw new BadRequestException('You have already completed your side');
      }
      updateData.requesterRating = rating;
      updateData.requesterComment = comment;
      if (impactStory) updateData.impactStory = impactStory;
      if (chainedFavor !== undefined) updateData.chainedFavor = chainedFavor;
    }

    if (isProvider) {
      if (transaction.providerRating !== null) {
        throw new BadRequestException('You have already completed your side');
      }
      updateData.providerRating = rating;
      updateData.providerComment = comment;
      if (impactStory) updateData.impactStory = impactStory;
      if (chainedFavor !== undefined) updateData.chainedFavor = chainedFavor;
    }

    // Check if both sides have now completed
    const bothCompleted =
      (isRequester && transaction.providerRating !== null) ||
      (isProvider && transaction.requesterRating !== null);

    if (bothCompleted) {
      updateData.status = TransactionStatus.COMPLETED;
      updateData.completedAt = new Date();
    }

    const updated = await this.prisma.timeBankTransaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        requester: { select: { id: true, name: true, avatar: true, email: true } },
        provider: { select: { id: true, name: true, avatar: true, email: true } },
      },
    });

    // Award credits if both parties have completed
    if (bothCompleted) {
      try {
        await this.creditsService.grantCredits(
          transaction.providerId,
          transaction.credits,
          CreditReason.TIME_BANK_HOUR,
          transactionId,
          `Banco de tiempo: ${transaction.description}`,
        );
      } catch (error) {
        // Log error but don't fail the transaction
        this.logger.error(
          'Error awarding time bank credits',
          error instanceof Error ? error.stack : String(error),
        );
      }

      // Check achievements for both provider and requester
      try {
        await Promise.all([
          this.achievementsService.checkAchievements(transaction.providerId),
          this.achievementsService.checkAchievements(transaction.requesterId),
        ]);
      } catch (error) {
        // Log error but don't fail the transaction
        this.logger.error(
          'Error checking achievements',
          error instanceof Error ? error.stack : String(error),
        );
      }

      // Send completion notification to both parties
      if (updated.Requester.email) {
        await this.emailService.sendTimeBankCompletion(
          updated.Requester.email,
          transaction.description,
          transaction.credits,
        );
      }
      if (updated.Provider.email) {
        await this.emailService.sendTimeBankCompletion(
          updated.Provider.email,
          transaction.description,
          transaction.credits,
        );
      }
    }

    return updated;
  }

  /**
   * Cancel a transaction
   */
  async cancelTransaction(transactionId: string, userId: string) {
    const transaction = await this.prisma.timeBankTransaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.requesterId !== userId && transaction.providerId !== userId) {
      throw new ForbiddenException('You are not part of this transaction');
    }

    if (transaction.status === TransactionStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed transaction');
    }

    const updated = await this.prisma.timeBankTransaction.update({
      where: { id: transactionId },
      data: { status: TransactionStatus.CANCELLED },
      include: {
        requester: { select: { id: true, name: true, avatar: true } },
        provider: { select: { id: true, name: true, avatar: true } },
      },
    });

    return updated;
  }

  /**
   * Get user's transactions with filtering
   */
  async getTransactions(
    userId: string,
    params?: {
      status?: TransactionStatus;
      role?: 'requester' | 'provider';
      limit?: number;
      offset?: number;
    },
  ) {
    const { status, role, limit = 20, offset = 0 } = params || {};

    const where: any = {
      OR: [{ requesterId: userId }, { providerId: userId }],
    };

    if (status) {
      where.status = status;
    }

    if (role === 'requester') {
      where.OR = [{ requesterId: userId }];
    } else if (role === 'provider') {
      where.OR = [{ providerId: userId }];
    }

    const [transactions, total] = await Promise.all([
      this.prisma.timeBankTransaction.findMany({
        where,
        include: {
          requester: {
            select: { id: true, name: true, avatar: true },
          },
          provider: {
            select: { id: true, name: true, avatar: true },
          },
          timeBankOffer: {
            include: {
              Skill: true,
            },
          },
        },
        orderBy: { scheduledFor: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.timeBankTransaction.count({ where }),
    ]);

    return { transactions, total, limit, offset };
  }

  /**
   * Get a single transaction by ID
   */
  async getTransaction(transactionId: string, userId: string) {
    const transaction = await this.prisma.timeBankTransaction.findUnique({
      where: { id: transactionId },
      include: {
        requester: {
          select: { id: true, name: true, avatar: true },
        },
        provider: {
          select: { id: true, name: true, avatar: true },
        },
        timeBankOffer: {
          include: {
            Offer: true,
            Skill: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.requesterId !== userId && transaction.providerId !== userId) {
      throw new ForbiddenException('You are not part of this transaction');
    }

    return transaction;
  }

  /**
   * Get available time bank offers
   */
  async getAvailableOffers(params?: {
    category?: string;
    experienceLevel?: string;
    limit?: number;
    offset?: number;
  }) {
    const { category, experienceLevel, limit = 20, offset = 0 } = params || {};

    const where: any = {
      offer: {
        status: 'ACTIVE',
        type: 'TIME_BANK',
      },
    };

    if (category) {
      where.skill = { category };
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    const [offers, total] = await Promise.all([
      this.prisma.timeBankOffer.findMany({
        where,
        include: {
          offer: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
          Skill: true,
        },
        orderBy: { Offer: { createdAt: 'desc' } },
        take: limit,
        skip: offset,
      }),
      this.prisma.timeBankOffer.count({ where }),
    ]);

    return { offers, total, limit, offset };
  }

  /**
   * Get user statistics for time bank
   */
  async getUserStats(userId: string) {
    const [asRequester, asProvider, ratings] = await Promise.all([
      this.prisma.timeBankTransaction.count({
        where: {
          requesterId: userId,
          status: TransactionStatus.COMPLETED,
        },
      }),
      this.prisma.timeBankTransaction.count({
        where: {
          providerId: userId,
          status: TransactionStatus.COMPLETED,
        },
      }),
      this.prisma.timeBankTransaction.findMany({
        where: {
          providerId: userId,
          status: TransactionStatus.COMPLETED,
          requesterRating: { not: null },
        },
        select: {
          requesterRating: true,
        },
      }),
    ]);

    const totalHoursProvided = await this.prisma.timeBankTransaction.aggregate({
      where: {
        providerId: userId,
        status: TransactionStatus.COMPLETED,
      },
      _sum: {
        hours: true,
      },
    });

    const totalHoursReceived = await this.prisma.timeBankTransaction.aggregate({
      where: {
        requesterId: userId,
        status: TransactionStatus.COMPLETED,
      },
      _sum: {
        hours: true,
      },
    });

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, t) => sum + (t.requesterRating || 0), 0) / ratings.length
        : 0;

    return {
      transactionsCompleted: asRequester + asProvider,
      hoursProvided: totalHoursProvided._sum.hours || 0,
      hoursReceived: totalHoursReceived._sum.hours || 0,
      averageRating: Math.round(avgRating * 10) / 10,
      totalRatings: ratings.length,
    };
  }

  /**
   * Get user's time bank offers
   */
  async getUserTimeBankOffers(userId: string) {
    const offers = await this.prisma.timeBankOffer.findMany({
      where: {
        offer: {
          userId,
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
        Skill: true,
      },
      orderBy: {
        offer: {
          createdAt: 'desc',
        },
      },
    });

    return offers;
  }
}
