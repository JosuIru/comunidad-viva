import { Injectable, Logger, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SemillaService } from './semilla.service';
import { DIDService } from './did.service';
import { BridgeSecurityService } from './bridge-security.service';
import { v4 as uuidv4 } from 'uuid';

/**
 * Bridge Service
 *
 * Manages bridges between Gailu Labs internal blockchain and external chains:
 * - Polygon (low-cost EVM)
 * - Solana (ultra-low-cost)
 * - Other compatible networks
 *
 * Features:
 * - Lock SEMILLA on internal chain
 * - Mint wrapped SEMILLA on external chain
 * - Burn wrapped SEMILLA on external chain
 * - Unlock SEMILLA on internal chain
 */

export enum BridgeChain {
  POLYGON = 'POLYGON',
  SOLANA = 'SOLANA',
  ARBITRUM = 'ARBITRUM',
  OPTIMISM = 'OPTIMISM',
}

export enum BridgeStatus {
  PENDING = 'PENDING',
  LOCKED = 'LOCKED',
  MINTED = 'MINTED',
  BURNED = 'BURNED',
  UNLOCKED = 'UNLOCKED',
  FAILED = 'FAILED',
}

export interface BridgeTransaction {
  id: string;
  userDID: string;
  amount: number;
  direction: 'LOCK' | 'UNLOCK'; // LOCK = internal -> external, UNLOCK = external -> internal
  targetChain: BridgeChain;
  status: BridgeStatus;
  internalTxId?: string;
  externalTxHash?: string;
  externalAddress: string;
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

@Injectable()
export class BridgeService {
  private readonly logger = new Logger(BridgeService.name);

  // Supported chains configuration
  private readonly CHAIN_CONFIG = {
    [BridgeChain.POLYGON]: {
      name: 'Polygon',
      chainId: 137,
      rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      wrappedTokenContract: process.env.POLYGON_SEMILLA_CONTRACT,
      minAmount: 10, // Minimum 10 SEMILLA to bridge
      fee: 0.5, // 0.5 SEMILLA bridge fee
    },
    [BridgeChain.SOLANA]: {
      name: 'Solana',
      rpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
      wrappedTokenMint: process.env.SOLANA_SEMILLA_MINT,
      minAmount: 1, // Minimum 1 SEMILLA to bridge
      fee: 0.1, // 0.1 SEMILLA bridge fee
    },
  };

  constructor(
    private prisma: PrismaService,
    private semillaService: SemillaService,
    private didService: DIDService,
    private bridgeSecurity: BridgeSecurityService,
  ) {}

  /**
   * Lock SEMILLA on internal chain and prepare for minting on external chain
   */
  async lockAndBridge(
    userDID: string,
    amount: number,
    targetChain: BridgeChain,
    externalAddress: string,
  ): Promise<BridgeTransaction> {
    // 🛡️ SECURITY CHECK - Run all security validations first
    const securityCheck = await this.bridgeSecurity.checkBridgeAllowed(
      userDID,
      amount,
      targetChain,
      externalAddress,
    );

    if (!securityCheck.allowed) {
      throw new ForbiddenException(
        securityCheck.reason || 'Bridge transaction not allowed',
      );
    }

    // Validate chain support
    const chainConfig = this.CHAIN_CONFIG[targetChain];
    if (!chainConfig) {
      throw new BadRequestException(`Chain ${targetChain} not supported`);
    }

    // Validate amount
    if (amount < chainConfig.minAmount) {
      throw new BadRequestException(
        `Minimum bridge amount is ${chainConfig.minAmount} SEMILLA`,
      );
    }

    // Validate user DID
    const parsed = this.didService.parseDID(userDID);
    if (!parsed || !this.didService.isLocalDID(userDID)) {
      throw new BadRequestException('Invalid or non-local user DID');
    }

    try {
      const userId = parsed.userId;

      // Check user balance
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { semillaBalance: true },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const totalAmount = amount + chainConfig.fee;

      if (user.semillaBalance < totalAmount) {
        throw new BadRequestException(
          `Insufficient balance. Need ${totalAmount} SEMILLA (${amount} + ${chainConfig.fee} fee)`,
        );
      }

      // Create bridge transaction record
      const bridgeTx = await this.prisma.$transaction(async (tx) => {
        // Lock SEMILLA (deduct from user balance)
        await tx.user.update({
          where: { id: userId },
          data: { semillaBalance: { decrement: totalAmount } },
        });

        // Create internal transaction record
        const semillaTx = await tx.semillaTransaction.create({
          data: {
            id: uuidv4(),
            fromDID: userDID,
            fromId: userId,
            toDID: `did:gailu:${this.didService.getNodeId()}:system:bridge`,
            toId: null,
            amount,
            fee: chainConfig.fee,
            type: 'BRIDGE_LOCK',
            reason: `Bridge to ${chainConfig.name}`,
            metadata: {
              targetChain,
              externalAddress,
            },
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        // Create bridge transaction record
        const bridge = await tx.bridgeTransaction.create({
          data: {
            id: uuidv4(),
            userDID,
            amount,
            fee: chainConfig.fee,
            direction: 'LOCK',
            targetChain,
            externalAddress,
            status: 'LOCKED',
            internalTxId: semillaTx.id,
            User: {
              connect: { id: userId },
            },
          },
        });

        return bridge;
      });

      this.logger.log(
        `Locked ${amount} SEMILLA for bridge to ${targetChain} (tx: ${bridgeTx.id})`,
      );

      // TODO: Trigger external chain minting process
      // This would be handled by a separate worker/service
      await this.queueExternalMinting(bridgeTx.id);

      return this.formatBridgeTransaction(bridgeTx);
    } catch (error) {
      this.logger.error('Lock and bridge failed:', error);
      throw error;
    }
  }

  /**
   * Unlock SEMILLA on internal chain after burning on external chain
   */
  async burnAndUnlock(
    userDID: string,
    amount: number,
    sourceChain: BridgeChain,
    externalTxHash: string,
  ): Promise<BridgeTransaction> {
    // Validate chain support
    const chainConfig = this.CHAIN_CONFIG[sourceChain];
    if (!chainConfig) {
      throw new BadRequestException(`Chain ${sourceChain} not supported`);
    }

    // Validate user DID
    const parsed = this.didService.parseDID(userDID);
    if (!parsed || !this.didService.isLocalDID(userDID)) {
      throw new BadRequestException('Invalid or non-local user DID');
    }

    try {
      const userId = parsed.userId;

      // Verify external transaction (this would connect to external chain)
      const verified = await this.verifyExternalBurn(
        sourceChain,
        externalTxHash,
        amount,
      );

      if (!verified) {
        throw new BadRequestException('External burn transaction not verified');
      }

      // Check if already processed
      const existing = await this.prisma.bridgeTransaction.findFirst({
        where: {
          externalTxHash,
          direction: 'UNLOCK',
        },
      });

      if (existing) {
        throw new BadRequestException('Transaction already processed');
      }

      // Create bridge transaction and unlock SEMILLA
      const bridgeTx = await this.prisma.$transaction(async (tx) => {
        // Unlock SEMILLA (add to user balance, minus fee)
        const netAmount = amount - chainConfig.fee;

        await tx.user.update({
          where: { id: userId },
          data: { semillaBalance: { increment: netAmount } },
        });

        // Create internal transaction record
        const semillaTx = await tx.semillaTransaction.create({
          data: {
            id: uuidv4(),
            fromDID: `did:gailu:${this.didService.getNodeId()}:system:bridge`,
            fromId: null,
            toDID: userDID,
            toId: userId,
            amount: netAmount,
            fee: chainConfig.fee,
            type: 'BRIDGE_UNLOCK',
            reason: `Bridge from ${chainConfig.name}`,
            metadata: {
              sourceChain,
              externalTxHash,
            },
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        // Create bridge transaction record
        const bridge = await tx.bridgeTransaction.create({
          data: {
            id: uuidv4(),
            userDID,
            amount,
            fee: chainConfig.fee,
            direction: 'UNLOCK',
            targetChain: sourceChain,
            externalAddress: '', // Not needed for unlock
            externalTxHash,
            status: 'UNLOCKED',
            internalTxId: semillaTx.id,
            completedAt: new Date(),
            User: {
              connect: { id: userId },
            },
          },
        });

        return bridge;
      });

      this.logger.log(
        `Unlocked ${amount} SEMILLA from ${sourceChain} bridge (tx: ${bridgeTx.id})`,
      );

      return this.formatBridgeTransaction(bridgeTx);
    } catch (error) {
      this.logger.error('Burn and unlock failed:', error);
      throw error;
    }
  }

  /**
   * Get bridge transaction status
   */
  async getBridgeTransaction(txId: string): Promise<BridgeTransaction | null> {
    const tx = await this.prisma.bridgeTransaction.findUnique({
      where: { id: txId },
    });

    if (!tx) {
      return null;
    }

    return this.formatBridgeTransaction(tx);
  }

  /**
   * Get user's bridge transaction history
   */
  async getUserBridgeHistory(userDID: string, limit: number = 50) {
    const transactions = await this.prisma.bridgeTransaction.findMany({
      where: { userDID },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions.map((tx) => this.formatBridgeTransaction(tx));
  }

  /**
   * Get bridge statistics
   */
  async getBridgeStats() {
    const [totalBridged, totalLocked, totalUnlocked] = await Promise.all([
      this.prisma.bridgeTransaction.aggregate({
        _sum: { amount: true },
      }),
      this.prisma.bridgeTransaction.aggregate({
        _sum: { amount: true },
        where: { direction: 'LOCK', status: { in: ['LOCKED', 'MINTED'] } },
      }),
      this.prisma.bridgeTransaction.aggregate({
        _sum: { amount: true },
        where: { direction: 'UNLOCK', status: 'UNLOCKED' },
      }),
    ]);

    const byChain = await this.prisma.bridgeTransaction.groupBy({
      by: ['targetChain'],
      _sum: { amount: true },
      _count: true,
    });

    return {
      totalBridged: totalBridged._sum.amount || 0,
      totalLocked: totalLocked._sum.amount || 0,
      totalUnlocked: totalUnlocked._sum.amount || 0,
      byChain: byChain.map((item) => ({
        chain: item.targetChain,
        totalAmount: item._sum.amount || 0,
        transactionCount: item._count,
      })),
    };
  }

  /**
   * Get supported chains configuration
   */
  getSupportedChains() {
    return Object.entries(this.CHAIN_CONFIG).map(([chain, config]) => ({
      chain,
      name: config.name,
      minAmount: config.minAmount,
      fee: config.fee,
    }));
  }

  // ============= PRIVATE HELPER METHODS =============

  /**
   * Queue external chain minting (would be handled by worker)
   */
  private async queueExternalMinting(bridgeTxId: string) {
    // In production, this would:
    // 1. Add to a queue (Redis, Bull, etc.)
    // 2. Worker picks up the task
    // 3. Worker calls smart contract to mint wrapped SEMILLA
    // 4. Worker updates bridge transaction status

    this.logger.debug(`Queued external minting for bridge tx ${bridgeTxId}`);

    // For now, just mark as pending
    await this.prisma.bridgeTransaction.update({
      where: { id: bridgeTxId },
      data: { status: 'PENDING' },
    });
  }

  /**
   * Verify external burn transaction
   */
  private async verifyExternalBurn(
    chain: BridgeChain,
    txHash: string,
    amount: number,
  ): Promise<boolean> {
    // In production, this would:
    // 1. Connect to external chain RPC
    // 2. Fetch transaction details
    // 3. Verify it's a burn transaction
    // 4. Verify the amount matches
    // 5. Verify it's from the wrapped SEMILLA contract

    this.logger.debug(`Verifying burn on ${chain}: ${txHash}`);

    // For now, return true (in production, implement actual verification)
    return true;
  }

  /**
   * Format bridge transaction for API response
   */
  private formatBridgeTransaction(tx: any): BridgeTransaction {
    return {
      id: tx.id,
      userDID: tx.userDID,
      amount: tx.amount,
      direction: tx.direction,
      targetChain: tx.targetChain,
      status: tx.status,
      internalTxId: tx.internalTxId,
      externalTxHash: tx.externalTxHash,
      externalAddress: tx.externalAddress,
      createdAt: tx.createdAt,
      completedAt: tx.completedAt,
      error: tx.error,
    };
  }
}
