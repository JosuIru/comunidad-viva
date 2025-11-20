import { Module } from '@nestjs/common';
import { OffersService } from './offers.service';
import { OffersController } from './offers.controller';
import { NotificationsModule } from '../notifications/notifications.module';
import { PrismaModule } from '../prisma/prisma.module';
import { IntegrationsModule } from '../integrations/integrations.module';
import { OwnershipGuard } from '../common/guards/ownership.guard';

@Module({
  imports: [NotificationsModule, PrismaModule, IntegrationsModule],
  providers: [OffersService, OwnershipGuard],
  controllers: [OffersController],
  exports: [OffersService],
})
export class OffersModule {}
