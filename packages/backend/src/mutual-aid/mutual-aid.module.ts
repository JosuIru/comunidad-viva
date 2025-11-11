import { Module } from '@nestjs/common';
import { MutualAidService } from './mutual-aid.service';
import { MutualAidController } from './mutual-aid.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { OwnershipGuard } from '../common/guards/ownership.guard';

@Module({
  imports: [PrismaModule],
  providers: [MutualAidService, OwnershipGuard],
  controllers: [MutualAidController],
  exports: [MutualAidService],
})
export class MutualAidModule {}
