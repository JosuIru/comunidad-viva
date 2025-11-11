import { Module } from '@nestjs/common';
import { HousingService } from './housing.service';
import { HousingController } from './housing.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OwnershipGuard } from '../common/guards/ownership.guard';

@Module({
  imports: [PrismaModule],
  providers: [HousingService, OwnershipGuard],
  controllers: [HousingController],
  exports: [HousingService],
})
export class HousingModule {}
