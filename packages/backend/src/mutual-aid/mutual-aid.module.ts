import { Module } from '@nestjs/common';
import { MutualAidService } from './mutual-aid.service';
import { MutualAidController } from './mutual-aid.controller';

@Module({
  imports: [],
  providers: [MutualAidService],
  controllers: [MutualAidController],
  exports: [MutualAidService],
})
export class MutualAidModule {}
