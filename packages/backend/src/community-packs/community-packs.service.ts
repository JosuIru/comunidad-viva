import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommunityPackDto } from './dto/create-community-pack.dto';
import { UpdateCommunityPackDto } from './dto/update-community-pack.dto';
import { CompleteStepDto } from './dto/complete-step.dto';
import { UpdateMetricDto } from './dto/update-metric.dto';
import { OrganizedCommunityType } from '@prisma/client';

// Pack configurations - mirrors frontend config
const PACK_CONFIGS = {
  CONSUMER_GROUP: {
    setupSteps: ['basic_info', 'invite_members', 'configure_orders', 'set_pickup_point', 'first_order'],
    requiredSteps: ['basic_info', 'invite_members', 'configure_orders', 'set_pickup_point'],
    defaultFeatures: ['orders', 'pickup', 'producers', 'cost_calculator', 'quality_ratings', 'statistics'],
    defaultMetrics: ['monthly_savings', 'active_members', 'orders_completed', 'local_producers', 'kg_local_food', 'co2_avoided'],
  },
  HOUSING_COOP: {
    setupSteps: ['basic_info', 'add_units', 'common_spaces', 'tool_bank', 'governance'],
    requiredSteps: ['basic_info', 'add_units', 'common_spaces', 'governance'],
    defaultFeatures: ['tool_bank', 'space_booking', 'expenses', 'voting', 'bulletin', 'timebank', 'maintenance'],
    defaultMetrics: ['tool_uses', 'savings_per_unit', 'space_bookings', 'participation_rate'],
  },
  COMMUNITY_BAR: {
    setupSteps: ['basic_info', 'setup_memberships', 'local_suppliers', 'first_event'],
    requiredSteps: ['basic_info'],
    defaultFeatures: ['events', 'local_suppliers', 'local_currency', 'memberships', 'ticketing', 'dashboard'],
    defaultMetrics: ['events_hosted', 'active_members', 'local_currency', 'local_suppliers'],
  },
};

@Injectable()
export class CommunityPacksService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new community pack for a community
   */
  async createPack(communityId: string, dto: CreateCommunityPackDto, userId: string) {
    // Check if community exists and user has permission
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
      include: { governance: true },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if user is founder or has high reputation
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { communityId: true, generosityScore: true },
    });

    const isFounder = community.governance?.founders.includes(userId) || false;
    const isMember = user?.communityId === communityId;
    const hasModerateRights = user && user.generosityScore >= 5;

    if (!isMember || (!isFounder && !hasModerateRights)) {
      throw new ForbiddenException('Only community founders or high-reputation members can create packs');
    }

    // Check if pack already exists
    const existingPack = await this.prisma.communityPack.findUnique({
      where: { communityId },
    });

    if (existingPack) {
      throw new BadRequestException('Community already has a pack');
    }

    // Get pack configuration
    const packConfig = PACK_CONFIGS[dto.packType];
    if (!packConfig) {
      throw new BadRequestException('Invalid pack type');
    }

    // Create pack with defaults
    const pack = await this.prisma.communityPack.create({
      data: {
        communityId,
        packType: dto.packType,
        enabledFeatures: dto.enabledFeatures || packConfig.defaultFeatures,
        trackingMetrics: dto.trackingMetrics || packConfig.defaultMetrics,
        customConfig: dto.customConfig || {},
        goals: dto.goals || {},
      },
      include: {
        setupSteps: true,
        metrics: true,
      },
    });

    // Initialize setup steps
    for (const stepKey of packConfig.setupSteps) {
      await this.prisma.communitySetupStep.create({
        data: {
          packId: pack.id,
          stepKey,
          completed: false,
        },
      });
    }

    // Initialize metrics with 0 values
    for (const metricKey of packConfig.defaultMetrics) {
      await this.prisma.communityMetric.create({
        data: {
          packId: pack.id,
          metricKey,
          value: 0,
        },
      });
    }

    return this.getPack(communityId);
  }

  /**
   * Get pack for a community
   */
  async getPack(communityId: string) {
    const pack = await this.prisma.communityPack.findUnique({
      where: { communityId },
      include: {
        setupSteps: {
          orderBy: { createdAt: 'asc' },
        },
        metrics: {
          orderBy: { lastUpdated: 'desc' },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!pack) {
      throw new NotFoundException('Community pack not found');
    }

    return pack;
  }

  /**
   * Update pack configuration
   */
  async updatePack(communityId: string, dto: UpdateCommunityPackDto, userId: string) {
    // Check permissions
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
      include: { governance: true },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { communityId: true, generosityScore: true },
    });

    const isFounder = community.governance?.founders.includes(userId) || false;
    const isMember = user?.communityId === communityId;
    const hasModerateRights = user && user.generosityScore >= 5;

    if (!isMember || (!isFounder && !hasModerateRights)) {
      throw new ForbiddenException('Only community founders or high-reputation members can update packs');
    }

    const pack = await this.prisma.communityPack.update({
      where: { communityId },
      data: {
        ...dto,
        updatedAt: new Date(),
      },
      include: {
        setupSteps: true,
        metrics: true,
      },
    });

    return pack;
  }

  /**
   * Mark a setup step as complete
   */
  async completeStep(communityId: string, dto: CompleteStepDto, userId: string) {
    // Check permissions
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
      include: { governance: true },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { communityId: true, generosityScore: true },
    });

    const isFounder = community.governance?.founders.includes(userId) || false;
    const isMember = user?.communityId === communityId;
    const hasModerateRights = user && user.generosityScore >= 5;

    if (!isMember || (!isFounder && !hasModerateRights)) {
      throw new ForbiddenException('Only community founders or high-reputation members can complete steps');
    }

    const pack = await this.prisma.communityPack.findUnique({
      where: { communityId },
      include: { setupSteps: true },
    });

    if (!pack) {
      throw new NotFoundException('Community pack not found');
    }

    // Find and update the step
    const step = pack.setupSteps.find((s) => s.stepKey === dto.stepKey);
    if (!step) {
      throw new NotFoundException('Setup step not found');
    }

    await this.prisma.communitySetupStep.update({
      where: { id: step.id },
      data: {
        completed: true,
        completedAt: new Date(),
        stepData: dto.stepData || {},
      },
    });

    // Calculate progress
    const packConfig = PACK_CONFIGS[pack.packType];
    const completedSteps = await this.prisma.communitySetupStep.count({
      where: { packId: pack.id, completed: true },
    });
    const totalSteps = packConfig.setupSteps.length;
    const progress = Math.round((completedSteps / totalSteps) * 100);

    // Check if all required steps are complete
    const requiredStepsCompleted = await this.prisma.communitySetupStep.count({
      where: {
        packId: pack.id,
        stepKey: { in: packConfig.requiredSteps },
        completed: true,
      },
    });
    const setupCompleted = requiredStepsCompleted === packConfig.requiredSteps.length;

    // Update pack progress
    await this.prisma.communityPack.update({
      where: { id: pack.id },
      data: {
        setupProgress: progress,
        setupCompleted,
        updatedAt: new Date(),
      },
    });

    // Merge step data into custom config
    if (dto.stepData) {
      await this.prisma.communityPack.update({
        where: { id: pack.id },
        data: {
          customConfig: {
            ...(pack.customConfig as object),
            [dto.stepKey]: dto.stepData,
          },
        },
      });
    }

    return this.getPack(communityId);
  }

  /**
   * Update a metric value
   */
  async updateMetric(communityId: string, metricKey: string, dto: UpdateMetricDto, userId: string) {
    const pack = await this.prisma.communityPack.findUnique({
      where: { communityId },
      include: { metrics: true, community: { include: { governance: true } } },
    });

    if (!pack) {
      throw new NotFoundException('Community pack not found');
    }

    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { communityId: true, generosityScore: true },
    });

    const isFounder = pack.community.governance?.founders.includes(userId) || false;
    const isMember = user?.communityId === communityId;
    const hasModerateRights = user && user.generosityScore >= 5;

    if (!isMember || (!isFounder && !hasModerateRights)) {
      throw new ForbiddenException('Only community founders or high-reputation members can update metrics');
    }

    const metric = pack.metrics.find((m) => m.metricKey === metricKey);
    if (!metric) {
      throw new NotFoundException('Metric not found');
    }

    // Store previous value in history
    const history = Array.isArray(metric.history) ? metric.history : [];
    history.push({
      date: new Date().toISOString(),
      value: metric.currentValue,
      note: dto.note,
    });

    const updatedMetric = await this.prisma.communityMetric.update({
      where: { id: metric.id },
      data: {
        currentValue: dto.value,
        history: history,
      },
    });

    return updatedMetric;
  }

  /**
   * Get all metrics for a community
   */
  async getMetrics(communityId: string) {
    const pack = await this.prisma.communityPack.findUnique({
      where: { communityId },
      include: {
        metrics: {
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!pack) {
      throw new NotFoundException('Community pack not found');
    }

    return pack.metrics;
  }

  /**
   * Get available pack types with configurations
   */
  async getAvailablePackTypes() {
    return Object.keys(PACK_CONFIGS).map((type) => ({
      type,
      config: PACK_CONFIGS[type as OrganizedCommunityType],
    }));
  }

  /**
   * Get pack configuration for a specific type
   */
  async getPackConfig(packType: OrganizedCommunityType) {
    const config = PACK_CONFIGS[packType];
    if (!config) {
      throw new NotFoundException('Pack type not found');
    }
    return { type: packType, config };
  }
}
