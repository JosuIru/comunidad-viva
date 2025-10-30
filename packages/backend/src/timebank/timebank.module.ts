import { Module } from '@nestjs/common';
import { TimeBankService } from './timebank.service';
import { TimeBankController } from './timebank.controller';
import { CreditsModule } from '../credits/credits.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AchievementsModule } from '../achievements/achievements.module';

@Module({
  imports: [CreditsModule, NotificationsModule, AchievementsModule],
  providers: [TimeBankService],
  controllers: [TimeBankController],
  exports: [TimeBankService],
})
export class TimeBankModule {}
