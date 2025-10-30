import { Module } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreditsController } from './credits.controller';
import { CreditDecayService } from './credit-decay.service';

@Module({
  providers: [CreditsService, CreditDecayService],
  controllers: [CreditsController],
  exports: [CreditsService, CreditDecayService],
})
export class CreditsModule {}
