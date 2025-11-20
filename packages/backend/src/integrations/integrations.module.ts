import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsProcessor } from './integrations.processor';
import { MessageFormatterService } from './message-formatter.service';
import { TelegramService } from './telegram.service';
import { WhatsAppService } from './whatsapp.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    BullModule.registerQueue({
      name: 'integrations',
      redis: {
        host: process.env.REDIS_URL?.includes('://')
          ? new URL(process.env.REDIS_URL).hostname
          : process.env.REDIS_URL || 'localhost',
        port: process.env.REDIS_URL?.includes('://')
          ? parseInt(new URL(process.env.REDIS_URL).port || '6379')
          : 6379,
      },
    }),
  ],
  controllers: [IntegrationsController],
  providers: [
    IntegrationsService,
    IntegrationsProcessor,
    MessageFormatterService,
    TelegramService,
    WhatsAppService,
  ],
  exports: [IntegrationsService, MessageFormatterService, TelegramService, WhatsAppService],
})
export class IntegrationsModule {}
