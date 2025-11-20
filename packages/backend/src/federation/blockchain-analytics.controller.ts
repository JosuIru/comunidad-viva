import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { BlockchainAnalyticsService } from './blockchain-analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

/**
 * Blockchain Analytics Controller
 *
 * Provides API endpoints for blockchain bridge metrics and analytics
 */
@Controller('blockchain/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BlockchainAnalyticsController {
  constructor(private analyticsService: BlockchainAnalyticsService) {}

  /**
   * Get bridge metrics
   * GET /blockchain/analytics/metrics?chain=polygon&timeframe=week
   */
  @Get('metrics')
  @Roles('admin', 'moderator')
  async getMetrics(
    @Query('chain') chain?: string,
    @Query('timeframe') timeframe?: 'day' | 'week' | 'month' | 'all',
  ) {
    return this.analyticsService.getBridgeMetrics(chain, timeframe || 'day');
  }

  /**
   * Get daily volume trend
   * GET /blockchain/analytics/volume-trend?days=7&chain=polygon
   */
  @Get('volume-trend')
  @Roles('admin', 'moderator')
  async getVolumeTrend(@Query('days') days?: string, @Query('chain') chain?: string) {
    const numDays = days ? parseInt(days) : 7;
    return this.analyticsService.getDailyVolumeTrend(numDays, chain);
  }

  /**
   * Get top users by volume
   * GET /blockchain/analytics/top-users?limit=10&timeframe=week
   */
  @Get('top-users')
  @Roles('admin', 'moderator')
  async getTopUsers(
    @Query('limit') limit?: string,
    @Query('timeframe') timeframe?: 'day' | 'week' | 'month' | 'all',
  ) {
    const numLimit = limit ? parseInt(limit) : 10;
    return this.analyticsService.getTopUsers(numLimit, timeframe || 'week');
  }

  /**
   * Detect suspicious activity
   * GET /blockchain/analytics/suspicious
   */
  @Get('suspicious')
  @Roles('admin')
  async detectSuspiciousActivity() {
    return this.analyticsService.detectSuspiciousActivity();
  }

  /**
   * Get failed transactions
   * GET /blockchain/analytics/failed?limit=20
   */
  @Get('failed')
  @Roles('admin', 'moderator')
  async getFailedTransactions(@Query('limit') limit?: string) {
    const numLimit = limit ? parseInt(limit) : 20;
    return this.analyticsService.getFailedTransactions(numLimit);
  }

  /**
   * Get pending transactions
   * GET /blockchain/analytics/pending
   */
  @Get('pending')
  @Roles('admin', 'moderator')
  async getPendingTransactions() {
    return this.analyticsService.getPendingTransactions();
  }

  /**
   * Get gas cost analytics
   * GET /blockchain/analytics/gas-costs?chain=polygon
   */
  @Get('gas-costs')
  @Roles('admin', 'moderator')
  async getGasCostAnalytics(@Query('chain') chain?: string) {
    return this.analyticsService.getGasCostAnalytics(chain);
  }
}
