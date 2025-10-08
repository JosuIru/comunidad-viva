import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EventsGateway } from './events/events.gateway';

@Module({
  providers: [NotificationsService, EventsGateway],
  controllers: [NotificationsController],
  exports: [NotificationsService, EventsGateway],
})
export class NotificationsModule {}
