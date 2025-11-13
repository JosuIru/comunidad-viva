import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PolygonContractService } from './polygon-contract.service';
import { SolanaContractService } from './solana-contract.service';
import { BridgeChain, BridgeStatus } from '@prisma/client';

/**
 * Bridge Worker Service
 *
 * Processes pending bridge transactions automatically:
 * - Mints wrapped tokens on external chains (Polygon, Solana)
 * - Verifies burn transactions
 * - Updates transaction statuses
 */
@Injectable()
export class BridgeWorkerService implements OnModuleInit {
  private readonly logger = new Logger(BridgeWorkerService.name);
  private isProcessing = false;

  constructor(
    private prisma: PrismaService,
    private polygonService: PolygonContractService,
    private solanaService: SolanaContractService,
  ) {}

  onModuleInit() {
    this.logger.log('Bridge Worker Service initialized');

    // Check polygon connection
    if (this.polygonService.isReady()) {
      this.logger.log('✅ Polygon service connected and ready');
    } else {
      this.logger.warn('⚠️  Polygon service not configured.');
    }

    // Check solana connection
    if (this.solanaService.isReady()) {
      this.logger.log('✅ Solana service connected and ready');
    } else {
      this.logger.warn('⚠️  Solana service not configured.');
    }
  }

  /**
   * Process pending LOCK bridges (every 30 seconds)
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async processPendingLocks() {
    if (this.isProcessing) {
      return; // Avoid concurrent processing
    }

    this.isProcessing = true;

    try {
      // Get pending LOCK bridges
      const pendingLocks = await this.prisma.bridgeTransaction.findMany({
        where: {
          direction: 'LOCK',
          status: {
            in: ['PENDING', 'LOCKED'],
          },
        },
        orderBy: { createdAt: 'asc' },
        take: 10, // Process 10 at a time
        include: {
          User: true,
        },
      });

      if (pendingLocks.length === 0) {
        return;
      }

      this.logger.log(`Processing ${pendingLocks.length} pending LOCK bridges`);

      for (const bridge of pendingLocks) {
        try {
          await this.processLockBridge(bridge);
        } catch (error) {
          this.logger.error(
            `Failed to process bridge ${bridge.id}:`,
            error,
          );
          // Mark as failed
          await this.prisma.bridgeTransaction.update({
            where: { id: bridge.id },
            data: {
              status: 'FAILED',
              error: error.message,
            },
          });
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Process a single LOCK bridge
   */
  private async processLockBridge(bridge: any) {
    this.logger.log(`Processing LOCK bridge ${bridge.id} to ${bridge.targetChain}`);

    // Skip if already minted
    if (bridge.status === 'MINTED') {
      this.logger.log(`Bridge ${bridge.id} already minted`);
      return;
    }

    let result: { txHash?: string; signature?: string };

    // Process based on target chain
    switch (bridge.targetChain) {
      case BridgeChain.POLYGON:
        if (!this.polygonService.isReady()) {
          throw new Error('Polygon service not ready');
        }
        result = await this.polygonService.mintTokens(
          bridge.externalAddress,
          bridge.amount,
          bridge.userDID,
          bridge.internalTxId || bridge.id,
        );
        break;

      case BridgeChain.SOLANA:
        if (!this.solanaService.isReady()) {
          throw new Error('Solana service not ready');
        }
        const solanaResult = await this.solanaService.mintTokens(
          bridge.externalAddress,
          bridge.amount,
          bridge.userDID,
          bridge.internalTxId || bridge.id,
        );
        result = { signature: solanaResult.signature };
        break;

      default:
        throw new Error(`Chain ${bridge.targetChain} not yet supported`);
    }

    // Update bridge status
    await this.prisma.bridgeTransaction.update({
      where: { id: bridge.id },
      data: {
        status: 'MINTED',
        externalTxHash: result.txHash || result.signature,
        completedAt: new Date(),
      },
    });

    this.logger.log(
      `✅ Bridge ${bridge.id} completed. TX: ${result.txHash || result.signature}`,
    );
  }

  /**
   * Verify pending UNLOCK bridges (every minute)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async verifyPendingUnlocks() {
    try {
      // Get pending UNLOCK bridges that need verification
      const pendingUnlocks = await this.prisma.bridgeTransaction.findMany({
        where: {
          direction: 'UNLOCK',
          status: 'PENDING',
          externalTxHash: { not: null },
        },
        orderBy: { createdAt: 'asc' },
        take: 10,
      });

      if (pendingUnlocks.length === 0) {
        return;
      }

      this.logger.log(`Verifying ${pendingUnlocks.length} pending UNLOCK bridges`);

      for (const bridge of pendingUnlocks) {
        try {
          await this.verifyUnlockBridge(bridge);
        } catch (error) {
          this.logger.error(
            `Failed to verify bridge ${bridge.id}:`,
            error,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error in verifyPendingUnlocks:', error);
    }
  }

  /**
   * Verify a single UNLOCK bridge
   */
  private async verifyUnlockBridge(bridge: any) {
    this.logger.log(`Verifying UNLOCK bridge ${bridge.id}`);

    // Currently only Polygon is supported
    if (bridge.targetChain !== BridgeChain.POLYGON) {
      this.logger.warn(`Chain ${bridge.targetChain} not yet supported`);
      return;
    }

    if (!this.polygonService.isReady()) {
      this.logger.warn('Polygon service not ready');
      return;
    }

    // Verify the burn transaction
    const burnInfo = await this.polygonService.verifyBurnTransaction(
      bridge.externalTxHash,
    );

    if (!burnInfo || !burnInfo.valid) {
      this.logger.warn(`Burn transaction ${bridge.externalTxHash} not valid`);
      await this.prisma.bridgeTransaction.update({
        where: { id: bridge.id },
        data: {
          status: 'FAILED',
          error: 'Burn transaction not found or invalid',
        },
      });
      return;
    }

    // Verify amounts match
    if (Math.abs(burnInfo.amount - bridge.amount) > 0.01) {
      await this.prisma.bridgeTransaction.update({
        where: { id: bridge.id },
        data: {
          status: 'FAILED',
          error: `Amount mismatch: expected ${bridge.amount}, got ${burnInfo.amount}`,
        },
      });
      return;
    }

    // Mark as verified (already unlocked in bridge.service)
    await this.prisma.bridgeTransaction.update({
      where: { id: bridge.id },
      data: {
        status: 'UNLOCKED',
        completedAt: new Date(),
      },
    });

    this.logger.log(`✅ UNLOCK bridge ${bridge.id} verified and completed`);
  }

  /**
   * Get worker status
   */
  async getStatus() {
    const [pendingLocks, pendingUnlocks, failedBridges] = await Promise.all([
      this.prisma.bridgeTransaction.count({
        where: { direction: 'LOCK', status: { in: ['PENDING', 'LOCKED'] } },
      }),
      this.prisma.bridgeTransaction.count({
        where: { direction: 'UNLOCK', status: 'PENDING' },
      }),
      this.prisma.bridgeTransaction.count({
        where: { status: 'FAILED' },
      }),
    ]);

    const polygonStatus = await this.polygonService.getNetworkStatus();

    return {
      isProcessing: this.isProcessing,
      pendingLocks,
      pendingUnlocks,
      failedBridges,
      polygon: {
        connected: polygonStatus.connected,
        chainId: polygonStatus.chainId,
        blockNumber: polygonStatus.blockNumber,
        gasPrice: polygonStatus.gasPrice,
      },
    };
  }

  /**
   * Retry a failed bridge
   */
  async retryFailedBridge(bridgeId: string) {
    const bridge = await this.prisma.bridgeTransaction.findUnique({
      where: { id: bridgeId },
      include: { User: true },
    });

    if (!bridge) {
      throw new Error('Bridge not found');
    }

    if (bridge.status !== 'FAILED') {
      throw new Error('Only failed bridges can be retried');
    }

    // Reset status to pending
    await this.prisma.bridgeTransaction.update({
      where: { id: bridgeId },
      data: {
        status: 'PENDING',
        error: null,
      },
    });

    this.logger.log(`Bridge ${bridgeId} queued for retry`);

    // Try to process immediately
    if (bridge.direction === 'LOCK') {
      await this.processLockBridge(bridge);
    }

    return { message: 'Bridge queued for retry' };
  }
}
