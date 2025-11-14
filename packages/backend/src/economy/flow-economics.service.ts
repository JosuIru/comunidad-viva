import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditReason, FlowType, PoolType, RequestStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

/**
 * Flow Economics Service
 *
 * Implements progressive economic mechanics:
 * - Flow Multipliers: Transactions generate extra value based on circulation
 * - Community Pools: Collective resources for different purposes
 * - Generosity Tracking: Measures giving behavior
 * - Gini Index: Tracks economic equality
 * - Demurrage: Discourages hoarding (optional, gradual implementation)
 */
@Injectable()
export class FlowEconomicsService {
  private readonly logger = new Logger(FlowEconomicsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Calculate flow multiplier based on balance difference
   *
   * Logic: When credits flow from high balance to low balance,
   * a multiplier is applied generating extra value
   *
   * Example:
   * - Rich (1000) → Poor (50): multiplier = 1.5 → 10 credits become 15
   * - Poor (50) → Rich (1000): multiplier = 1.0 → no bonus
   * - Similar (100) → (120): multiplier = 1.1 → small bonus
   */
  calculateFlowMultiplier(fromBalance: number, toBalance: number): number {
    // No multiplier if sending to richer person
    if (toBalance >= fromBalance) {
      return 1.0;
    }

    // Calculate balance ratio (how much richer the sender is)
    const balanceRatio = fromBalance / Math.max(toBalance, 1);

    // Progressive multiplier based on ratio
    if (balanceRatio >= 10) {
      // Very rich to very poor: 1.5x multiplier
      return 1.5;
    } else if (balanceRatio >= 5) {
      // Rich to poor: 1.3x multiplier
      return 1.3;
    } else if (balanceRatio >= 2) {
      // Moderate difference: 1.15x multiplier
      return 1.15;
    } else {
      // Small difference: 1.05x multiplier
      return 1.05;
    }
  }

  /**
   * Calculate pool contribution (small % of transactions)
   * This funds community pools for collective benefit
   */
  calculatePoolContribution(amount: number): number {
    // 2% of transaction goes to community pool
    return Math.floor(amount * 0.02);
  }

  /**
   * Execute a peer-to-peer flow transaction with multipliers
   *
   * This is the hybrid approach:
   * - Still uses regular CreditTransaction for compatibility
   * - Adds FlowTransaction for flow mechanics tracking
   * - Applies flow multiplier bonus
   * - Contributes to community pool
   */
  async executePeerTransaction(
    fromUserId: string,
    toUserId: string,
    baseAmount: number,
    reason: CreditReason,
    description?: string,
    relatedId?: string,
  ) {
    // Get current balances and user info
    const [fromUser, toUser] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: fromUserId }, select: { credits: true, name: true, email: true } }),
      this.prisma.user.findUnique({ where: { id: toUserId }, select: { credits: true, name: true, email: true } }),
    ]);

    if (!fromUser || !toUser) {
      throw new Error('User not found');
    }

    // Calculate flow mechanics
    const flowMultiplier = this.calculateFlowMultiplier(fromUser.credits, toUser.credits);
    const totalValue = Math.floor(baseAmount * flowMultiplier);
    const bonusValue = totalValue - baseAmount;
    const poolContribution = this.calculatePoolContribution(baseAmount);

    // Execute transaction with Prisma transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // 1. Deduct from sender (base amount only)
      const updatedFrom = await tx.user.update({
        where: { id: fromUserId },
        data: {
          credits: {
            decrement: baseAmount,
          },
          // Increase generosity score for giving
          generosityScore: {
            increment: baseAmount * 0.1,
          },
        },
      });

      // 2. Add to receiver (total value with multiplier)
      const updatedTo = await tx.user.update({
        where: { id: toUserId },
        data: {
          credits: {
            increment: totalValue,
          },
        },
      });

      // 3. Create regular credit transactions (for compatibility)
      await tx.creditTransaction.create({
        data: {
          id: uuidv4(),
          userId: fromUserId,
          amount: -baseAmount,
          balance: updatedFrom.credits,
          reason,
          description: description || `Enviado a ${toUser.name || toUser.email}`,
          relatedId,
        },
      });

      await tx.creditTransaction.create({
        data: {
          id: uuidv4(),
          userId: toUserId,
          amount: totalValue,
          balance: updatedTo.credits,
          reason,
          description: description || `Recibido de ${fromUser.name || fromUser.email}`,
          relatedId,
        },
      });

      // 4. Create flow transaction record
      const flowTx = await tx.flowTransaction.create({
        data: {
          id: uuidv4(),
          fromUserId,
          toUserId,
          baseAmount,
          flowMultiplier,
          totalValue,
          type: FlowType.PEER_TO_PEER,
          reason,
          description,
          relatedId,
          fromBalance: fromUser.credits,
          toBalance: toUser.credits,
          poolContribution,
        },
      });

      // 5. If there's bonus value, create it from the system
      if (bonusValue > 0) {
        await tx.creditTransaction.create({
          data: {
            id: uuidv4(),
            userId: toUserId,
            amount: bonusValue,
            balance: updatedTo.credits,
            reason: CreditReason.COMMUNITY_HELP,
            description: `Bonus de flujo (${flowMultiplier}x)`,
            relatedId: flowTx.id,
          },
        });
      }

      // 6. Add to community pool (EQUALITY pool for redistribution)
      if (poolContribution > 0) {
        await this.contributeToPool(tx, PoolType.EQUALITY, poolContribution, fromUserId);
      }

      return { flowTx, bonusValue, poolContribution };
    });

    this.logger.log(
      `Flow transaction: ${baseAmount} credits (${flowMultiplier}x) = ${totalValue} total. ` +
        `Bonus: ${bonusValue}, Pool: ${poolContribution}`,
    );

    return result;
  }

  /**
   * Contribute to a community pool
   */
  async contributeToPool(
    tx: any,
    poolType: PoolType,
    amount: number,
    userId?: string,
    reason?: string,
  ) {
    // Get or create pool
    let pool = await tx.communityPool.findUnique({
      where: { type: poolType },
    });

    if (!pool) {
      pool = await tx.communityPool.create({
        data: {
          type: poolType,
          balance: 0,
          totalReceived: 0,
          totalDistributed: 0,
        },
      });
    }

    // Update pool balance
    await tx.communityPool.update({
      where: { id: pool.id },
      data: {
        balance: {
          increment: amount,
        },
        totalReceived: {
          increment: amount,
        },
      },
    });

    // Record contribution
    if (userId) {
      await tx.poolContribution.create({
        data: {
          userId,
          poolId: pool.id,
          amount,
          reason,
        },
      });
    }
  }

  /**
   * Calculate Gini Index for economic equality measurement
   * 0 = perfect equality, 1 = perfect inequality
   *
   * Target: Keep Gini < 0.4 (considered equitable)
   */
  async calculateGiniIndex(): Promise<number> {
    const users = await this.prisma.user.findMany({
      select: { credits: true },
      orderBy: { credits: 'asc' },
    });

    if (users.length === 0) return 0;

    const balances = users.map((u) => u.credits);
    const n = balances.length;
    const mean = balances.reduce((a, b) => a + b, 0) / n;

    if (mean === 0) return 0;

    let numerator = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        numerator += Math.abs(balances[i] - balances[j]);
      }
    }

    const gini = numerator / (2 * n * n * mean);
    return Math.min(gini, 1); // Cap at 1
  }

  /**
   * Get economic metrics summary
   */
  async getEconomicMetrics() {
    const [users, pools, flowTransactions] = await Promise.all([
      this.prisma.user.findMany({
        select: { credits: true, generosityScore: true },
        orderBy: { credits: 'desc' },
      }),
      this.prisma.communityPool.findMany(),
      this.prisma.flowTransaction.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24h
          },
        },
      }),
    ]);

    const balances = users.map((u) => u.credits).sort((a, b) => a - b);
    const totalBalance = balances.reduce((a, b) => a + b, 0);

    const giniIndex = await this.calculateGiniIndex();

    const top10Count = Math.ceil(users.length * 0.1);
    const top10Balance = users.slice(0, top10Count).reduce((sum, u) => sum + u.credits, 0);

    return {
      // Equality metrics
      giniIndex,
      medianBalance: balances[Math.floor(balances.length / 2)] || 0,
      meanBalance: Math.floor(totalBalance / users.length) || 0,
      wealthConcentration: totalBalance > 0 ? (top10Balance / totalBalance) * 100 : 0,

      // Flow metrics
      transactionsCount: flowTransactions.length,
      averageFlowMultiplier:
        flowTransactions.length > 0
          ? flowTransactions.reduce((sum, tx) => sum + tx.flowMultiplier, 0) /
            flowTransactions.length
          : 1.0,
      totalValueGenerated: flowTransactions.reduce(
        (sum, tx) => sum + (tx.totalValue - tx.baseAmount),
        0,
      ),

      // Pool metrics
      pools: pools.map((p) => ({
        type: p.type,
        balance: p.balance,
        totalReceived: p.totalReceived,
        totalDistributed: p.totalDistributed,
      })),
      totalPoolBalance: pools.reduce((sum, p) => sum + p.balance, 0),

      // Activity metrics
      activeUsers: users.length,
      generousUsers: users.filter((u) => u.generosityScore > 0).length,
    };
  }

  /**
   * Store daily economic metrics
   * Should be called by a cron job daily
   */
  async storeDailyMetrics() {
    const metrics = await this.getEconomicMetrics();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const economicMetricsId = `metrics-${today.toISOString().split('T')[0]}`;

    return this.prisma.economicMetrics.upsert({
      where: { date: today },
      create: {
        id: economicMetricsId,
        date: today,
        giniIndex: metrics.giniIndex,
        medianBalance: metrics.medianBalance,
        meanBalance: metrics.meanBalance,
        wealthConcentration: metrics.wealthConcentration,
        transactionsCount: metrics.transactionsCount,
        averageFlowMultiplier: metrics.averageFlowMultiplier,
        totalValueGenerated: metrics.totalValueGenerated,
        totalPoolBalance: metrics.totalPoolBalance,
        poolDistributions: 0, // TODO: Track distributions
        activeUsers: metrics.activeUsers,
        generousUsers: metrics.generousUsers,
      },
      update: {
        giniIndex: metrics.giniIndex,
        medianBalance: metrics.medianBalance,
        meanBalance: metrics.meanBalance,
        wealthConcentration: metrics.wealthConcentration,
        transactionsCount: metrics.transactionsCount,
        averageFlowMultiplier: metrics.averageFlowMultiplier,
        totalValueGenerated: metrics.totalValueGenerated,
        totalPoolBalance: metrics.totalPoolBalance,
        activeUsers: metrics.activeUsers,
        generousUsers: metrics.generousUsers,
      },
    });
  }

  /**
   * Apply demurrage (token decay for hoarding)
   *
   * This is optional and should be implemented gradually:
   * - Start with gentle decay (0.1% daily) only on excessive hoarding (>10x average)
   * - Communicate clearly to users
   * - Provide grace period
   *
   * Currently NOT implemented - placeholder for future
   */
  async applyDemurrage(userId: string): Promise<number> {
    // TODO: Implement gentle demurrage for excessive hoarding
    // For now, return 0 (no demurrage)
    return 0;
  }

  /**
   * Distribute from community pool based on need
   * This can be done through proposals/voting or automated based on criteria
   */
  async distributeFromPool(
    poolType: PoolType,
    recipientId: string,
    amount: number,
    reason: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Get pool
      const pool = await tx.communityPool.findUnique({
        where: { type: poolType },
      });

      if (!pool || pool.balance < amount) {
        throw new Error('Insufficient pool balance');
      }

      // Update pool
      await tx.communityPool.update({
        where: { id: pool.id },
        data: {
          balance: {
            decrement: amount,
          },
          totalDistributed: {
            increment: amount,
          },
          lastDistribution: new Date(),
        },
      });

      // Give to recipient
      const updatedUser = await tx.user.update({
        where: { id: recipientId },
        data: {
          credits: {
            increment: amount,
          },
        },
      });

      // Create credit transaction
      await tx.creditTransaction.create({
        data: {
          id: uuidv4(),
          userId: recipientId,
          amount,
          balance: updatedUser.credits,
          reason: CreditReason.COMMUNITY_HELP,
          description: `Apoyo de la comunidad: ${reason}`,
        },
      });

      return { success: true, amount };
    });
  }

  /**
   * Create a pool request
   */
  async createPoolRequest(
    userId: string,
    poolType: PoolType,
    amount: number,
    reason: string,
  ) {
    // Get pool
    const pool = await this.prisma.communityPool.findUnique({
      where: { type: poolType },
    });

    if (!pool) {
      throw new Error('Pool not found');
    }

    // Create request
    const now = new Date();
    const request = await this.prisma.poolRequest.create({
      data: {
        id: uuidv4(),
        userId,
        poolId: pool.id,
        amount,
        reason,
        status: RequestStatus.PENDING,
        updatedAt: now,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        CommunityPool: true,
      },
    });

    this.logger.log(`Pool request created: ${request.id} for ${amount} credits from ${poolType}`);

    return request;
  }

  /**
   * Get pool requests with filters
   */
  async getPoolRequests(status?: RequestStatus) {
    const where = status ? { status } : {};

    return this.prisma.poolRequest.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        CommunityPool: true,
        PoolRequestVote: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                avatar: true,
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

  /**
   * Get user's own pool requests
   */
  async getMyPoolRequests(userId: string) {
    return this.prisma.poolRequest.findMany({
      where: { userId },
      include: {
        CommunityPool: true,
        PoolRequestVote: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                avatar: true,
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

  /**
   * Get pool request by ID
   */
  async getPoolRequestById(requestId: string) {
    return this.prisma.poolRequest.findUnique({
      where: { id: requestId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            generosityScore: true,
          },
        },
        CommunityPool: true,
        PoolRequestVote: {
          include: {
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
        },
      },
    });
  }

  /**
   * Vote on a pool request
   */
  async voteOnPoolRequest(
    requestId: string,
    voterId: string,
    vote: boolean,
    comment?: string,
  ) {
    // Check if user already voted
    const existingVote = await this.prisma.poolRequestVote.findUnique({
      where: {
        requestId_voterId: {
          requestId,
          voterId,
        },
      },
    });

    if (existingVote) {
      // Update existing vote
      return this.prisma.poolRequestVote.update({
        where: { id: existingVote.id },
        data: { vote, comment },
      });
    }

    // Create new vote
    const newVote = await this.prisma.poolRequestVote.create({
      data: {
        id: uuidv4(),
        requestId,
        voterId,
        vote,
        comment,
      },
    });

    // Check if auto-approval threshold is met (e.g., 3 approve votes)
    await this.checkAutoApproval(requestId);

    return newVote;
  }

  /**
   * Check if request should be auto-approved based on votes
   */
  private async checkAutoApproval(requestId: string) {
    const request = await this.prisma.poolRequest.findUnique({
      where: { id: requestId },
      include: {
        PoolRequestVote: true,
      },
    });

    if (!request || request.status !== RequestStatus.PENDING) {
      return;
    }

    const approveVotes = request.PoolRequestVote.filter((v) => v.vote === true).length;
    const rejectVotes = request.PoolRequestVote.filter((v) => v.vote === false).length;

    // Auto-approve if 3+ approve votes and no reject votes
    if (approveVotes >= 3 && rejectVotes === 0) {
      await this.prisma.poolRequest.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.APPROVED,
          approvedAt: new Date(),
        },
      });

      this.logger.log(`Pool request ${requestId} auto-approved with ${approveVotes} votes`);
    }

    // Auto-reject if 3+ reject votes
    if (rejectVotes >= 3) {
      await this.prisma.poolRequest.update({
        where: { id: requestId },
        data: {
          status: RequestStatus.REJECTED,
          rejectedAt: new Date(),
        },
      });

      this.logger.log(`Pool request ${requestId} auto-rejected with ${rejectVotes} votes`);
    }
  }

  /**
   * Manually approve a pool request
   */
  async approvePoolRequest(requestId: string, approverId: string) {
    const request = await this.prisma.poolRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new Error('Request is not pending');
    }

    return this.prisma.poolRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.APPROVED,
        approvedBy: approverId,
        approvedAt: new Date(),
      },
    });
  }

  /**
   * Reject a pool request
   */
  async rejectPoolRequest(requestId: string, rejecterId: string) {
    const request = await this.prisma.poolRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== RequestStatus.PENDING) {
      throw new Error('Request is not pending');
    }

    return this.prisma.poolRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.REJECTED,
        rejectedBy: rejecterId,
        rejectedAt: new Date(),
      },
    });
  }

  /**
   * Distribute funds from approved pool request
   */
  async distributePoolRequest(requestId: string) {
    const request = await this.prisma.poolRequest.findUnique({
      where: { id: requestId },
      include: {
        CommunityPool: true,
      },
    });

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.status !== RequestStatus.APPROVED) {
      throw new Error('Request is not approved');
    }

    // Use existing distributeFromPool method
    const result = await this.distributeFromPool(
      request.CommunityPool.type,
      request.userId,
      request.amount,
      request.reason,
    );

    // Mark request as distributed
    await this.prisma.poolRequest.update({
      where: { id: requestId },
      data: {
        status: RequestStatus.DISTRIBUTED,
        distributedAt: new Date(),
      },
    });

    this.logger.log(
      `Pool request ${requestId} distributed: ${request.amount} credits to user ${request.userId}`,
    );

    return result;
  }
}
