import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EventsGateway } from './events/events.gateway';
import { EmailService } from './email.service';

@Module({
  providers: [NotificationsService, EventsGateway, EmailService],
  controllers: [NotificationsController],
  exports: [NotificationsService, EventsGateway, EmailService],
})
export class NotificationsModule {}
