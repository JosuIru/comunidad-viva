import { Module } from '@nestjs/common';
import { CommunityPacksController } from './community-packs.controller';
import { CommunityPacksService } from './community-packs.service';
import { MetricsCalculatorService } from './metrics-calculator.service';
import { BridgesService } from './bridges.service';
import { ExportService } from './export.service';
import { NetworkAnalyticsService } from './network-analytics.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CommunityPacksController],
  providers: [
    CommunityPacksService,
    MetricsCalculatorService,
    BridgesService,
    ExportService,
    NetworkAnalyticsService,
  ],
  exports: [
    CommunityPacksService,
    MetricsCalculatorService,
    BridgesService,
    ExportService,
    NetworkAnalyticsService,
  ],
})
export class CommunityPacksModule {}
