import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { RequestLoggerMiddleware } from './common/request-logger.middleware';
import { SanitizeMiddleware } from './common/middleware/sanitize.middleware';
import { RedisThrottlerStorage } from './common/redis-throttler-storage.service';
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
import { HousingModule } from './housing/housing.module';
import { MutualAidModule } from './mutual-aid/mutual-aid.module';
import { FederationModule } from './federation/federation.module';
import { WebSocketModule } from './websocket/websocket.module';
import { AchievementsModule } from './achievements/achievements.module';
import { InstallerModule } from './installer/installer.module';
import { CommunityPacksModule } from './community-packs/community-packs.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),  // Re-enabled - testing if crypto error is resolved
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'default',
          ttl: 60000, // 60 seconds
          limit: 100, // 100 requests per minute (global default)
        },
        {
          name: 'strict',
          ttl: 60000, // 60 seconds
          limit: 10, // 10 requests per minute (for auth endpoints)
        },
      ],
      // Use Redis storage for distributed rate limiting (falls back to memory)
      storage: new RedisThrottlerStorage(),
    }),
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
    HousingModule,
    MutualAidModule,
    FederationModule,  // Gailu Labs Federation: DID, SEMILLA, ActivityPub, Círculos
    WebSocketModule,  // Real-time notifications and live updates
    AchievementsModule,  // Sistema completo de achievements/badges con 70+ badges
    InstallerModule,  // Instalador gráfico estilo WordPress
    CommunityPacksModule,  // Community onboarding packs for organized groups
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SanitizeMiddleware, RequestLoggerMiddleware)
      .forRoutes('*'); // Apply to all routes (sanitize first, then log)
  }
}
