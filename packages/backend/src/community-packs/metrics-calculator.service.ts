import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrganizedCommunityType } from '@prisma/client';
import { Cron, CronExpression } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';

/**
 * Service to automatically calculate and update community pack metrics
 * based on real activity data
 */
@Injectable()
export class MetricsCalculatorService {
  private readonly logger = new Logger(MetricsCalculatorService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Run metrics calculation for all communities daily at 3 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async calculateAllMetrics() {
    this.logger.log('Starting daily metrics calculation for all communities');

    try {
      const packs = await this.prisma.communityPack.findMany({
        include: {
          Community: {
            include: {
              User: true,
              Offer: true,
              Event: true,
            },
          },
        },
      });

      for (const pack of packs) {
        try {
          await this.calculateMetricsForPack(pack.id, pack.packType);
        } catch (error) {
          this.logger.error(`Failed to calculate metrics for pack ${pack.id}:`, error);
        }
      }

      this.logger.log(`Completed metrics calculation for ${packs.length} communities`);
    } catch (error) {
      this.logger.error('Failed to calculate metrics:', error);
    }
  }

  /**
   * Calculate metrics for a specific pack
   */
  async calculateMetricsForPack(packId: string, packType: OrganizedCommunityType) {
    this.logger.debug(`Calculating metrics for pack ${packId} (${packType})`);

    switch (packType) {
      case 'CONSUMER_GROUP':
        await this.calculateConsumerGroupMetrics(packId);
        break;
      case 'HOUSING_COOP':
        await this.calculateHousingCoopMetrics(packId);
        break;
      case 'COMMUNITY_BAR':
        await this.calculateCommunityBarMetrics(packId);
        break;
      default:
        this.logger.warn(`No metrics calculator for pack type ${packType}`);
    }
  }

  /**
   * Calculate metrics for Consumer Groups
   */
  private async calculateConsumerGroupMetrics(packId: string) {
    const pack = await this.prisma.communityPack.findUnique({
      where: { id: packId },
      include: {
        Community: {
          include: {
            User: true,
            Offer: { where: { status: 'ACTIVE' } },
            // In real implementation, you'd have Orders/Transactions
          },
        },
      },
    });

    if (!pack) return;

    // Active members
    await this.updateMetric(packId, 'active_members', pack.Community.User.length);

    // Local producers (count offers from different users)
    const uniqueProducers = new Set(pack.Community.Offer.map((o) => o.userId));
    await this.updateMetric(packId, 'local_producers', uniqueProducers.size);

    // TODO: These would come from actual transactions/orders
    // For now, we'll keep them as manually updated
    // - monthly_savings
    // - orders_completed
    // - kg_local_food
    // - co2_avoided
  }

  /**
   * Calculate metrics for Housing Cooperatives
   */
  private async calculateHousingCoopMetrics(packId: string) {
    const pack = await this.prisma.communityPack.findUnique({
      where: { id: packId },
      include: {
        Community: {
          include: {
            User: true,
            Event: true, // Events could represent space bookings
          },
        },
      },
    });

    if (!pack) return;

    // Space bookings (using events as proxy)
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const spaceBookings = await this.prisma.event.count({
      where: {
        communityId: pack.communityId,
        startsAt: { gte: lastMonth },
      },
    });
    await this.updateMetric(packId, 'space_bookings', spaceBookings);

    // Participation rate (% of members who have been active in last 30 days)
    const totalMembers = pack.Community.User.length;
    if (totalMembers > 0) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Count members who created offers, joined events, or posted in last 30 days
      const activeMemberIds = new Set<string>();

      // Members who created offers
      const offersCreators = await this.prisma.offer.findMany({
        where: {
          communityId: pack.communityId,
          createdAt: { gte: thirtyDaysAgo },
        },
        select: { userId: true },
        distinct: ['userId'],
      });
      offersCreators.forEach((o) => activeMemberIds.add(o.userId));

      // Members who joined events
      const eventParticipants = await this.prisma.eventAttendee.findMany({
        where: {
          Event: { communityId: pack.communityId },
          registeredAt: { gte: thirtyDaysAgo },
        },
        select: { userId: true },
        distinct: ['userId'],
      });
      eventParticipants.forEach((p) => activeMemberIds.add(p.userId));

      const participationRate = Math.round((activeMemberIds.size / totalMembers) * 100);
      await this.updateMetric(packId, 'participation_rate', participationRate);
    }

    // TODO: tool_uses, savings_per_unit would come from specific tool/resource tracking
  }

  /**
   * Calculate metrics for Community Bars
   */
  private async calculateCommunityBarMetrics(packId: string) {
    const pack = await this.prisma.communityPack.findUnique({
      where: { id: packId },
      include: {
        Community: {
          include: {
            User: true,
            Event: true,
            Offer: true,
          },
        },
      },
    });

    if (!pack) return;

    // Events hosted (total events)
    const eventsHosted = await this.prisma.event.count({
      where: { communityId: pack.communityId },
    });
    await this.updateMetric(packId, 'events_hosted', eventsHosted);

    // Active members (socios)
    await this.updateMetric(packId, 'active_members', pack.Community.User.length);

    // Local suppliers (unique offer creators)
    const uniqueSuppliers = new Set(pack.Community.Offer.map((o) => o.userId));
    await this.updateMetric(packId, 'local_suppliers', uniqueSuppliers.size);

    // TODO: local_currency would come from credit transactions
  }

  /**
   * Update a specific metric value
   */
  private async updateMetric(packId: string, metricKey: string, newValue: number) {
    try {
      // Find existing metric
      const existingMetric = await this.prisma.communityMetric.findFirst({
        where: { packId, metricKey },
      });

      if (existingMetric) {
        // Only update if value changed
        if (existingMetric.currentValue !== newValue) {
          // Update history with previous value
          const history = Array.isArray(existingMetric.history)
            ? existingMetric.history
            : [];
          history.push({
            date: new Date().toISOString(),
            value: existingMetric.currentValue
          });

          await this.prisma.communityMetric.update({
            where: { id: existingMetric.id },
            data: {
              currentValue: newValue,
              history: history,
            },
          });
          this.logger.debug(
            `Updated metric ${metricKey}: ${existingMetric.currentValue} → ${newValue}`,
          );
        }
      } else {
        // Create metric if doesn't exist
        await this.prisma.communityMetric.create({
          data: {
            id: uuidv4(),
            packId,
            metricKey,
            metricName: metricKey, // Use metricKey as default name
            currentValue: newValue,
            unit: '',
            updatedAt: new Date(),
          },
        });
        this.logger.debug(`Created metric ${metricKey}: ${newValue}`);
      }
    } catch (error) {
      this.logger.error(`Failed to update metric ${metricKey}:`, error);
    }
  }

  /**
   * Force recalculation for a specific community (can be called on-demand)
   */
  async recalculateForCommunity(communityId: string) {
    const pack = await this.prisma.communityPack.findUnique({
      where: { communityId },
    });

    if (!pack) {
      throw new Error('Community pack not found');
    }

    await this.calculateMetricsForPack(pack.id, pack.packType);
    this.logger.log(`Manually recalculated metrics for community ${communityId}`);
  }

  /**
   * Get metrics summary for all communities (for public dashboard)
   */
  async getGlobalMetricsSummary() {
    const summary = {
      totalCommunities: 0,
      totalMembers: 0,
      totalEvents: 0,
      byType: {} as Record<string, any>,
    };

    const packs = await this.prisma.communityPack.findMany({
      include: {
        Community: {
          include: {
            User: true,
            Event: true,
          },
        },
        CommunityMetric: true,
      },
    });

    summary.totalCommunities = packs.length;

    for (const pack of packs) {
      summary.totalMembers += pack.Community.User.length;
      summary.totalEvents += pack.Community.Event.length;

      if (!summary.byType[pack.packType]) {
        summary.byType[pack.packType] = {
          count: 0,
          totalMembers: 0,
          metrics: {} as Record<string, number>,
        };
      }

      summary.byType[pack.packType].count++;
      summary.byType[pack.packType].totalMembers += pack.Community.User.length;

      // Aggregate metrics
      for (const metric of pack.CommunityMetric) {
        if (!summary.byType[pack.packType].metrics[metric.metricKey]) {
          summary.byType[pack.packType].metrics[metric.metricKey] = 0;
        }
        summary.byType[pack.packType].metrics[metric.metricKey] += metric.currentValue;
      }
    }

    return summary;
  }
}
