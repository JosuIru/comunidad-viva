import { Module } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CommunitiesController } from './communities.controller';
import { AchievementsModule } from '../achievements/achievements.module';
import { CommunityPacksModule } from '../community-packs/community-packs.module';

@Module({
  imports: [AchievementsModule, CommunityPacksModule],
  providers: [CommunitiesService],
  controllers: [CommunitiesController],
  exports: [CommunitiesService],
})
export class CommunitiesModule {}
