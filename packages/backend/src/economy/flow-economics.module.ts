import { Module } from '@nestjs/common';
import { FlowEconomicsService } from './flow-economics.service';
import { FlowEconomicsController } from './flow-economics.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [FlowEconomicsController],
  providers: [FlowEconomicsService],
  exports: [FlowEconomicsService],
})
export class FlowEconomicsModule {}
