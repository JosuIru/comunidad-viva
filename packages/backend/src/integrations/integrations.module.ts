import { Module } from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { IntegrationsController } from './integrations.controller';
import { MessageFormatterService } from './message-formatter.service';
import { TelegramService } from './telegram.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    // Note: BullModule can be added here when queue functionality is needed
    // BullModule.registerQueue({
    //   name: 'integrations',
    // }),
  ],
  controllers: [IntegrationsController],
  providers: [IntegrationsService, MessageFormatterService, TelegramService],
  exports: [IntegrationsService, MessageFormatterService, TelegramService],
})
export class IntegrationsModule {}
