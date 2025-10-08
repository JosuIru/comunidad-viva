import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ViralFeaturesService } from './viral-features.service';
import { ViralFeaturesController } from './viral-features.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, EventEmitterModule],
  controllers: [ViralFeaturesController],
  providers: [ViralFeaturesService],
  exports: [ViralFeaturesService],
})
export class ViralFeaturesModule {}
