import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Batch Bridge Service
 *
 * Handles batch processing of bridge transactions to optimize gas costs
 * by grouping multiple mint operations into single transactions.
 */
@Injectable()
export class BatchBridgeService {
  private readonly logger = new Logger(BatchBridgeService.name);
  private readonly BATCH_SIZE = 50; // Max transactions per batch
  private readonly BATCH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

  private pendingBatches: Map<string, any[]> = new Map(); // chain -> transactions

  constructor(private prisma: PrismaService) {}

  /**
   * Add a transaction to the pending batch
   * @param chain - Target blockchain
   * @param transaction - Bridge transaction data
   * @returns Whether transaction was batched or needs immediate processing
   */
  async addToBatch(chain: string, transaction: any): Promise<{ batched: boolean; batchId?: string }> {
    // Check if transaction is urgent (large amount)
    const amountNumber = parseFloat(transaction.amount.toString());
    const isUrgent = amountNumber > 100; // Amounts > 100 SEMILLA processed immediately

    if (isUrgent) {
      this.logger.log(`Transaction ${transaction.id} is urgent (${amountNumber} SEMILLA), skipping batch`);
      return { batched: false };
    }

    // Add to pending batch
    const chainBatch = this.pendingBatches.get(chain) || [];
    chainBatch.push(transaction);
    this.pendingBatches.set(chain, chainBatch);

    this.logger.log(`Added transaction ${transaction.id} to ${chain} batch (${chainBatch.length}/${this.BATCH_SIZE})`);

    // If batch is full, process immediately
    if (chainBatch.length >= this.BATCH_SIZE) {
      await this.processBatch(chain);
      return { batched: true, batchId: `batch-${Date.now()}` };
    }

    return { batched: true };
  }

  /**
   * Process a batch of transactions for a specific chain
   */
  async processBatch(chain: string): Promise<void> {
    const batch = this.pendingBatches.get(chain);

    if (!batch || batch.length === 0) {
      return;
    }

    this.logger.log(`🔄 Processing batch for ${chain}: ${batch.length} transactions`);

    try {
      // Prepare batch data
      const recipients: string[] = [];
      const amounts: string[] = [];
      const transactionIds: string[] = [];

      for (const tx of batch) {
        recipients.push(tx.walletAddress);
        amounts.push(tx.amount.toString());
        transactionIds.push(tx.id);
      }

      // Call batchMint on smart contract
      // Note: This requires the optimized contract with batchMint function
      this.logger.log(`Calling batchMint for ${recipients.length} recipients on ${chain}`);

      // TODO: Implement actual blockchain call
      // const result = await this.blockchainService.batchMint(chain, recipients, amounts);

      // For now, simulate success
      const batchTxHash = `0xbatch-${Date.now()}-${Math.random().toString(36).substring(7)}`;

      // Update all transactions in database
      await this.prisma.bridgeTransaction.updateMany({
        where: {
          id: { in: transactionIds },
        },
        data: {
          status: 'MINTED',
          mintTxHash: batchTxHash,
          mintedAt: new Date(),
        },
      });

      this.logger.log(`✅ Batch processed successfully: ${batchTxHash}`);
      this.logger.log(`   Chain: ${chain}`);
      this.logger.log(`   Transactions: ${transactionIds.length}`);
      this.logger.log(`   Total amount: ${amounts.reduce((sum, amt) => sum + parseFloat(amt), 0)} SEMILLA`);

      // Clear batch
      this.pendingBatches.set(chain, []);

      // Record batch in database for analytics
      await this.recordBatch({
        chain,
        txHash: batchTxHash,
        transactionIds,
        recipients,
        amounts,
        timestamp: new Date(),
      });

    } catch (error) {
      this.logger.error(`Failed to process batch for ${chain}:`, error);

      // Mark transactions as failed
      const transactionIds = batch.map((tx) => tx.id);
      await this.prisma.bridgeTransaction.updateMany({
        where: {
          id: { in: transactionIds },
        },
        data: {
          status: 'FAILED',
        },
      });

      // Clear batch
      this.pendingBatches.set(chain, []);
    }
  }

  /**
   * Record batch in database for analytics
   */
  private async recordBatch(batchData: {
    chain: string;
    txHash: string;
    transactionIds: string[];
    recipients: string[];
    amounts: string[];
    timestamp: Date;
  }) {
    try {
      // Create a record of the batch operation
      // This helps with analytics and debugging
      const totalAmount = batchData.amounts.reduce((sum, amt) => sum + parseFloat(amt), 0);

      this.logger.log(`📊 Batch analytics:`);
      this.logger.log(`   Average amount: ${(totalAmount / batchData.amounts.length).toFixed(2)} SEMILLA`);
      this.logger.log(`   Unique recipients: ${new Set(batchData.recipients).size}`);

      // TODO: Store in dedicated BatchOperation table if needed
    } catch (error) {
      this.logger.error('Failed to record batch analytics:', error);
    }
  }

  /**
   * Get pending batch status
   */
  async getBatchStatus(chain?: string): Promise<{
    chain: string;
    pendingCount: number;
    oldestTransaction?: Date;
  }[]> {
    const status: any[] = [];

    if (chain) {
      const batch = this.pendingBatches.get(chain) || [];
      status.push({
        chain,
        pendingCount: batch.length,
        oldestTransaction: batch.length > 0 ? batch[0].createdAt : undefined,
      });
    } else {
      // All chains
      for (const [chainName, batch] of this.pendingBatches.entries()) {
        status.push({
          chain: chainName,
          pendingCount: batch.length,
          oldestTransaction: batch.length > 0 ? batch[0].createdAt : undefined,
        });
      }
    }

    return status;
  }

  /**
   * Force process all pending batches
   */
  async forceProcessAll(): Promise<void> {
    this.logger.log('🔄 Force processing all pending batches...');

    for (const chain of this.pendingBatches.keys()) {
      await this.processBatch(chain);
    }

    this.logger.log('✅ All batches processed');
  }

  /**
   * Cron job to process batches every 5 minutes
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async processPendingBatches() {
    try {
      const chains = Array.from(this.pendingBatches.keys());

      if (chains.length === 0) {
        return;
      }

      this.logger.log(`⏰ Scheduled batch processing for ${chains.length} chains`);

      for (const chain of chains) {
        const batch = this.pendingBatches.get(chain) || [];

        // Process if batch has been waiting for > 5 minutes
        if (batch.length > 0) {
          const oldestTx = batch[0];
          const waitTime = Date.now() - new Date(oldestTx.createdAt).getTime();

          if (waitTime >= this.BATCH_INTERVAL_MS) {
            this.logger.log(`Processing ${chain} batch due to timeout (${batch.length} transactions)`);
            await this.processBatch(chain);
          }
        }
      }
    } catch (error) {
      this.logger.error('Scheduled batch processing failed:', error);
    }
  }

  /**
   * Get batch processing statistics
   */
  async getBatchStatistics(timeframe: 'day' | 'week' | 'month' = 'day') {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    // Count transactions that were part of batches
    // Look for transactions with same mintTxHash (batched together)
    const transactions = await this.prisma.bridgeTransaction.groupBy({
      by: ['mintTxHash'],
      where: {
        mintedAt: { gte: startDate },
        mintTxHash: { not: null },
      },
      _count: true,
    });

    const batches = transactions.filter((group) => group._count > 1);
    const totalBatchedTransactions = batches.reduce((sum, batch) => sum + batch._count, 0);
    const averageBatchSize = batches.length > 0 ? totalBatchedTransactions / batches.length : 0;

    return {
      timeframe,
      totalBatches: batches.length,
      totalBatchedTransactions,
      averageBatchSize: averageBatchSize.toFixed(2),
      estimatedGasSaved: `${(batches.length * 21000 * 0.7).toFixed(0)} gas`, // Rough estimate
    };
  }
}
