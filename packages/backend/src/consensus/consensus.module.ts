import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConsensusController } from './consensus.controller';
import { ProofOfHelpService } from './proof-of-help.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [ConsensusController],
  providers: [ProofOfHelpService],
  exports: [ProofOfHelpService],
})
export class ConsensusModule {}
