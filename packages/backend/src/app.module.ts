import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CommunitiesModule } from './communities/communities.module';
import { OffersModule } from './offers/offers.module';
import { TimeBankModule } from './timebank/timebank.module';
import { CreditsModule } from './credits/credits.module';
import { EventsModule } from './events/events.module';
import { SocialModule } from './social/social.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { UploadModule } from './upload/upload.module';
import { MessagesModule } from './messages/messages.module';
import { SearchModule } from './search/search.module';
import { ReviewsModule } from './reviews/reviews.module';
import { GroupBuysModule } from './groupbuys/groupbuys.module';
import { HealthModule } from './health/health.module';
import { ConsensusModule } from './consensus/consensus.module';
import { PostsModule } from './posts/posts.module';
import { ChallengesModule } from './challenges/challenges.module';
import { FlowEconomicsModule } from './economy/flow-economics.module';
import { ViralFeaturesModule } from './engagement/viral-features.module';
import { HybridLayerModule } from './hybrid/hybrid-layer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // ScheduleModule.forRoot(),  // Disabled - causes crypto error with cron jobs
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    CommunitiesModule,
    OffersModule,
    TimeBankModule,
    CreditsModule,
    EventsModule,
    SocialModule,
    NotificationsModule,
    AnalyticsModule,
    UploadModule,
    MessagesModule,
    SearchModule,
    ReviewsModule,
    GroupBuysModule,
    ConsensusModule,
    PostsModule,
    ChallengesModule,
    FlowEconomicsModule,
    ViralFeaturesModule,  // Has admin endpoints for manual cron job triggers
    HybridLayerModule,
  ],
})
export class AppModule {}
