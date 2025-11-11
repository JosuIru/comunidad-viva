import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { CreditsModule } from '../credits/credits.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AchievementsModule } from '../achievements/achievements.module';
import { PrismaModule } from '../prisma/prisma.module';
import { OwnershipGuard } from '../common/guards/ownership.guard';

@Module({
  imports: [CreditsModule, NotificationsModule, AchievementsModule, PrismaModule],
  providers: [EventsService, OwnershipGuard],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
