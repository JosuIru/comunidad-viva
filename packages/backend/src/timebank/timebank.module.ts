import { Module } from '@nestjs/common';
import { TimeBankService } from './timebank.service';
import { TimeBankController } from './timebank.controller';
import { CreditsModule } from '../credits/credits.module';

@Module({
  imports: [CreditsModule],
  providers: [TimeBankService],
  controllers: [TimeBankController],
  exports: [TimeBankService],
})
export class TimeBankModule {}
