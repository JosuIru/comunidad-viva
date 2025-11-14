import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Res,
  Header,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CommunityPacksService } from './community-packs.service';
import { MetricsCalculatorService } from './metrics-calculator.service';
import { BridgesService } from './bridges.service';
import { ExportService } from './export.service';
import { NetworkAnalyticsService } from './network-analytics.service';
import { CreateCommunityPackDto } from './dto/create-community-pack.dto';
import { UpdateCommunityPackDto } from './dto/update-community-pack.dto';
import { CompleteStepDto } from './dto/complete-step.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';
import { OrganizedCommunityType } from '@prisma/client';

@ApiTags('Community Packs')
@Controller('community-packs')
export class CommunityPacksController {
  constructor(
    private readonly communityPacksService: CommunityPacksService,
    private readonly metricsCalculatorService: MetricsCalculatorService,
    private readonly bridgesService: BridgesService,
    private readonly exportService: ExportService,
    private readonly networkAnalyticsService: NetworkAnalyticsService,
  ) {}

  @Get('types')
  @ApiOperation({ summary: 'Get all available pack types with configurations' })
  @ApiResponse({ status: 200, description: 'Returns available pack types' })
  async getAvailablePackTypes() {
    return this.communityPacksService.getAvailablePackTypes();
  }

  @Get('types/:packType')
  @ApiOperation({ summary: 'Get configuration for a specific pack type' })
  @ApiParam({ name: 'packType', enum: OrganizedCommunityType })
  @ApiResponse({ status: 200, description: 'Returns pack configuration' })
  @ApiResponse({ status: 404, description: 'Pack type not found' })
  async getPackConfig(@Param('packType') packType: OrganizedCommunityType) {
    return this.communityPacksService.getPackConfig(packType);
  }

  @Post('communities/:communityId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a community pack for a community' })
  @ApiParam({ name: 'communityId', description: 'Community ID' })
  @ApiResponse({ status: 201, description: 'Pack created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data or pack already exists' })
  @ApiResponse({ status: 403, description: 'User not authorized' })
  @ApiResponse({ status: 404, description: 'Community not found' })
  async createPack(
    @Param('communityId') communityId: string,
    @Body() dto: CreateCommunityPackDto,
    @Request() req,
  ) {
    return this.communityPacksService.createPack(communityId, dto, req.User.userId);
  }

  @Get('communities/:communityId')
  @ApiOperation({ summary: 'Get pack for a community' })
  @ApiParam({ name: 'communityId', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Returns community pack with steps and metrics' })
  @ApiResponse({ status: 404, description: 'Pack not found' })
  async getPack(@Param('communityId') communityId: string) {
    return this.communityPacksService.getPack(communityId);
  }

  @Patch('communities/:communityId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update pack configuration' })
  @ApiParam({ name: 'communityId', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Pack updated successfully' })
  @ApiResponse({ status: 403, description: 'User not authorized' })
  @ApiResponse({ status: 404, description: 'Pack not found' })
  async updatePack(
    @Param('communityId') communityId: string,
    @Body() dto: UpdateCommunityPackDto,
    @Request() req,
  ) {
    return this.communityPacksService.updatePack(communityId, dto, req.User.userId);
  }

  @Post('communities/:communityId/steps/complete')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a setup step as complete' })
  @ApiParam({ name: 'communityId', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Step completed successfully' })
  @ApiResponse({ status: 403, description: 'User not authorized' })
  @ApiResponse({ status: 404, description: 'Pack or step not found' })
  async completeStep(
    @Param('communityId') communityId: string,
    @Body() dto: CompleteStepDto,
    @Request() req,
  ) {
    return this.communityPacksService.completeStep(communityId, dto, req.User.userId);
  }

  @Get('communities/:communityId/metrics')
  @ApiOperation({ summary: 'Get all metrics for a community' })
  @ApiParam({ name: 'communityId', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Returns all metrics' })
  @ApiResponse({ status: 404, description: 'Pack not found' })
  async getMetrics(@Param('communityId') communityId: string) {
    return this.communityPacksService.getMetrics(communityId);
  }

  @Patch('communities/:communityId/metrics/:metricKey')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a metric value' })
  @ApiParam({ name: 'communityId', description: 'Community ID' })
  @ApiParam({ name: 'metricKey', description: 'Metric key (e.g., monthly_savings)' })
  @ApiResponse({ status: 200, description: 'Metric updated successfully' })
  @ApiResponse({ status: 403, description: 'User not authorized' })
  @ApiResponse({ status: 404, description: 'Pack or metric not found' })
  async updateMetric(
    @Param('communityId') communityId: string,
    @Param('metricKey') metricKey: string,
    @Body() dto: UpdateMetricDto,
    @Request() req,
  ) {
    return this.communityPacksService.updateMetric(communityId, metricKey, dto, req.User.userId);
  }

  @Post('communities/:communityId/metrics/recalculate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually recalculate all metrics for a community' })
  @ApiParam({ name: 'communityId', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Metrics recalculated successfully' })
  @ApiResponse({ status: 403, description: 'User not authorized' })
  @ApiResponse({ status: 404, description: 'Pack not found' })
  async recalculateMetrics(@Param('communityId') communityId: string, @Request() req) {
    // Check if user is community admin
    const community = await this.communityPacksService['prisma'].community.findUnique({
      where: { id: communityId },
      include: { governance: true },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    const user = await this.communityPacksService['prisma'].User.findUnique({
      where: { id: req.User.userId },
      select: { communityId: true, generosityScore: true },
    });

    const isFounder = community.governance?.founders.includes(req.User.userId) || false;
    const isMember = user?.communityId === communityId;
    const hasModerateRights = user && user.generosityScore >= 5;

    if (!isMember || (!isFounder && !hasModerateRights)) {
      throw new Error('Only community founders or high-reputation members can recalculate metrics');
    }

    await this.metricsCalculatorService.recalculateForCommunity(communityId);
    return { message: 'Metrics recalculated successfully' };
  }

  @Get('global-summary')
  @ApiOperation({ summary: 'Get global metrics summary for all communities (public dashboard)' })
  @ApiResponse({ status: 200, description: 'Returns aggregated metrics across all communities' })
  async getGlobalSummary() {
    return this.metricsCalculatorService.getGlobalMetricsSummary();
  }

  @Get('communities/:communityId/bridges')
  @ApiOperation({ summary: 'Get all bridges (connections) for a community' })
  @ApiParam({ name: 'communityId', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Returns all active bridges for the community' })
  @ApiResponse({ status: 404, description: 'Community not found' })
  async getBridges(@Param('communityId') communityId: string) {
    return this.bridgesService.getBridgesForCommunity(communityId);
  }

  @Get('network-stats')
  @ApiOperation({ summary: 'Get network statistics (public)' })
  @ApiResponse({ status: 200, description: 'Returns network-wide bridge statistics' })
  async getNetworkStats() {
    return this.bridgesService.getNetworkStats();
  }

  @Post('bridges/mentorship')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Propose a mentorship bridge between two communities' })
  @ApiResponse({ status: 201, description: 'Mentorship bridge proposed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  @ApiResponse({ status: 403, description: 'User not authorized' })
  async proposeMentorship(
    @Body() dto: { mentorCommunityId: string; menteeCommunityId: string; notes?: string },
    @Request() req,
  ) {
    return this.bridgesService.proposeMentorship(
      dto.mentorCommunityId,
      dto.menteeCommunityId,
      req.User.userId,
      dto.notes,
    );
  }

  @Patch('bridges/:bridgeId/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accept a pending mentorship bridge' })
  @ApiParam({ name: 'bridgeId', description: 'Bridge ID' })
  @ApiResponse({ status: 200, description: 'Bridge accepted successfully' })
  @ApiResponse({ status: 403, description: 'User not authorized' })
  @ApiResponse({ status: 404, description: 'Bridge not found' })
  async acceptBridge(@Param('bridgeId') bridgeId: string, @Request() req) {
    // TODO: Add authorization check (must be admin of target community)
    return this.bridgesService.acceptMentorship(bridgeId);
  }

  @Post('bridges/detect')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually trigger bridge detection (admin only)' })
  @ApiResponse({ status: 200, description: 'Bridge detection completed' })
  @ApiResponse({ status: 403, description: 'User not authorized' })
  async triggerBridgeDetection(@Request() req) {
    // TODO: Add admin-only check
    await this.bridgesService.detectAllBridges();
    return { message: 'Bridge detection completed' };
  }

  // ============================================================================
  // EXPORT ENDPOINTS
  // ============================================================================

  @Get('communities/:communityId/export/csv')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="metrics.csv"')
  @ApiOperation({ summary: 'Export community metrics to CSV' })
  @ApiParam({ name: 'communityId', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'CSV file generated' })
  @ApiResponse({ status: 404, description: 'Pack not found' })
  async exportMetricsCSV(@Param('communityId') communityId: string, @Res() res: Response) {
    try {
      const csv = await this.exportService.exportMetricsToCSV(communityId);
      res.send(csv);
    } catch (error) {
      res.status(404).json({ message: 'Pack not found' });
    }
  }

  @Get('communities/:communityId/export/json')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Export community metrics to JSON' })
  @ApiParam({ name: 'communityId', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'JSON data generated' })
  @ApiResponse({ status: 404, description: 'Pack not found' })
  async exportMetricsJSON(@Param('communityId') communityId: string) {
    try {
      return await this.exportService.exportMetricsToJSON(communityId);
    } catch (error) {
      throw new Error('Pack not found');
    }
  }

  @Get('communities/:communityId/export/report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Header('Content-Type', 'text/plain; charset=utf-8')
  @ApiOperation({ summary: 'Generate text report of community metrics' })
  @ApiParam({ name: 'communityId', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Text report generated' })
  @ApiResponse({ status: 404, description: 'Pack not found' })
  async exportMetricsReport(@Param('communityId') communityId: string, @Res() res: Response) {
    try {
      const report = await this.exportService.generateTextReport(communityId);
      res.send(report);
    } catch (error) {
      res.status(404).json({ message: 'Pack not found' });
    }
  }

  // ============================================================================
  // NETWORK ANALYTICS ENDPOINTS
  // ============================================================================

  @Get('network/recommendations/:communityId')
  @ApiOperation({ summary: 'Get connection recommendations for a community' })
  @ApiParam({ name: 'communityId', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Returns recommended connections' })
  @ApiResponse({ status: 404, description: 'Community not found' })
  async getConnectionRecommendations(@Param('communityId') communityId: string) {
    return this.networkAnalyticsService.getConnectionRecommendations(communityId, 5);
  }

  @Get('network/impact/:communityId')
  @ApiOperation({ summary: 'Get network impact metrics for a community' })
  @ApiParam({ name: 'communityId', description: 'Community ID' })
  @ApiResponse({ status: 200, description: 'Returns impact metrics' })
  @ApiResponse({ status: 404, description: 'Community not found' })
  async getCommunityImpact(@Param('communityId') communityId: string) {
    return this.networkAnalyticsService.calculateCommunityImpact(communityId);
  }

  @Get('network/clusters')
  @ApiOperation({ summary: 'Detect network clusters/ecosystems' })
  @ApiResponse({ status: 200, description: 'Returns detected clusters' })
  async getNetworkClusters() {
    return this.networkAnalyticsService.detectClusters();
  }

  @Get('network/leaderboard')
  @ApiOperation({ summary: 'Get network-wide community leaderboard' })
  @ApiResponse({ status: 200, description: 'Returns top communities by network impact' })
  async getNetworkLeaderboard() {
    return this.networkAnalyticsService.getNetworkLeaderboard(10);
  }
}
