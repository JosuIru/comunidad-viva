import { Module } from '@nestjs/common';
import { GroupBuysService } from './groupbuys.service';
import { GroupBuysController } from './groupbuys.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  providers: [GroupBuysService],
  controllers: [GroupBuysController],
  exports: [GroupBuysService],
})
export class GroupBuysModule {}
