import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get community-wide impact metrics
   */
  async getCommunityMetrics(params?: {
    startDate?: Date;
    endDate?: Date;
    communityId?: string;
  }) {
    const { startDate, endDate, communityId } = params || {};

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    // Get total savings from group buys
    const groupBuys = await this.prisma.groupBuy.findMany({
      where: {
        status: 'COMPLETED',
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
      include: {
        PriceBreak: true,
        GroupBuyParticipant: true,
      },
    });

    let totalSavings = 0;
    let totalParticipants = 0;

    for (const groupBuy of groupBuys) {
      const totalQuantity = groupBuy.GroupBuyParticipant.reduce(
        (sum, p) => sum + p.quantity,
        0,
      );

      // Calculate savings based on price breaks
      const lowestTier = groupBuy.PriceBreak.reduce((min, tier) =>
        tier.pricePerUnit < min.pricePerUnit ? tier : min
      );
      const highestTier = groupBuy.PriceBreak.reduce((max, tier) =>
        tier.pricePerUnit > max.pricePerUnit ? tier : max
      );

      const savingsPerUnit = highestTier.pricePerUnit - lowestTier.pricePerUnit;
      totalSavings += savingsPerUnit * totalQuantity;
      totalParticipants += groupBuy.GroupBuyParticipant.length;
    }

    // Get total hours exchanged in time bank
    const timeTransactions = await this.prisma.timeBankTransaction.findMany({
      where: {
        status: 'COMPLETED',
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
    });

    const totalHoursExchanged = timeTransactions.reduce(
      (sum, tx) => sum + tx.hours,
      0,
    );

    // Get event attendance stats
    const eventAttendances = await this.prisma.eventAttendee.findMany({
      where: {
        checkedInAt: { not: null },
        ...(Object.keys(dateFilter).length > 0 && { checkedInAt: dateFilter }),
      },
      include: {
        Event: true,
      },
    });

    // Calculate CO2 avoided
    // Assumptions:
    // - Each group buy participation saves 0.5 kg CO2 (reduced packaging/transport)
    // - Each hour of time bank exchange saves 2 kg CO2 (avoided car trips)
    // - Each event attendance saves 1 kg CO2 (local community engagement)
    const co2FromGroupBuys = totalParticipants * 0.5;
    const co2FromTimeBank = totalHoursExchanged * 2;
    const co2FromEvents = eventAttendances.length * 1;
    const totalCO2Avoided = co2FromGroupBuys + co2FromTimeBank + co2FromEvents;

    // Get active users count
    const activeUsers = await this.prisma.user.count();

    // Get total credits circulating
    const creditStats = await this.prisma.creditTransaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        amount: { gt: 0 },
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
    });

    const totalCreditsEarned = creditStats._sum.amount || 0;

    const spentCredits = await this.prisma.creditTransaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        amount: { lt: 0 },
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
    });

    const totalCreditsSpent = Math.abs(spentCredits._sum.amount || 0);

    return {
      savings: {
        total: totalSavings,
        currency: 'EUR',
      },
      hoursExchanged: {
        total: totalHoursExchanged,
        transactionCount: timeTransactions.length,
      },
      co2Avoided: {
        total: totalCO2Avoided,
        unit: 'kg',
        breakdown: {
          groupBuys: co2FromGroupBuys,
          timeBank: co2FromTimeBank,
          events: co2FromEvents,
        },
      },
      participants: {
        activeUsers,
        groupBuyParticipations: totalParticipants,
        eventAttendances: eventAttendances.length,
      },
      credits: {
        earned: totalCreditsEarned,
        spent: totalCreditsSpent,
        circulating: totalCreditsEarned - totalCreditsSpent,
      },
    };
  }

  /**
   * Get user-specific impact metrics
   */
  async getUserMetrics(userId: string, params?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const { startDate, endDate } = params || {};

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    // User's group buy participation
    const groupBuyParticipations = await this.prisma.groupBuyParticipant.findMany({
      where: {
        userId,
        ...(Object.keys(dateFilter).length > 0 && { joinedAt: dateFilter }),
      },
      include: {
        GroupBuy: {
          include: {
            PriceBreak: true,
          },
        },
      },
    });

    let userSavings = 0;
    for (const participation of groupBuyParticipations) {
      const priceBreaks = participation.GroupBuy.PriceBreak;
      const lowestPrice = Math.min(...priceBreaks.map(pb => pb.pricePerUnit));
      const highestPrice = Math.max(...priceBreaks.map(pb => pb.pricePerUnit));
      const savingsPerUnit = highestPrice - lowestPrice;
      userSavings += savingsPerUnit * participation.quantity;
    }

    // User's time bank transactions
    const timeTransactionsGiven = await this.prisma.timeBankTransaction.findMany({
      where: {
        providerId: userId,
        status: 'COMPLETED',
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
    });

    const timeTransactionsReceived = await this.prisma.timeBankTransaction.findMany({
      where: {
        requesterId: userId,
        status: 'COMPLETED',
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
    });

    const hoursGiven = timeTransactionsGiven.reduce((sum, tx) => sum + tx.hours, 0);
    const hoursReceived = timeTransactionsReceived.reduce((sum, tx) => sum + tx.hours, 0);

    // User's event attendance
    const eventAttendances = await this.prisma.eventAttendee.findMany({
      where: {
        userId,
        checkedInAt: { not: null },
        ...(Object.keys(dateFilter).length > 0 && { checkedInAt: dateFilter }),
      },
    });

    // Calculate user's CO2 impact
    const userCO2 =
      groupBuyParticipations.length * 0.5 +
      (hoursGiven + hoursReceived) * 2 +
      eventAttendances.length * 1;

    // User's credits
    const creditsEarned = await this.prisma.creditTransaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        amount: { gt: 0 },
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
    });

    const creditsSpent = await this.prisma.creditTransaction.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        amount: { lt: 0 },
        ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter }),
      },
    });

    return {
      savings: {
        total: userSavings,
        currency: 'EUR',
      },
      hoursExchanged: {
        given: hoursGiven,
        received: hoursReceived,
        total: hoursGiven + hoursReceived,
      },
      co2Avoided: {
        total: userCO2,
        unit: 'kg',
      },
      participation: {
        groupBuys: groupBuyParticipations.length,
        events: eventAttendances.length,
        timeTransactions: timeTransactionsGiven.length + timeTransactionsReceived.length,
      },
      credits: {
        earned: creditsEarned._sum.amount || 0,
        spent: Math.abs(creditsSpent._sum.amount || 0),
        balance: (creditsEarned._sum.amount || 0) + (creditsSpent._sum.amount || 0),
      },
    };
  }

  /**
   * Get time series data for charts
   */
  async getTimeSeriesMetrics(params?: {
    startDate?: Date;
    endDate?: Date;
    interval?: 'day' | 'week' | 'month';
  }) {
    const { startDate, endDate, interval = 'week' } = params || {};

    // Group credits by time interval
    const credits = await this.prisma.creditTransaction.findMany({
      where: {
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group time transactions by interval
    const timeTransactions = await this.prisma.timeBankTransaction.findMany({
      where: {
        status: 'COMPLETED',
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group group buys by interval
    const groupBuys = await this.prisma.groupBuy.findMany({
      where: {
        status: 'COMPLETED',
        ...(startDate && endDate && {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        }),
      },
      orderBy: { createdAt: 'asc' },
    });

    // Simple aggregation by month for now
    const monthlyData: Record<string, any> = {};

    credits.forEach(credit => {
      const month = credit.createdAt.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = {
          period: month,
          credits: 0,
          hours: 0,
          groupBuys: 0,
        };
      }
      monthlyData[month].credits += credit.amount;
    });

    timeTransactions.forEach(tx => {
      const month = tx.createdAt.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = {
          period: month,
          credits: 0,
          hours: 0,
          groupBuys: 0,
        };
      }
      monthlyData[month].hours += tx.hours;
    });

    groupBuys.forEach(gb => {
      const month = gb.createdAt.toISOString().substring(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = {
          period: month,
          credits: 0,
          hours: 0,
          groupBuys: 0,
        };
      }
      monthlyData[month].groupBuys += 1;
    });

    return Object.values(monthlyData).sort((a: any, b: any) =>
      a.period.localeCompare(b.period)
    );
  }

  /**
   * Export metrics as CSV
   */
  async exportMetricsCSV(params?: {
    startDate?: Date;
    endDate?: Date;
    communityId?: string;
  }) {
    const metrics = await this.getCommunityMetrics(params);

    const csv = [
      'Metric,Value,Unit',
      `Total Savings,${metrics.savings.total},${metrics.savings.currency}`,
      `Hours Exchanged,${metrics.hoursExchanged.total},hours`,
      `CO2 Avoided,${metrics.co2Avoided.total},${metrics.co2Avoided.unit}`,
      `Active Users,${metrics.participants.activeUsers},users`,
      `Credits Earned,${metrics.credits.earned},credits`,
      `Credits Spent,${metrics.credits.spent},credits`,
      `Credits Circulating,${metrics.credits.circulating},credits`,
    ].join('\n');

    return csv;
  }

  /**
   * Legacy method for backward compatibility
   */
  async getUserStats(userId: string) {
    return this.getUserMetrics(userId);
  }
}
