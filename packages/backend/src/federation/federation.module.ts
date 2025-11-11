import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ScheduleModule } from '@nestjs/schedule';
import { DIDService } from './did.service';
import { SemillaService } from './semilla.service';
import { ActivityPubService } from './activitypub.service';
import { CirculosService } from './circulos.service';
import { BridgeService } from './bridge.service';
import { BridgeSecurityService } from './bridge-security.service';
import { PolygonContractService } from './polygon-contract.service';
import { SolanaContractService } from './solana-contract.service';
import { BridgeWorkerService } from './bridge-worker.service';
import { BlockchainService } from './blockchain.service';
import { FederationController } from './federation.controller';
import { BridgeController } from './bridge.controller';
import { BridgeAdminController } from './bridge-admin.controller';

/**
 * Federation Module
 *
 * Integrates Comunidad Viva into the Gailu Labs ecosystem.
 *
 * Features:
 * - Decentralized Identity (DID)
 * - SEMILLA token management
 * - Multi-chain bridges (Polygon, Solana, BSC, Arbitrum, etc.)
 * - Automated bridge processing
 * - ActivityPub federation
 * - Círculos de Conciencia
 */
@Module({
  imports: [PrismaModule, ScheduleModule.forRoot()],
  providers: [
    DIDService,
    SemillaService,
    BridgeService,
    BridgeSecurityService,
    BlockchainService,
    PolygonContractService,
    SolanaContractService,
    BridgeWorkerService,
    ActivityPubService,
    CirculosService,
  ],
  controllers: [FederationController, BridgeController, BridgeAdminController],
  exports: [
    DIDService,
    SemillaService,
    BridgeService,
    BridgeSecurityService,
    BlockchainService,
    PolygonContractService,
    SolanaContractService,
    BridgeWorkerService,
    ActivityPubService,
    CirculosService,
  ],
})
export class FederationModule {}
