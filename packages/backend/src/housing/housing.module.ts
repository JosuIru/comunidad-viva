import { Module } from '@nestjs/common';
import { HousingService } from './housing.service';
import { HousingController } from './housing.controller';

@Module({
  imports: [],
  providers: [HousingService],
  controllers: [HousingController],
  exports: [HousingService],
})
export class HousingModule {}
