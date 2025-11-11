import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConsensusController } from './consensus.controller';
import { ProofOfHelpService } from './proof-of-help.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OwnershipGuard } from '../common/guards/ownership.guard';

@Module({
  imports: [PrismaModule, EventEmitterModule],
  controllers: [ConsensusController],
  providers: [ProofOfHelpService, OwnershipGuard],
  exports: [ProofOfHelpService],
})
export class ConsensusModule {}
