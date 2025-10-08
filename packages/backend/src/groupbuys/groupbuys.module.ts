import { Module } from '@nestjs/common';
import { GroupBuysService } from './groupbuys.service';
import { GroupBuysController } from './groupbuys.controller';

@Module({
  providers: [GroupBuysService],
  controllers: [GroupBuysController],
  exports: [GroupBuysService],
})
export class GroupBuysModule {}
