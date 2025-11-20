import { Processor, Process, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { MessageFormatterService } from './message-formatter.service';
import { TelegramService } from './telegram.service';
import { WhatsAppService } from './whatsapp.service';
import { IntegrationPlatform } from './dto/create-integration.dto';

interface PublishContentJobData {
  contentType: 'offer' | 'event' | 'need';
  contentId: string;
  integration: {
    id: string;
    platform: IntegrationPlatform;
    channelId: string;
    botToken: string;
  };
  deepLink: string;
}

@Processor('integrations')
export class IntegrationsProcessor {
  private readonly logger = new Logger(IntegrationsProcessor.name);

  constructor(
    private prisma: PrismaService,
    private messageFormatterService: MessageFormatterService,
    private telegramService: TelegramService,
    private whatsappService: WhatsAppService,
  ) {}

  @Process('publish-content')
  async handlePublishContent(job: Job<PublishContentJobData>) {
    const { contentType, contentId, integration, deepLink } = job.data;

    this.logger.log(
      `Processing publish job ${job.id} for ${contentType} ${contentId} to ${integration.platform}`,
    );

    try {
      // Fetch the actual content from database
      const content = await this.fetchContent(contentType, contentId);

      if (!content) {
        throw new Error(`Content not found: ${contentType} ${contentId}`);
      }

      // Format the message based on content type and platform
      const formattedMessage = this.formatMessage(contentType, content, integration.platform, deepLink);

      // Send the message to the appropriate platform
      await this.sendMessage(integration, formattedMessage);

      this.logger.log(
        `Successfully published ${contentType} ${contentId} to ${integration.platform} (integration ${integration.id})`,
      );

      return { success: true, contentType, contentId, integrationId: integration.id };
    } catch (error) {
      this.logger.error(
        `Failed to publish ${contentType} ${contentId} to ${integration.platform} (integration ${integration.id}): ${error.message}`,
        error.stack,
      );

      // Re-throw the error so Bull can handle retries
      throw error;
    }
  }

  @OnQueueActive()
  onActive(job: Job<PublishContentJobData>) {
    this.logger.debug(
      `Job ${job.id} started: Publishing ${job.data.contentType} ${job.data.contentId} to ${job.data.integration.platform}`,
    );
  }

  @OnQueueCompleted()
  onCompleted(job: Job<PublishContentJobData>, result: any) {
    this.logger.log(
      `Job ${job.id} completed successfully: ${job.data.contentType} ${job.data.contentId} published to ${job.data.integration.platform}`,
    );
  }

  @OnQueueFailed()
  onFailed(job: Job<PublishContentJobData>, error: Error) {
    this.logger.error(
      `Job ${job.id} failed after ${job.attemptsMade} attempts: ${error.message}`,
      error.stack,
    );

    // Log final failure if all retries exhausted
    if (job.attemptsMade >= (job.opts.attempts || 3)) {
      this.logger.error(
        `Job ${job.id} permanently failed: ${job.data.contentType} ${job.data.contentId} could not be published to ${job.data.integration.platform}`,
      );
    }
  }

  /**
   * Fetch content from database based on type
   */
  private async fetchContent(contentType: string, contentId: string): Promise<any> {
    switch (contentType) {
      case 'offer':
        return this.prisma.offer.findUnique({
          where: { id: contentId },
          include: {
            user: { select: { name: true, email: true } },
            community: { select: { id: true, name: true, slug: true } },
          },
        });

      case 'event':
        return this.prisma.event.findUnique({
          where: { id: contentId },
          include: {
            organizer: { select: { name: true, email: true } },
            community: { select: { id: true, name: true, slug: true } },
          },
        });

      case 'need':
        return this.prisma.mutualAidNeed.findUnique({
          where: { id: contentId },
          include: {
            user: { select: { name: true, email: true } },
            community: { select: { id: true, name: true, slug: true } },
          },
        });

      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }
  }

  /**
   * Format message using MessageFormatterService
   */
  private formatMessage(
    contentType: string,
    content: any,
    platform: IntegrationPlatform,
    deepLink: string,
  ): string {
    switch (contentType) {
      case 'offer':
        return this.messageFormatterService.formatOfferMessage(content, platform, deepLink);

      case 'event':
        return this.messageFormatterService.formatEventMessage(content, platform, deepLink);

      case 'need':
        return this.messageFormatterService.formatNeedMessage(content, platform, deepLink);

      default:
        throw new Error(`Unknown content type: ${contentType}`);
    }
  }

  /**
   * Send message to the appropriate platform
   */
  private async sendMessage(integration: any, message: string): Promise<void> {
    switch (integration.platform) {
      case IntegrationPlatform.TELEGRAM:
        await this.telegramService.sendMessage(
          integration.botToken,
          integration.channelId,
          message,
        );
        break;

      case IntegrationPlatform.WHATSAPP_BUSINESS:
        // Parse WhatsApp credentials from botToken
        const { accountSid, authToken, fromNumber } = this.whatsappService.parseBotToken(
          integration.botToken,
        );
        await this.whatsappService.sendMessage(
          accountSid,
          authToken,
          fromNumber,
          integration.channelId,
          message,
        );
        break;

      case IntegrationPlatform.DISCORD:
      case IntegrationPlatform.SLACK:
      case IntegrationPlatform.SIGNAL:
        // TODO: Implement other platforms
        throw new Error(`Platform ${integration.platform} not yet implemented`);

      default:
        throw new Error(`Unknown platform: ${integration.platform}`);
    }
  }
}
