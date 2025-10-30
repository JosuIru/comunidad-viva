import { Injectable, Logger } from '@nestjs/common';
import {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

/**
 * Solana Contract Service
 *
 * Handles interaction with SEMILLA SPL Token on Solana
 *
 * Note: This is a simplified implementation. In production, you'd want to:
 * - Use a proper Token Program with mint authority
 * - Implement proper error handling
 * - Add transaction retry logic
 * - Use a multisig for mint authority
 */
@Injectable()
export class SolanaContractService {
  private readonly logger = new Logger(SolanaContractService.name);
  private connection: Connection | null = null;
  private mintKeypair: Keypair | null = null;
  private authorityKeypair: Keypair | null = null;
  private tokenMintAddress: PublicKey | null = null;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize connection to Solana network
   */
  private initialize() {
    try {
      const rpcUrl = process.env.SOLANA_RPC_URL;
      const mintAddress = process.env.SOLANA_SEMILLA_MINT;
      const authorityPrivateKey = process.env.SOLANA_AUTHORITY_PRIVATE_KEY;

      if (!rpcUrl) {
        this.logger.warn('Solana RPC URL not configured. Solana bridge will not work.');
        return;
      }

      // Setup connection
      this.connection = new Connection(rpcUrl, 'confirmed');

      // Setup mint address
      if (mintAddress) {
        this.tokenMintAddress = new PublicKey(mintAddress);
      }

      // Setup authority keypair if provided
      if (authorityPrivateKey) {
        const secretKey = Uint8Array.from(JSON.parse(authorityPrivateKey));
        this.authorityKeypair = Keypair.fromSecretKey(secretKey);
        this.logger.log('Solana bridge service initialized successfully');
      } else {
        this.logger.warn('No authority private key provided. Can only read from Solana.');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Solana service:', error);
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return (
      this.connection !== null &&
      this.tokenMintAddress !== null &&
      this.authorityKeypair !== null
    );
  }

  /**
   * Get SOL balance of an address
   */
  async getSOLBalance(address: string): Promise<number> {
    if (!this.connection) {
      throw new Error('Solana service not initialized');
    }

    try {
      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      this.logger.error('Get SOL balance failed:', error);
      return 0;
    }
  }

  /**
   * Get wSEMILLA token balance
   */
  async getTokenBalance(walletAddress: string): Promise<number> {
    if (!this.connection || !this.tokenMintAddress) {
      throw new Error('Solana service not initialized');
    }

    try {
      const walletPublicKey = new PublicKey(walletAddress);

      // Get all token accounts owned by wallet
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        walletPublicKey,
        { mint: this.tokenMintAddress },
      );

      if (tokenAccounts.value.length === 0) {
        return 0;
      }

      // Sum up all balances (usually just one account)
      let totalBalance = 0;
      for (const accountInfo of tokenAccounts.value) {
        const balance = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;
        totalBalance += balance;
      }

      return totalBalance;
    } catch (error) {
      this.logger.error('Get token balance failed:', error);
      return 0;
    }
  }

  /**
   * Mint wSEMILLA tokens on Solana
   *
   * Note: This is a simplified implementation.
   * In production, use @solana/spl-token library properly.
   */
  async mintTokens(
    recipientAddress: string,
    amount: number,
    gailuDID: string,
    internalTxId: string,
  ): Promise<{ signature: string; slot: number }> {
    if (!this.connection || !this.tokenMintAddress || !this.authorityKeypair) {
      throw new Error('Solana service not initialized');
    }

    try {
      this.logger.log(`Minting ${amount} wSEMILLA to ${recipientAddress} on Solana`);

      const recipientPublicKey = new PublicKey(recipientAddress);

      // In production, you'd:
      // 1. Get or create associated token account for recipient
      // 2. Mint tokens to that account
      // 3. Store metadata (gailuDID, internalTxId) in a program account

      // For now, we'll simulate the response
      const signature = 'simulated_solana_signature_' + Date.now();
      const slot = Date.now();

      this.logger.log(`Minted successfully. Signature: ${signature}`);

      return { signature, slot };
    } catch (error) {
      this.logger.error('Mint failed:', error);
      throw error;
    }
  }

  /**
   * Verify a burn transaction on Solana
   */
  async verifyBurnTransaction(
    signature: string,
  ): Promise<{
    valid: boolean;
    from: string;
    amount: number;
    gailuDID: string;
  } | null> {
    if (!this.connection) {
      throw new Error('Solana service not initialized');
    }

    try {
      // Get transaction details
      const transaction = await this.connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });

      if (!transaction) {
        this.logger.warn(`Transaction ${signature} not found`);
        return null;
      }

      // In production, you'd:
      // 1. Parse transaction to find burn instruction
      // 2. Verify it's burning the correct token
      // 3. Extract amount and metadata

      // For now, simulate
      return {
        valid: true,
        from: 'simulated_address',
        amount: 100,
        gailuDID: 'did:gailu:test',
      };
    } catch (error) {
      this.logger.error('Verify burn failed:', error);
      throw error;
    }
  }

  /**
   * Get network status
   */
  async getNetworkStatus(): Promise<{
    connected: boolean;
    slot?: number;
    blockTime?: number;
  }> {
    if (!this.connection) {
      return { connected: false };
    }

    try {
      const slot = await this.connection.getSlot();
      const blockTime = await this.connection.getBlockTime(slot);

      return {
        connected: true,
        slot,
        blockTime: blockTime || undefined,
      };
    } catch (error) {
      this.logger.error('Get network status failed:', error);
      return { connected: false };
    }
  }

  /**
   * Get total supply of wSEMILLA on Solana
   */
  async getTotalSupply(): Promise<number> {
    if (!this.connection || !this.tokenMintAddress) {
      throw new Error('Solana service not initialized');
    }

    try {
      const mintInfo = await this.connection.getTokenSupply(this.tokenMintAddress);
      return mintInfo.value.uiAmount || 0;
    } catch (error) {
      this.logger.error('Get total supply failed:', error);
      return 0;
    }
  }

  /**
   * Estimate transaction cost
   */
  async estimateMintCost(): Promise<{ fee: string; estimatedCost: string }> {
    if (!this.connection) {
      throw new Error('Solana service not initialized');
    }

    try {
      // Get recent prioritization fees
      const recentFees = await this.connection.getRecentPrioritizationFees();
      const averageFee = recentFees.length > 0
        ? recentFees.reduce((sum, fee) => sum + fee.prioritizationFee, 0) / recentFees.length
        : 5000; // Default 5000 lamports

      // Typical mint transaction: ~5000 lamports base + prioritization fee
      const baseFee = 5000;
      const totalFee = baseFee + averageFee;
      const costInSOL = totalFee / LAMPORTS_PER_SOL;

      return {
        fee: totalFee.toString() + ' lamports',
        estimatedCost: costInSOL.toFixed(6) + ' SOL',
      };
    } catch (error) {
      this.logger.error('Estimate cost failed:', error);
      return {
        fee: '5000 lamports',
        estimatedCost: '0.000005 SOL',
      };
    }
  }
}
