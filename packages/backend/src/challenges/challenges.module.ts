import { Module } from '@nestjs/common';
import { ChallengesController } from './challenges.controller';
import { ChallengesService } from './challenges.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ViralFeaturesModule } from '../engagement/viral-features.module';

@Module({
  imports: [PrismaModule, ViralFeaturesModule],
  controllers: [ChallengesController],
  providers: [ChallengesService],
  exports: [ChallengesService],
})
export class ChallengesModule {}
