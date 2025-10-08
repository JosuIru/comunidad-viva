import { Module } from '@nestjs/common';
import { HybridLayerController } from './hybrid-layer.controller';
import { HybridLayerService } from './hybrid-layer.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HybridLayerController],
  providers: [HybridLayerService],
  exports: [HybridLayerService],
})
export class HybridLayerModule {}
