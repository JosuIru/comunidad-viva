import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BridgeChain } from './bridge.service';
import { randomUUID } from 'crypto';

/**
 * Bridge Security Service
 *
 * Protections implemented:
 * 1. Double-spend detection
 * 2. Rate limiting per user
 * 3. Anomaly detection
 * 4. Transaction pattern analysis
 * 5. Blacklist management
 * 6. Circuit breaker
 */

interface SecurityCheck {
  allowed: boolean;
  reason?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface UserActivity {
  userId: string;
  lastBridgeTimestamp: Date;
  bridgeCountLast1h: number;
  bridgeCountLast24h: number;
  totalVolumeLast1h: number;
  totalVolumeLast24h: number;
}

@Injectable()
export class BridgeSecurityService {
  private readonly logger = new Logger(BridgeSecurityService.name);

  // Circuit breaker state
  private circuitBreakerOpen = false;
  private circuitBreakerReason: string | null = null;

  // Blacklisted addresses and DIDs
  private blacklistedDIDs = new Set<string>();
  private blacklistedAddresses = new Set<string>();

  // Security thresholds
  private readonly THRESHOLDS = {
    MAX_BRIDGES_PER_HOUR: 10,
    MAX_BRIDGES_PER_DAY: 50,
    MAX_VOLUME_PER_HOUR: 10000, // SEMILLA
    MAX_VOLUME_PER_DAY: 100000, // SEMILLA
    MAX_SINGLE_TRANSACTION: 50000, // SEMILLA
    MIN_TIME_BETWEEN_BRIDGES: 60 * 1000, // 1 minute
    ANOMALY_THRESHOLD_MULTIPLIER: 5, // 5x normal activity
  };

  constructor(private prisma: PrismaService) {
    this.loadBlacklists();
  }

  /**
   * Main security check before allowing bridge
   */
  async checkBridgeAllowed(
    userDID: string,
    amount: number,
    targetChain: BridgeChain,
    externalAddress: string,
  ): Promise<SecurityCheck> {
    // Check circuit breaker
    if (this.circuitBreakerOpen) {
      return {
        allowed: false,
        reason: `Bridge temporarily disabled: ${this.circuitBreakerReason}`,
        severity: 'CRITICAL',
      };
    }

    // Check blacklists
    if (this.blacklistedDIDs.has(userDID)) {
      await this.logSecurityEvent('BLACKLISTED_DID_ATTEMPT', {
        userDID,
        amount,
        targetChain,
      });
      return {
        allowed: false,
        reason: 'User is blacklisted',
        severity: 'HIGH',
      };
    }

    if (this.blacklistedAddresses.has(externalAddress.toLowerCase())) {
      await this.logSecurityEvent('BLACKLISTED_ADDRESS_ATTEMPT', {
        userDID,
        externalAddress,
        amount,
      });
      return {
        allowed: false,
        reason: 'External address is blacklisted',
        severity: 'HIGH',
      };
    }

    // Check amount limits
    if (amount > this.THRESHOLDS.MAX_SINGLE_TRANSACTION) {
      await this.logSecurityEvent('LARGE_TRANSACTION_ATTEMPT', {
        userDID,
        amount,
        limit: this.THRESHOLDS.MAX_SINGLE_TRANSACTION,
      });
      return {
        allowed: false,
        reason: `Transaction exceeds maximum of ${this.THRESHOLDS.MAX_SINGLE_TRANSACTION} SEMILLA`,
        severity: 'MEDIUM',
      };
    }

    // Check user activity patterns
    const activityCheck = await this.checkUserActivity(userDID, amount);
    if (!activityCheck.allowed) {
      return activityCheck;
    }

    // Check for concurrent transactions (double-spend attempt)
    const concurrentCheck = await this.checkConcurrentTransactions(userDID);
    if (!concurrentCheck.allowed) {
      return concurrentCheck;
    }

    // Check for anomalous behavior
    const anomalyCheck = await this.checkAnomalies(userDID, amount);
    if (!anomalyCheck.allowed) {
      return anomalyCheck;
    }

    return { allowed: true };
  }

  /**
   * Check user activity limits
   */
  private async checkUserActivity(
    userDID: string,
    amount: number,
  ): Promise<SecurityCheck> {
    const activity = await this.getUserActivity(userDID);

    // Check rate limits
    if (activity.bridgeCountLast1h >= this.THRESHOLDS.MAX_BRIDGES_PER_HOUR) {
      await this.logSecurityEvent('RATE_LIMIT_EXCEEDED_1H', {
        userDID,
        count: activity.bridgeCountLast1h,
      });
      return {
        allowed: false,
        reason: `Rate limit exceeded: maximum ${this.THRESHOLDS.MAX_BRIDGES_PER_HOUR} bridges per hour`,
        severity: 'MEDIUM',
      };
    }

    if (activity.bridgeCountLast24h >= this.THRESHOLDS.MAX_BRIDGES_PER_DAY) {
      await this.logSecurityEvent('RATE_LIMIT_EXCEEDED_24H', {
        userDID,
        count: activity.bridgeCountLast24h,
      });
      return {
        allowed: false,
        reason: `Rate limit exceeded: maximum ${this.THRESHOLDS.MAX_BRIDGES_PER_DAY} bridges per day`,
        severity: 'MEDIUM',
      };
    }

    // Check volume limits
    const newVolume1h = activity.totalVolumeLast1h + amount;
    if (newVolume1h > this.THRESHOLDS.MAX_VOLUME_PER_HOUR) {
      await this.logSecurityEvent('VOLUME_LIMIT_EXCEEDED_1H', {
        userDID,
        currentVolume: activity.totalVolumeLast1h,
        attemptedAmount: amount,
      });
      return {
        allowed: false,
        reason: `Volume limit exceeded: maximum ${this.THRESHOLDS.MAX_VOLUME_PER_HOUR} SEMILLA per hour`,
        severity: 'MEDIUM',
      };
    }

    const newVolume24h = activity.totalVolumeLast24h + amount;
    if (newVolume24h > this.THRESHOLDS.MAX_VOLUME_PER_DAY) {
      await this.logSecurityEvent('VOLUME_LIMIT_EXCEEDED_24H', {
        userDID,
        currentVolume: activity.totalVolumeLast24h,
        attemptedAmount: amount,
      });
      return {
        allowed: false,
        reason: `Volume limit exceeded: maximum ${this.THRESHOLDS.MAX_VOLUME_PER_DAY} SEMILLA per day`,
        severity: 'MEDIUM',
      };
    }

    // Check minimum time between bridges
    if (activity.lastBridgeTimestamp) {
      const timeSinceLastBridge =
        Date.now() - activity.lastBridgeTimestamp.getTime();
      if (timeSinceLastBridge < this.THRESHOLDS.MIN_TIME_BETWEEN_BRIDGES) {
        await this.logSecurityEvent('RAPID_SUCCESSION_ATTEMPT', {
          userDID,
          timeSinceLastBridge,
          minimumRequired: this.THRESHOLDS.MIN_TIME_BETWEEN_BRIDGES,
        });
        return {
          allowed: false,
          reason: 'Please wait at least 1 minute between bridge transactions',
          severity: 'LOW',
        };
      }
    }

    return { allowed: true };
  }

  /**
   * Check for concurrent/duplicate transactions (double-spend attempt)
   */
  private async checkConcurrentTransactions(
    userDID: string,
  ): Promise<SecurityCheck> {
    // Check for pending transactions in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const pendingTransactions = await this.prisma.bridgeTransaction.count({
      where: {
        userDID,
        status: { in: ['PENDING', 'LOCKED'] },
        createdAt: { gte: fiveMinutesAgo },
      },
    });

    if (pendingTransactions > 0) {
      await this.logSecurityEvent('CONCURRENT_TRANSACTION_ATTEMPT', {
        userDID,
        pendingCount: pendingTransactions,
      });
      return {
        allowed: false,
        reason: 'You have a pending bridge transaction. Please wait for it to complete.',
        severity: 'HIGH',
      };
    }

    return { allowed: true };
  }

  /**
   * Detect anomalous behavior patterns
   */
  private async checkAnomalies(
    userDID: string,
    amount: number,
  ): Promise<SecurityCheck> {
    // Get user's historical average
    const historicalAverage = await this.getUserHistoricalAverage(userDID);

    if (historicalAverage > 0) {
      // Check if current amount is anomalously large
      if (amount > historicalAverage * this.THRESHOLDS.ANOMALY_THRESHOLD_MULTIPLIER) {
        await this.logSecurityEvent('ANOMALOUS_AMOUNT', {
          userDID,
          amount,
          historicalAverage,
          multiplier: amount / historicalAverage,
        });
        // Don't block, but log for review
        this.logger.warn(
          `Anomalous transaction detected: ${userDID} attempting ${amount} SEMILLA (${amount / historicalAverage}x normal)`,
        );
      }
    }

    return { allowed: true };
  }

  /**
   * Get user activity statistics
   */
  private async getUserActivity(userDID: string): Promise<UserActivity> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [last1h, last24h, lastTx] = await Promise.all([
      this.prisma.bridgeTransaction.aggregate({
        where: {
          userDID,
          createdAt: { gte: oneHourAgo },
          status: { notIn: ['FAILED'] },
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.bridgeTransaction.aggregate({
        where: {
          userDID,
          createdAt: { gte: oneDayAgo },
          status: { notIn: ['FAILED'] },
        },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.bridgeTransaction.findFirst({
        where: { userDID },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    return {
      userId: userDID,
      lastBridgeTimestamp: lastTx?.createdAt || null,
      bridgeCountLast1h: last1h._count || 0,
      bridgeCountLast24h: last24h._count || 0,
      totalVolumeLast1h: last1h._sum.amount || 0,
      totalVolumeLast24h: last24h._sum.amount || 0,
    };
  }

  /**
   * Get user's historical average transaction size
   */
  private async getUserHistoricalAverage(userDID: string): Promise<number> {
    const result = await this.prisma.bridgeTransaction.aggregate({
      where: {
        userDID,
        status: { in: ['MINTED', 'UNLOCKED'] },
      },
      _avg: { amount: true },
    });

    return result._avg.amount || 0;
  }

  /**
   * Log security event for auditing
   */
  private async logSecurityEvent(
    eventType: string,
    details: any,
  ): Promise<void> {
    try {
      await this.prisma.security_events.create({
        data: {
          id: randomUUID(),
          type: eventType,
          severity: this.getSeverity(eventType),
          details,
          timestamp: new Date(),
        },
      });

      // If critical, notify immediately
      if (this.getSeverity(eventType) === 'CRITICAL') {
        await this.notifySecurityTeam(eventType, details);
      }
    } catch (error) {
      this.logger.error('Failed to log security event', error);
    }
  }

  /**
   * Get severity level for event type
   */
  private getSeverity(
    eventType: string,
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalEvents = [
      'DOUBLE_SPEND_ATTEMPT',
      'BLACKLISTED_DID_ATTEMPT',
      'CIRCUIT_BREAKER_TRIGGERED',
    ];
    const highEvents = [
      'CONCURRENT_TRANSACTION_ATTEMPT',
      'LARGE_TRANSACTION_ATTEMPT',
      'BLACKLISTED_ADDRESS_ATTEMPT',
    ];
    const mediumEvents = [
      'RATE_LIMIT_EXCEEDED_1H',
      'VOLUME_LIMIT_EXCEEDED_1H',
      'ANOMALOUS_AMOUNT',
    ];

    if (criticalEvents.includes(eventType)) return 'CRITICAL';
    if (highEvents.includes(eventType)) return 'HIGH';
    if (mediumEvents.includes(eventType)) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Notify security team of critical events
   */
  private async notifySecurityTeam(
    eventType: string,
    details: any,
  ): Promise<void> {
    this.logger.error(`SECURITY ALERT: ${eventType}`, details);

    // TODO: Integrate with notification system
    // - Email to security@truk.com
    // - Slack/Discord webhook
    // - PagerDuty alert
  }

  /**
   * Load blacklists from database
   */
  private async loadBlacklists(): Promise<void> {
    try {
      const blacklists = await this.prisma.blacklist.findMany({
        where: { active: true },
      });

      for (const item of blacklists) {
        if (item.type === 'DID') {
          this.blacklistedDIDs.add(item.value);
        } else if (item.type === 'ADDRESS') {
          this.blacklistedAddresses.add(item.value.toLowerCase());
        }
      }

      this.logger.log(
        `Loaded ${this.blacklistedDIDs.size} blacklisted DIDs and ${this.blacklistedAddresses.size} blacklisted addresses`,
      );
    } catch (error) {
      this.logger.error('Failed to load blacklists', error);
    }
  }

  /**
   * Add to blacklist
   */
  async addToBlacklist(
    type: 'DID' | 'ADDRESS',
    value: string,
    reason: string,
  ): Promise<void> {
    await this.prisma.blacklist.create({
      data: {
        id: randomUUID(),
        type,
        value: type === 'ADDRESS' ? value.toLowerCase() : value,
        reason,
        active: true,
        addedAt: new Date(),
      },
    });

    if (type === 'DID') {
      this.blacklistedDIDs.add(value);
    } else {
      this.blacklistedAddresses.add(value.toLowerCase());
    }

    this.logger.warn(`Added ${type} to blacklist: ${value} (${reason})`);
  }

  /**
   * Open circuit breaker (emergency stop)
   */
  async openCircuitBreaker(reason: string): Promise<void> {
    this.circuitBreakerOpen = true;
    this.circuitBreakerReason = reason;

    await this.logSecurityEvent('CIRCUIT_BREAKER_OPENED', { reason });

    this.logger.error(`CIRCUIT BREAKER OPENED: ${reason}`);
  }

  /**
   * Close circuit breaker
   */
  async closeCircuitBreaker(): Promise<void> {
    this.circuitBreakerOpen = false;
    this.circuitBreakerReason = null;

    await this.logSecurityEvent('CIRCUIT_BREAKER_CLOSED', {});

    this.logger.log('Circuit breaker closed - bridge operations resumed');
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus(): {
    open: boolean;
    reason: string | null;
  } {
    return {
      open: this.circuitBreakerOpen,
      reason: this.circuitBreakerReason,
    };
  }

  /**
   * Get recent security events
   */
  async getSecurityEvents(limit: number = 100) {
    const events = await this.prisma.security_events.findMany({
      take: limit,
      orderBy: { timestamp: 'desc' },
    });

    return events;
  }

  /**
   * Get security statistics
   */
  async getSecurityStats() {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const [
      totalEvents,
      eventsLast24h,
      eventsLast1h,
      criticalEvents,
      blacklistedDIDs,
      blacklistedAddresses,
      eventsBySeverity,
      eventsByType,
    ] = await Promise.all([
      this.prisma.security_events.count(),
      this.prisma.security_events.count({
        where: { timestamp: { gte: oneDayAgo } },
      }),
      this.prisma.security_events.count({
        where: { timestamp: { gte: oneHourAgo } },
      }),
      this.prisma.security_events.count({
        where: { severity: 'CRITICAL' },
      }),
      this.prisma.blacklist.count({
        where: { type: 'DID', active: true },
      }),
      this.prisma.blacklist.count({
        where: { type: 'ADDRESS', active: true },
      }),
      this.prisma.security_events.groupBy({
        by: ['severity'],
        _count: true,
        where: { timestamp: { gte: oneDayAgo } },
      }),
      this.prisma.security_events.groupBy({
        by: ['type'],
        _count: true,
        where: { timestamp: { gte: oneDayAgo } },
        orderBy: { _count: { type: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalEvents,
      eventsLast24h,
      eventsLast1h,
      criticalEvents,
      blacklistedDIDs,
      blacklistedAddresses,
      circuitBreaker: {
        open: this.circuitBreakerOpen,
        reason: this.circuitBreakerReason,
      },
      eventsBySeverity: eventsBySeverity.map((item) => ({
        severity: item.severity,
        count: item._count,
      })),
      topEventTypes: eventsByType.map((item) => ({
        type: item.type,
        count: item._count,
      })),
    };
  }

  /**
   * Get blacklist entries
   */
  async getBlacklist(type?: 'DID' | 'ADDRESS') {
    const where: any = { active: true };
    if (type) {
      where.type = type;
    }

    return this.prisma.blacklist.findMany({
      where,
      orderBy: { addedAt: 'desc' },
    });
  }

  /**
   * Remove from blacklist
   */
  async removeFromBlacklist(id: string, removedBy?: string) {
    const entry = await this.prisma.blacklist.update({
      where: { id },
      data: {
        active: false,
        removedAt: new Date(),
        removedBy,
      },
    });

    // Update in-memory sets
    if (entry.type === 'DID') {
      this.blacklistedDIDs.delete(entry.value);
    } else if (entry.type === 'ADDRESS') {
      this.blacklistedAddresses.delete(entry.value.toLowerCase());
    }

    this.logger.log(`Removed ${entry.type} from blacklist: ${entry.value}`);
  }
}
