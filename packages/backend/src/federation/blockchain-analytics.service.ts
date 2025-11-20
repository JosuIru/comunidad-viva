import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Blockchain Analytics Service
 *
 * Tracks and analyzes blockchain bridge transactions, token metrics,
 * and provides insights for monitoring and decision making.
 */
@Injectable()
export class BlockchainAnalyticsService {
  private readonly logger = new Logger(BlockchainAnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive bridge metrics
   */
  async getBridgeMetrics(chain?: string, timeframe: 'day' | 'week' | 'month' | 'all' = 'day') {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    const whereClause: any = {
      createdAt: { gte: startDate },
    };

    if (chain) {
      whereClause.fromChain = chain;
    }

    // Get transactions
    const transactions = await this.prisma.bridgeTransaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    // Calculate metrics
    const totalTransactions = transactions.length;
    const successfulTransactions = transactions.filter((tx) => tx.status === 'MINTED').length;
    const failedTransactions = transactions.filter((tx) => tx.status === 'FAILED').length;
    const pendingTransactions = transactions.filter((tx) =>
      ['PENDING', 'LOCKED'].includes(tx.status),
    ).length;

    const totalVolume = transactions.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0);
    const averageTransactionSize = totalTransactions > 0 ? totalVolume / totalTransactions : 0;

    // Get volume by chain
    const volumeByChain: { [key: string]: number } = {};
    transactions.forEach((tx) => {
      const chain = tx.fromChain;
      volumeByChain[chain] = (volumeByChain[chain] || 0) + parseFloat(tx.amount.toString());
    });

    // Get daily volume trend
    const dailyVolume = await this.getDailyVolumeTrend(7, chain);

    // Success rate
    const completedTx = successfulTransactions + failedTransactions;
    const successRate = completedTx > 0 ? (successfulTransactions / completedTx) * 100 : 100;

    // Average processing time
    const completedTransactions = transactions.filter((tx) =>
      ['MINTED', 'FAILED'].includes(tx.status),
    );
    let averageProcessingTime = 0;
    if (completedTransactions.length > 0) {
      const totalTime = completedTransactions.reduce((sum, tx) => {
        if (tx.mintedAt) {
          return sum + (tx.mintedAt.getTime() - tx.createdAt.getTime());
        }
        return sum;
      }, 0);
      averageProcessingTime = totalTime / completedTransactions.length / 1000; // in seconds
    }

    return {
      timeframe,
      chain: chain || 'all',
      totalTransactions,
      successfulTransactions,
      failedTransactions,
      pendingTransactions,
      successRate: successRate.toFixed(2),
      totalVolume,
      averageTransactionSize,
      averageProcessingTime: averageProcessingTime.toFixed(2),
      volumeByChain,
      dailyVolume,
    };
  }

  /**
   * Get daily volume trend
   */
  async getDailyVolumeTrend(days: number = 7, chain?: string) {
    const volumeByDay: { date: string; volume: number; count: number }[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const whereClause: any = {
        createdAt: {
          gte: date,
          lt: nextDate,
        },
      };

      if (chain) {
        whereClause.fromChain = chain;
      }

      const dayTransactions = await this.prisma.bridgeTransaction.findMany({
        where: whereClause,
      });

      const volume = dayTransactions.reduce(
        (sum, tx) => sum + parseFloat(tx.amount.toString()),
        0,
      );

      volumeByDay.push({
        date: date.toISOString().split('T')[0],
        volume,
        count: dayTransactions.length,
      });
    }

    return volumeByDay;
  }

  /**
   * Get top users by volume
   */
  async getTopUsers(limit: number = 10, timeframe: 'day' | 'week' | 'month' | 'all' = 'week') {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0);
    }

    const transactions = await this.prisma.bridgeTransaction.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        gailuDID: true,
        amount: true,
      },
    });

    // Group by user
    const userVolumes: { [did: string]: number } = {};
    const userCounts: { [did: string]: number } = {};

    transactions.forEach((tx) => {
      const did = tx.gailuDID;
      userVolumes[did] = (userVolumes[did] || 0) + parseFloat(tx.amount.toString());
      userCounts[did] = (userCounts[did] || 0) + 1;
    });

    // Convert to array and sort
    const topUsers = Object.entries(userVolumes)
      .map(([did, volume]) => ({
        gailuDID: did,
        totalVolume: volume,
        transactionCount: userCounts[did],
        averageTransaction: volume / userCounts[did],
      }))
      .sort((a, b) => b.totalVolume - a.totalVolume)
      .slice(0, limit);

    return topUsers;
  }

  /**
   * Detect suspicious activity
   */
  async detectSuspiciousActivity() {
    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    const alerts: any[] = [];

    // Check for high volume from single user
    const recentTransactions = await this.prisma.bridgeTransaction.findMany({
      where: {
        createdAt: { gte: lastHour },
      },
    });

    const userActivity: { [did: string]: { count: number; volume: number } } = {};

    recentTransactions.forEach((tx) => {
      const did = tx.gailuDID;
      if (!userActivity[did]) {
        userActivity[did] = { count: 0, volume: 0 };
      }
      userActivity[did].count++;
      userActivity[did].volume += parseFloat(tx.amount.toString());
    });

    // Alert if user has > 10 transactions in last hour
    Object.entries(userActivity).forEach(([did, activity]) => {
      if (activity.count > 10) {
        alerts.push({
          type: 'HIGH_FREQUENCY',
          severity: 'WARNING',
          message: `User ${did} has made ${activity.count} transactions in the last hour`,
          gailuDID: did,
          count: activity.count,
          volume: activity.volume,
        });
      }

      // Alert if user has > 1000 SEMILLA in last hour
      if (activity.volume > 1000) {
        alerts.push({
          type: 'HIGH_VOLUME',
          severity: 'WARNING',
          message: `User ${did} has bridged ${activity.volume} SEMILLA in the last hour`,
          gailuDID: did,
          count: activity.count,
          volume: activity.volume,
        });
      }
    });

    // Check for failed transactions
    const recentFailed = recentTransactions.filter((tx) => tx.status === 'FAILED');
    if (recentFailed.length > 5) {
      alerts.push({
        type: 'HIGH_FAILURE_RATE',
        severity: 'ERROR',
        message: `${recentFailed.length} bridge transactions failed in the last hour`,
        count: recentFailed.length,
      });
    }

    return alerts;
  }

  /**
   * Get failed transactions for investigation
   */
  async getFailedTransactions(limit: number = 20) {
    const failed = await this.prisma.bridgeTransaction.findMany({
      where: { status: 'FAILED' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        gailuDID: true,
        fromChain: true,
        toChain: true,
        amount: true,
        txHash: true,
        createdAt: true,
      },
    });

    return failed;
  }

  /**
   * Get pending transactions
   */
  async getPendingTransactions() {
    const pending = await this.prisma.bridgeTransaction.findMany({
      where: {
        status: {
          in: ['PENDING', 'LOCKED'],
        },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        gailuDID: true,
        fromChain: true,
        toChain: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    return pending;
  }

  /**
   * Get gas cost analytics
   */
  async getGasCostAnalytics(chain?: string) {
    const whereClause: any = {
      status: 'MINTED',
    };

    if (chain) {
      whereClause.toChain = chain;
    }

    const transactions = await this.prisma.bridgeTransaction.findMany({
      where: whereClause,
      select: {
        toChain: true,
        mintTxHash: true,
      },
    });

    // Note: In production, you'd fetch actual gas costs from blockchain
    // This is a placeholder for the structure
    return {
      chain: chain || 'all',
      totalTransactions: transactions.length,
      averageGasCost: 'N/A',
      totalGasCost: 'N/A',
      note: 'Gas cost tracking requires integration with blockchain providers',
    };
  }

  /**
   * Cron job to check for suspicious activity every hour
   */
  @Cron(CronExpression.EVERY_HOUR)
  async checkSuspiciousActivityCron() {
    try {
      const alerts = await this.detectSuspiciousActivity();

      if (alerts.length > 0) {
        this.logger.warn(`🚨 Detected ${alerts.length} suspicious activity alerts`);

        alerts.forEach((alert) => {
          this.logger.warn(`[${alert.type}] ${alert.message}`);
        });

        // TODO: Send notifications via NotificationService
      }
    } catch (error) {
      this.logger.error('Failed to check suspicious activity:', error);
    }
  }

  /**
   * Daily metrics summary (runs at midnight)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async generateDailySummary() {
    try {
      const metrics = await this.getBridgeMetrics(undefined, 'day');

      this.logger.log('📊 Daily Bridge Summary:');
      this.logger.log(`  Total Transactions: ${metrics.totalTransactions}`);
      this.logger.log(`  Total Volume: ${metrics.totalVolume} SEMILLA`);
      this.logger.log(`  Success Rate: ${metrics.successRate}%`);
      this.logger.log(`  Failed: ${metrics.failedTransactions}`);
      this.logger.log(`  Pending: ${metrics.pendingTransactions}`);

      // TODO: Send to monitoring service or Slack/Discord
    } catch (error) {
      this.logger.error('Failed to generate daily summary:', error);
    }
  }
}
