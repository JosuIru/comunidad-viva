import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIntegrationDto, IntegrationPlatform } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { MessageFormatterService } from './message-formatter.service';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private prisma: PrismaService,
    private messageFormatter: MessageFormatterService,
    @InjectQueue('integrations') private integrationsQueue: Queue,
  ) {}

  /**
   * Create a new integration
   */
  async create(createIntegrationDto: CreateIntegrationDto) {
    // Validate bot token
    await this.validateBotToken(
      createIntegrationDto.platform,
      createIntegrationDto.botToken,
    );

    const integration = await this.prisma.communityIntegration.create({
      data: {
        communityId: createIntegrationDto.communityId,
        platform: createIntegrationDto.platform,
        channelId: createIntegrationDto.channelId,
        channelName: createIntegrationDto.channelName,
        botToken: createIntegrationDto.botToken,
        autoPublish: createIntegrationDto.autoPublish ?? false,
        categories: createIntegrationDto.categories ?? [],
        publishOffers: createIntegrationDto.publishOffers ?? true,
        publishEvents: createIntegrationDto.publishEvents ?? true,
        publishNeeds: createIntegrationDto.publishNeeds ?? true,
        enabled: true,
      },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    this.logger.log(`Integration created: ${integration.id} for community ${integration.communityId}`);

    return integration;
  }

  /**
   * Find all integrations for a community
   */
  async findByCommunity(communityId: string) {
    return this.prisma.communityIntegration.findMany({
      where: {
        communityId,
      },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Find integration by ID
   */
  async findOne(id: string) {
    const integration = await this.prisma.communityIntegration.findUnique({
      where: { id },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!integration) {
      throw new NotFoundException(`Integration with ID ${id} not found`);
    }

    return integration;
  }

  /**
   * Update an integration
   */
  async update(id: string, updateIntegrationDto: UpdateIntegrationDto) {
    await this.findOne(id); // Check if exists

    // Validate bot token if it's being updated
    if (updateIntegrationDto.botToken && updateIntegrationDto.platform) {
      await this.validateBotToken(
        updateIntegrationDto.platform,
        updateIntegrationDto.botToken,
      );
    }

    const integration = await this.prisma.communityIntegration.update({
      where: { id },
      data: {
        ...(updateIntegrationDto.platform && { platform: updateIntegrationDto.platform }),
        ...(updateIntegrationDto.channelId && { channelId: updateIntegrationDto.channelId }),
        ...(updateIntegrationDto.channelName !== undefined && { channelName: updateIntegrationDto.channelName }),
        ...(updateIntegrationDto.botToken && { botToken: updateIntegrationDto.botToken }),
        ...(updateIntegrationDto.autoPublish !== undefined && { autoPublish: updateIntegrationDto.autoPublish }),
        ...(updateIntegrationDto.categories && { categories: updateIntegrationDto.categories }),
        ...(updateIntegrationDto.publishOffers !== undefined && { publishOffers: updateIntegrationDto.publishOffers }),
        ...(updateIntegrationDto.publishEvents !== undefined && { publishEvents: updateIntegrationDto.publishEvents }),
        ...(updateIntegrationDto.publishNeeds !== undefined && { publishNeeds: updateIntegrationDto.publishNeeds }),
      },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    this.logger.log(`Integration updated: ${id}`);

    return integration;
  }

  /**
   * Delete an integration
   */
  async delete(id: string) {
    await this.findOne(id); // Check if exists

    await this.prisma.communityIntegration.delete({
      where: { id },
    });

    this.logger.log(`Integration deleted: ${id}`);

    return { message: 'Integration deleted successfully' };
  }

  /**
   * Toggle integration enabled status
   */
  async toggle(id: string) {
    const integration = await this.findOne(id);

    const updated = await this.prisma.communityIntegration.update({
      where: { id },
      data: {
        enabled: !integration.enabled,
      },
      include: {
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    this.logger.log(`Integration ${id} ${updated.enabled ? 'enabled' : 'disabled'}`);

    return updated;
  }

  /**
   * Test an integration by sending a test message
   */
  async test(id: string) {
    const integration = await this.findOne(id);

    if (!integration.enabled) {
      throw new BadRequestException('Integration is disabled');
    }

    const testMessage = `🧪 Mensaje de prueba\n\nEsta es una prueba de integración para la comunidad ${integration.community.name}.\n\nSi recibes este mensaje, la integración está funcionando correctamente.`;

    try {
      await this.sendMessage(integration, testMessage);
      this.logger.log(`Test message sent for integration ${id}`);
      return { message: 'Test message sent successfully' };
    } catch (error) {
      this.logger.error(`Failed to send test message for integration ${id}`, error);
      throw new BadRequestException(`Failed to send test message: ${error.message}`);
    }
  }

  /**
   * Publish content to integrations
   */
  async publishContent(
    contentType: 'offer' | 'event' | 'need',
    contentId: string,
    integrations?: any[],
  ) {
    // Fetch content with relations to validate it exists
    let content;
    let communityId;

    switch (contentType) {
      case 'offer':
        content = await this.prisma.offer.findUnique({
          where: { id: contentId },
          include: {
            community: { select: { id: true } },
          },
        });
        communityId = content?.communityId;
        break;
      case 'event':
        content = await this.prisma.event.findUnique({
          where: { id: contentId },
          include: {
            community: { select: { id: true } },
          },
        });
        communityId = content?.communityId;
        break;
      case 'need':
        content = await this.prisma.mutualAidNeed.findUnique({
          where: { id: contentId },
          include: {
            community: { select: { id: true } },
          },
        });
        communityId = content?.communityId;
        break;
    }

    if (!content) {
      throw new NotFoundException(`${contentType} with ID ${contentId} not found`);
    }

    // Get active integrations for the community
    if (!integrations) {
      integrations = await this.prisma.communityIntegration.findMany({
        where: {
          communityId,
          enabled: true,
          ...(contentType === 'offer' && { publishOffers: true }),
          ...(contentType === 'event' && { publishEvents: true }),
          ...(contentType === 'need' && { publishNeeds: true }),
        },
      });
    }

    // Generate deep link
    const deepLink = this.generateDeepLink(contentType, contentId, 'integration');

    // Add jobs to queue for each integration
    const jobPromises = integrations.map(async (integration) => {
      try {
        const job = await this.integrationsQueue.add(
          'publish-content',
          {
            contentType,
            contentId,
            integration: {
              id: integration.id,
              platform: integration.platform,
              channelId: integration.channelId,
              botToken: integration.botToken,
            },
            deepLink,
          },
          {
            // Job options
            priority: this.getJobPriority(contentType),
            attempts: 3, // Retry up to 3 times
            backoff: {
              type: 'exponential',
              delay: 2000, // Start with 2 seconds, then 4s, 8s
            },
            removeOnComplete: true, // Clean up completed jobs
            removeOnFail: false, // Keep failed jobs for debugging
          },
        );

        this.logger.log(
          `Queued job ${job.id}: Publishing ${contentType} ${contentId} to ${integration.platform} (integration ${integration.id})`,
        );

        return job;
      } catch (error) {
        this.logger.error(
          `Failed to queue job for ${contentType} ${contentId} to integration ${integration.id}`,
          error,
        );
        return null;
      }
    });

    const jobs = await Promise.all(jobPromises);
    const successfulJobs = jobs.filter((job) => job !== null);

    this.logger.log(
      `Queued ${successfulJobs.length}/${integrations.length} jobs for ${contentType} ${contentId}`,
    );

    return {
      message: `Content queued for publishing to ${successfulJobs.length} integration(s)`,
      integrationsCount: successfulJobs.length,
      totalIntegrations: integrations.length,
      queuedJobs: successfulJobs.map((job) => job.id),
    };
  }

  /**
   * Get job priority based on content type
   * Higher priority = processed first (1 is highest, 10 is lowest)
   */
  private getJobPriority(contentType: string): number {
    switch (contentType) {
      case 'need': // Needs are most urgent
        return 1;
      case 'event': // Events are time-sensitive
        return 2;
      case 'offer': // Offers are less urgent
        return 3;
      default:
        return 5;
    }
  }

  /**
   * Validate bot token for a platform
   */
  private async validateBotToken(
    platform: IntegrationPlatform,
    botToken: string,
  ): Promise<boolean> {
    // Basic validation - check token format
    if (!botToken || botToken.trim().length === 0) {
      throw new BadRequestException('Bot token is required');
    }

    // Platform-specific validation
    switch (platform) {
      case IntegrationPlatform.TELEGRAM:
        // Telegram bot tokens follow format: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
        if (!/^\d+:[A-Za-z0-9_-]+$/.test(botToken)) {
          throw new BadRequestException('Invalid Telegram bot token format');
        }
        break;
      case IntegrationPlatform.DISCORD:
        // Discord bot tokens are longer alphanumeric strings
        if (botToken.length < 50) {
          throw new BadRequestException('Invalid Discord bot token format');
        }
        break;
      case IntegrationPlatform.SLACK:
        // Slack tokens start with xoxb- or xoxp-
        if (!/^xox[bp]-/.test(botToken)) {
          throw new BadRequestException('Invalid Slack bot token format');
        }
        break;
      // Add more platform-specific validations as needed
    }

    // In production, you would make an API call to verify the token
    // For now, we just validate the format

    return true;
  }

  /**
   * Generate deep link for content
   */
  private generateDeepLink(
    contentType: string,
    contentId: string,
    source: string,
  ): string {
    const baseUrl = process.env.APP_URL || 'https://app.truk.es';
    return `${baseUrl}/${contentType}s/${contentId}?source=${source}`;
  }

  /**
   * Send message to a platform
   * In production, this would integrate with actual messaging APIs
   */
  private async sendMessage(integration: any, message: string): Promise<void> {
    // This is a placeholder for the actual message sending logic
    // In production, you would:
    // 1. Queue the message using BullMQ
    // 2. Process the queue and send via platform-specific APIs

    this.logger.debug(
      `Sending message to ${integration.platform} channel ${integration.channelId}`,
    );
    this.logger.debug(`Message: ${message.substring(0, 100)}...`);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    // In production, implement actual API calls for each platform:
    // - Telegram: POST to https://api.telegram.org/bot{token}/sendMessage
    // - Discord: POST to webhook URL or Discord API
    // - Slack: POST to Slack Web API
    // - WhatsApp Business: Use WhatsApp Business API
    // - Signal: Use Signal API

    return;
  }
}
