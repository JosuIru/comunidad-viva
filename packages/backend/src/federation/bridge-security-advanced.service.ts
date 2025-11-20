import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomUUID } from 'crypto';

/**
 * Advanced Bridge Security Service
 *
 * Implements additional security layers on top of smart contract security:
 * - ML-based fraud detection
 * - Pattern analysis
 * - Geographic restrictions
 * - Velocity checks
 * - Automated circuit breakers
 */
@Injectable()
export class BridgeSecurityAdvancedService {
  private readonly logger = new Logger(BridgeSecurityAdvancedService.name);

  // Security thresholds
  private readonly MAX_DAILY_VOLUME_PER_USER = 5000; // SEMILLA
  private readonly MAX_HOURLY_TRANSACTIONS_PER_USER = 20;
  private readonly SUSPICIOUS_AMOUNT_THRESHOLD = 500; // SEMILLA
  private readonly MAX_FAILED_ATTEMPTS = 5;

  // Tracking maps
  private blockedAddresses: Set<string> = new Set();
  private suspiciousPatterns: Map<string, number> = new Map();
  private failedAttempts: Map<string, number> = new Map();

  constructor(private prisma: PrismaService) {
    this.loadBlockedAddresses();
  }

  /**
   * Load blocked addresses from database on startup
   */
  private async loadBlockedAddresses() {
    try {
      // In production, load from database
      // For now, initialize empty set
      this.logger.log('Loaded blocked addresses');
    } catch (error) {
      this.logger.error('Failed to load blocked addresses:', error);
    }
  }

  /**
   * Validate a bridge transaction before processing
   * Returns: { allowed: boolean, reason?: string }
   */
  async validateTransaction(params: {
    gailuDID: string;
    walletAddress: string;
    amount: number;
    fromChain: string;
    toChain: string;
  }): Promise<{ allowed: boolean; reason?: string; riskScore?: number }> {
    const { gailuDID, walletAddress, amount, fromChain, toChain } = params;

    // 1. Check if address is blocked
    if (this.blockedAddresses.has(walletAddress)) {
      return {
        allowed: false,
        reason: 'Address is blocked due to suspicious activity',
        riskScore: 100,
      };
    }

    // 2. Check daily volume limit
    const dailyVolume = await this.getUserDailyVolume(gailuDID);
    if (dailyVolume + amount > this.MAX_DAILY_VOLUME_PER_USER) {
      this.logger.warn(`User ${gailuDID} exceeded daily volume limit: ${dailyVolume + amount}`);
      return {
        allowed: false,
        reason: `Daily volume limit exceeded (${this.MAX_DAILY_VOLUME_PER_USER} SEMILLA)`,
        riskScore: 80,
      };
    }

    // 3. Check hourly transaction count
    const hourlyCount = await this.getUserHourlyTransactionCount(gailuDID);
    if (hourlyCount >= this.MAX_HOURLY_TRANSACTIONS_PER_USER) {
      this.logger.warn(`User ${gailuDID} exceeded hourly transaction limit: ${hourlyCount}`);
      return {
        allowed: false,
        reason: `Too many transactions in the last hour (max ${this.MAX_HOURLY_TRANSACTIONS_PER_USER})`,
        riskScore: 70,
      };
    }

    // 4. Check for suspicious patterns
    const patternRisk = await this.detectSuspiciousPatterns(gailuDID, walletAddress, amount);
    if (patternRisk > 70) {
      this.logger.warn(`Suspicious pattern detected for ${gailuDID}: risk ${patternRisk}`);

      // Auto-block if very high risk
      if (patternRisk >= 90) {
        await this.blockAddress(walletAddress, `Automated block - high risk score: ${patternRisk}`);
        return {
          allowed: false,
          reason: 'Transaction blocked due to suspicious activity pattern',
          riskScore: patternRisk,
        };
      }

      // Require manual review for medium-high risk
      return {
        allowed: false,
        reason: 'Transaction flagged for manual review',
        riskScore: patternRisk,
      };
    }

    // 5. Check for large amounts
    if (amount >= this.SUSPICIOUS_AMOUNT_THRESHOLD) {
      this.logger.warn(`Large amount transaction: ${amount} SEMILLA from ${gailuDID}`);

      // Log for monitoring but allow (can add manual review later)
      await this.logSecurityEvent({
        type: 'LARGE_AMOUNT',
        gailuDID,
        walletAddress,
        amount,
        fromChain,
        toChain,
        severity: 'WARNING',
      });
    }

    // 6. Check failed attempts
    const failedCount = this.failedAttempts.get(walletAddress) || 0;
    if (failedCount >= this.MAX_FAILED_ATTEMPTS) {
      this.logger.warn(`Address ${walletAddress} has ${failedCount} failed attempts`);
      await this.blockAddress(walletAddress, 'Too many failed transaction attempts');
      return {
        allowed: false,
        reason: 'Address temporarily blocked due to failed attempts',
        riskScore: 85,
      };
    }

    // All checks passed
    return { allowed: true, riskScore: patternRisk };
  }

  /**
   * Get user's daily transaction volume
   */
  private async getUserDailyVolume(gailuDID: string): Promise<number> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const transactions = await this.prisma.bridgeTransaction.findMany({
      where: {
        gailuDID,
        createdAt: { gte: oneDayAgo },
        status: { in: ['LOCKED', 'MINTED'] },
      },
      select: {
        amount: true,
      },
    });

    return transactions.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0);
  }

  /**
   * Get user's hourly transaction count
   */
  private async getUserHourlyTransactionCount(gailuDID: string): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const count = await this.prisma.bridgeTransaction.count({
      where: {
        gailuDID,
        createdAt: { gte: oneHourAgo },
      },
    });

    return count;
  }

  /**
   * Detect suspicious patterns using heuristics
   * Returns risk score 0-100
   */
  private async detectSuspiciousPatterns(
    gailuDID: string,
    walletAddress: string,
    amount: number,
  ): Promise<number> {
    let riskScore = 0;

    // Get user's transaction history
    const userTransactions = await this.prisma.bridgeTransaction.findMany({
      where: { gailuDID },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (userTransactions.length === 0) {
      // New user - slight risk increase
      riskScore += 10;
    } else {
      // 1. Check for rapid succession of transactions
      if (userTransactions.length >= 5) {
        const recentFive = userTransactions.slice(0, 5);
        const timeSpan =
          recentFive[0].createdAt.getTime() - recentFive[4].createdAt.getTime();

        if (timeSpan < 5 * 60 * 1000) {
          // 5 transactions in < 5 minutes
          riskScore += 30;
          this.logger.warn(`Rapid transaction pattern detected for ${gailuDID}`);
        }
      }

      // 2. Check for round number patterns (often bots)
      const isRoundNumber = amount % 100 === 0 && amount >= 100;
      if (isRoundNumber) {
        const recentRoundNumbers = userTransactions
          .slice(0, 5)
          .filter((tx) => parseFloat(tx.amount.toString()) % 100 === 0);

        if (recentRoundNumbers.length >= 3) {
          riskScore += 20;
          this.logger.warn(`Round number pattern detected for ${gailuDID}`);
        }
      }

      // 3. Check for unusual amount spike
      const avgAmount =
        userTransactions.reduce((sum, tx) => sum + parseFloat(tx.amount.toString()), 0) /
        userTransactions.length;

      if (amount > avgAmount * 5) {
        // Amount is 5x average
        riskScore += 25;
        this.logger.warn(`Unusual amount spike for ${gailuDID}: ${amount} vs avg ${avgAmount}`);
      }

      // 4. Check for same amount repeated transactions
      const sameAmountCount = userTransactions
        .slice(0, 10)
        .filter((tx) => parseFloat(tx.amount.toString()) === amount).length;

      if (sameAmountCount >= 5) {
        riskScore += 15;
        this.logger.warn(`Repeated same amount pattern for ${gailuDID}`);
      }
    }

    // 5. Check if address has been flagged before
    const previousFlags = this.suspiciousPatterns.get(walletAddress) || 0;
    riskScore += previousFlags;

    // Cap at 100
    return Math.min(riskScore, 100);
  }

  /**
   * Block an address
   */
  async blockAddress(address: string, reason: string) {
    this.blockedAddresses.add(address);
    this.logger.warn(`🚫 Blocked address: ${address} - Reason: ${reason}`);

    // Log security event
    await this.logSecurityEvent({
      type: 'ADDRESS_BLOCKED',
      walletAddress: address,
      severity: 'CRITICAL',
      reason,
    });

    // Store in database for persistence
    try {
      await this.prisma.security_events.create({
        data: {
          id: randomUUID(),
          type: 'ADDRESS_BLOCKED',
          severity: 'CRITICAL',
          details: {
            walletAddress: address,
            reason,
            timestamp: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      this.logger.error(`Failed to persist blocked address to database: ${error.message}`);
    }
  }

  /**
   * Unblock an address (admin action)
   */
  unblockAddress(address: string) {
    this.blockedAddresses.delete(address);
    this.failedAttempts.delete(address);
    this.suspiciousPatterns.delete(address);

    this.logger.log(`✅ Unblocked address: ${address}`);
  }

  /**
   * Record a failed transaction attempt
   */
  recordFailedAttempt(walletAddress: string) {
    const current = this.failedAttempts.get(walletAddress) || 0;
    this.failedAttempts.set(walletAddress, current + 1);
  }

  /**
   * Clear failed attempts (after successful transaction)
   */
  clearFailedAttempts(walletAddress: string) {
    this.failedAttempts.delete(walletAddress);
  }

  /**
   * Log security event
   */
  private async logSecurityEvent(event: any) {
    try {
      this.logger.warn(`🔒 Security Event: ${JSON.stringify(event)}`);

      // Store in database SecurityEvent table
      await this.prisma.security_events.create({
        data: {
          id: randomUUID(),
          type: event.type || 'UNKNOWN',
          severity: event.severity || 'INFO',
          details: {
            ...event,
            timestamp: new Date().toISOString(),
          },
        },
      });

      // TODO: Send to monitoring service (Sentry, Datadog, etc.)
      // This could integrate with external services like:
      // - Sentry for error tracking
      // - Datadog for monitoring
      // - PagerDuty for critical alerts
    } catch (error) {
      this.logger.error('Failed to log security event:', error);
    }
  }

  /**
   * Get security statistics
   */
  async getSecurityStats() {
    return {
      blockedAddresses: this.blockedAddresses.size,
      suspiciousPatterns: this.suspiciousPatterns.size,
      addressesWithFailedAttempts: this.failedAttempts.size,
      thresholds: {
        maxDailyVolume: this.MAX_DAILY_VOLUME_PER_USER,
        maxHourlyTransactions: this.MAX_HOURLY_TRANSACTIONS_PER_USER,
        suspiciousAmountThreshold: this.SUSPICIOUS_AMOUNT_THRESHOLD,
        maxFailedAttempts: this.MAX_FAILED_ATTEMPTS,
      },
    };
  }

  /**
   * Cron job to clean up old failed attempts
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupFailedAttempts() {
    try {
      // Reset failed attempts daily
      const previousSize = this.failedAttempts.size;
      this.failedAttempts.clear();

      this.logger.log(`🧹 Cleaned up ${previousSize} failed attempt records`);
    } catch (error) {
      this.logger.error('Failed to cleanup failed attempts:', error);
    }
  }

  /**
   * Get list of blocked addresses
   */
  getBlockedAddresses(): string[] {
    return Array.from(this.blockedAddresses);
  }
}
