import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DIDService } from './did.service';
import { SemillaTransactionType, SemillaTransactionStatus } from '@prisma/client';

/**
 * SEMILLA Token Service
 *
 * Manages the SEMILLA token, the primary currency in the Gailu Labs ecosystem.
 * SEMILLA represents seeds of change - actions that grow into larger transformations.
 *
 * Features:
 * - Transfer tokens between users (local or federated)
 * - Reward users for Proof-of-Help actions
 * - Track balances and transaction history
 * - Node fee (1%) for sustainability
 */
@Injectable()
export class SemillaService {
  private readonly logger = new Logger(SemillaService.name);
  private readonly NODE_FEE_PERCENTAGE = 0.01; // 1% fee

  constructor(
    private prisma: PrismaService,
    private didService: DIDService,
  ) {}

  /**
   * Transfer SEMILLA tokens between users
   * @param fromDID - Sender's DID
   * @param toDID - Receiver's DID
   * @param amount - Amount to transfer
   * @param reason - Reason for transfer
   * @param metadata - Additional metadata
   * @returns Transaction record
   */
  async transfer(
    fromDID: string,
    toDID: string,
    amount: number,
    reason: string,
    type: SemillaTransactionType = 'TRANSFER',
    metadata: Record<string, any> = {},
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    if (fromDID === toDID) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    try {
      // Parse DIDs
      const fromParsed = this.didService.parseDID(fromDID);
      const toParsed = this.didService.parseDID(toDID);

      if (!fromParsed || !toParsed) {
        throw new BadRequestException('Invalid DID format');
      }

      // Calculate fee
      const fee = Math.ceil(amount * this.NODE_FEE_PERCENTAGE);
      const netAmount = amount - fee;

      // Get local user IDs (if they exist on this node)
      const fromId = this.didService.isLocalDID(fromDID) ? fromParsed.userId : null;
      const toId = this.didService.isLocalDID(toDID) ? toParsed.userId : null;

      // Check sender's balance (if local user)
      if (fromId) {
        const sender = await this.prisma.User.findUnique({
          where: { id: fromId },
          select: { semillaBalance: true },
        });

        if (!sender) {
          throw new NotFoundException('Sender not found');
        }

        if (sender.semillaBalance < amount) {
          throw new BadRequestException('Insufficient SEMILLA balance');
        }
      }

      // Execute transaction
      const transaction = await this.prisma.$transaction(async (tx) => {
        // Deduct from sender (if local)
        if (fromId) {
          await tx.User.update({
            where: { id: fromId },
            data: { semillaBalance: { decrement: amount } },
          });
        }

        // Add to receiver (if local)
        if (toId) {
          await tx.User.update({
            where: { id: toId },
            data: { semillaBalance: { increment: netAmount } },
          });
        }

        // Create transaction record
        const txRecord = await tx.semillaTransaction.create({
          data: {
            fromDID,
            fromId,
            toDID,
            toId,
            amount,
            fee,
            type,
            reason,
            metadata,
            status: 'COMPLETED',
            completedAt: new Date(),
          },
          include: {
            from: {
              select: { id: true, name: true, avatar: true },
            },
            to: {
              select: { id: true, name: true, avatar: true },
            },
          },
        });

        return txRecord;
      });

      this.logger.log(
        `SEMILLA transfer: ${amount} (net: ${netAmount}, fee: ${fee}) from ${fromDID} to ${toDID}`,
      );

      return transaction;
    } catch (error) {
      this.logger.error('Transfer failed:', error);
      throw error;
    }
  }

  /**
   * Reward a user with SEMILLA for Proof-of-Help actions
   * @param userDID - User's DID
   * @param amount - Amount to reward
   * @param reason - Reason for reward
   * @param pohIncrease - Increase in Proof-of-Help score
   */
  async rewardProofOfHelp(
    userDID: string,
    amount: number,
    reason: string,
    pohIncrease: number = 1,
  ) {
    if (amount <= 0) {
      throw new BadRequestException('Reward amount must be positive');
    }

    try {
      const parsed = this.didService.parseDID(userDID);
      if (!parsed || !this.didService.isLocalDID(userDID)) {
        throw new BadRequestException('Can only reward local users');
      }

      const userId = parsed.userId;

      // System DID for rewards
      const systemDID = `did:gailu:${this.didService.getNodeId()}:system:rewards`;

      // Update user balance and PoH score
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await tx.User.update({
          where: { id: userId },
          data: {
            semillaBalance: { increment: amount },
            proofOfHelpScore: { increment: pohIncrease },
          },
        });

        // Create reward transaction
        const transaction = await tx.semillaTransaction.create({
          data: {
            fromDID: systemDID,
            fromId: null,
            toDID: userDID,
            toId: userId,
            amount,
            fee: 0, // No fee for rewards
            type: 'REWARD',
            reason,
            metadata: { pohIncrease },
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        return { user, transaction };
      });

      this.logger.log(`Rewarded ${amount} SEMILLA to ${userDID} for: ${reason}`);

      return result;
    } catch (error) {
      this.logger.error('Reward failed:', error);
      throw error;
    }
  }

  /**
   * Get a user's SEMILLA balance
   * @param userDID - User's DID
   * @returns Balance
   */
  async getBalance(userDID: string): Promise<number> {
    const parsed = this.didService.parseDID(userDID);

    if (!parsed || !this.didService.isLocalDID(userDID)) {
      throw new BadRequestException('Can only query local user balances');
    }

    const user = await this.prisma.User.findUnique({
      where: { id: parsed.userId },
      select: { semillaBalance: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user.semillaBalance;
  }

  /**
   * Get transaction history for a user
   * @param userDID - User's DID
   * @param limit - Number of transactions to fetch
   */
  async getTransactionHistory(userDID: string, limit: number = 50) {
    const parsed = this.didService.parseDID(userDID);

    if (!parsed) {
      throw new BadRequestException('Invalid DID format');
    }

    const transactions = await this.prisma.semillaTransaction.findMany({
      where: {
        OR: [{ fromDID: userDID }, { toDID: userDID }],
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        from: {
          select: { id: true, name: true, avatar: true },
        },
        to: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return transactions;
  }

  /**
   * Grant initial SEMILLA to a new user
   * @param userDID - User's DID
   * @param amount - Amount to grant (default: 100)
   */
  async grantInitialTokens(userDID: string, amount: number = 100) {
    const parsed = this.didService.parseDID(userDID);

    if (!parsed || !this.didService.isLocalDID(userDID)) {
      throw new BadRequestException('Can only grant to local users');
    }

    const systemDID = `did:gailu:${this.didService.getNodeId()}:system:initial-grant`;

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.User.update({
        where: { id: parsed.userId },
        data: { semillaBalance: { increment: amount } },
      });

      const transaction = await tx.semillaTransaction.create({
        data: {
          fromDID: systemDID,
          toDID: userDID,
          toId: parsed.userId,
          amount,
          fee: 0,
          type: 'INITIAL_GRANT',
          reason: 'Welcome to Gailu Labs ecosystem',
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      return { user, transaction };
    });

    this.logger.log(`Granted ${amount} SEMILLA to new user ${userDID}`);

    return result;
  }

  /**
   * Get total SEMILLA in circulation on this node
   */
  async getTotalSupply(): Promise<number> {
    const result = await this.prisma.User.aggregate({
      _sum: {
        semillaBalance: true,
      },
    });

    return result._sum.semillaBalance || 0;
  }

  /**
   * Get node statistics
   */
  async getNodeStats() {
    const [totalSupply, totalTransactions, recentTransactions] = await Promise.all([
      this.getTotalSupply(),
      this.prisma.semillaTransaction.count(),
      this.prisma.semillaTransaction.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24h
          },
        },
      }),
    ]);

    const totalFees = await this.prisma.semillaTransaction.aggregate({
      _sum: { fee: true },
    });

    return {
      totalSupply,
      totalTransactions,
      recentTransactions,
      totalFeesCollected: totalFees._sum.fee || 0,
      nodeId: this.didService.getNodeId(),
    };
  }
}
