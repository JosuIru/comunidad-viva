import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SemillaService } from './semilla.service';
import { DIDService } from './did.service';
import * as crypto from 'crypto';

/**
 * Web3 RPC Service
 *
 * Provides EVM-compatible JSON-RPC endpoints for MetaMask/Web3 wallets
 * to interact with the SEMILLA blockchain.
 *
 * Maps between:
 * - Ethereum addresses <-> Gailu DIDs
 * - SEMILLA tokens <-> ERC-20 token standard
 * - Internal transactions <-> Ethereum transaction format
 */
@Injectable()
export class Web3RPCService {
  private readonly logger = new Logger(Web3RPCService.name);

  // Network configuration
  private readonly CHAIN_ID = '0x474C'; // 18252 in hex (GAILU in hex)
  private readonly CHAIN_NAME = 'Gailu Labs Network';
  private readonly NATIVE_CURRENCY = {
    name: 'SEMILLA',
    symbol: 'SEMILLA',
    decimals: 2, // SEMILLA uses 2 decimals (like cents)
  };

  // SEMILLA token contract address (deterministic based on network)
  private readonly SEMILLA_CONTRACT_ADDRESS = '0x5E4111A0000000000000000000000000000000';

  constructor(
    private prisma: PrismaService,
    private semillaService: SemillaService,
    private didService: DIDService,
  ) {}

  /**
   * Convert Ethereum address to Gailu DID
   */
  private addressToDID(address: string): string {
    // Ethereum addresses are already stored in walletAddress field
    // We need to find the user and get their DID
    return `did:gailu:${this.didService.getNodeId()}:wallet:${address.toLowerCase()}`;
  }

  /**
   * Convert Gailu DID to Ethereum-style address
   * For users without wallet, generate deterministic address from DID
   */
  private didToAddress(did: string): string {
    const parsed = this.didService.parseDID(did);
    if (!parsed) {
      throw new Error('Invalid DID');
    }

    // Create deterministic address from user ID
    const hash = crypto.createHash('sha256').update(parsed.userId).digest();
    return '0x' + hash.slice(0, 20).toString('hex');
  }

  /**
   * Get user by wallet address (supports both MetaMask and Phantom)
   */
  private async getUserByAddress(address: string) {
    const normalizedAddress = address.toLowerCase();

    return await this.prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: normalizedAddress },
          { walletAddress: normalizedAddress.replace('0x', '') }, // Try without 0x prefix
        ],
      },
    });
  }

  /**
   * RPC: eth_chainId
   * Returns the chain ID
   */
  async ethChainId(): Promise<string> {
    return this.CHAIN_ID;
  }

  /**
   * RPC: net_version
   * Returns the network ID
   */
  async netVersion(): Promise<string> {
    return parseInt(this.CHAIN_ID, 16).toString();
  }

  /**
   * RPC: eth_blockNumber
   * Returns the current block number (we'll use transaction count as approximation)
   */
  async ethBlockNumber(): Promise<string> {
    const count = await this.prisma.semillaTransaction.count();
    return '0x' + count.toString(16);
  }

  /**
   * RPC: eth_getBalance
   * Get SEMILLA balance for an address
   */
  async ethGetBalance(address: string, blockTag: string = 'latest'): Promise<string> {
    try {
      const user = await this.getUserByAddress(address);

      if (!user) {
        return '0x0';
      }

      // Convert SEMILLA balance to wei-like format (with 2 decimals)
      // 1 SEMILLA = 100 units (like cents)
      const balanceInUnits = Math.floor(user.semillaBalance * 100);

      return '0x' + balanceInUnits.toString(16);
    } catch (error) {
      this.logger.error(`Error getting balance for ${address}:`, error);
      return '0x0';
    }
  }

  /**
   * RPC: eth_getTransactionCount
   * Get transaction count (nonce) for an address
   */
  async ethGetTransactionCount(address: string, blockTag: string = 'latest'): Promise<string> {
    try {
      const user = await this.getUserByAddress(address);

      if (!user || !user.gailuDID) {
        return '0x0';
      }

      const count = await this.prisma.semillaTransaction.count({
        where: { fromDID: user.gailuDID },
      });

      return '0x' + count.toString(16);
    } catch (error) {
      this.logger.error(`Error getting transaction count for ${address}:`, error);
      return '0x0';
    }
  }

  /**
   * RPC: eth_sendTransaction
   * Send a SEMILLA transaction
   */
  async ethSendTransaction(params: {
    from: string;
    to: string;
    value?: string;
    data?: string;
    gas?: string;
    gasPrice?: string;
  }): Promise<string> {
    try {
      const fromUser = await this.getUserByAddress(params.from);
      const toUser = await this.getUserByAddress(params.to);

      if (!fromUser || !fromUser.gailuDID) {
        throw new Error('Sender not found');
      }

      if (!toUser || !toUser.gailuDID) {
        throw new Error('Recipient not found');
      }

      // Convert value from wei-like units to SEMILLA
      const valueInUnits = params.value ? parseInt(params.value, 16) : 0;
      const semillaAmount = valueInUnits / 100; // Convert from cents to SEMILLA

      if (semillaAmount <= 0) {
        throw new Error('Amount must be positive');
      }

      // Execute transfer
      const transaction = await this.semillaService.transfer(
        fromUser.gailuDID,
        toUser.gailuDID,
        semillaAmount,
        'Web3 transfer',
        'TRANSFER',
        {
          source: 'web3',
          from: params.from,
          to: params.to,
        },
      );

      // Return transaction hash (use our transaction ID)
      return '0x' + transaction.id.replace(/-/g, '').slice(0, 64);
    } catch (error) {
      this.logger.error('Error sending transaction:', error);
      throw error;
    }
  }

  /**
   * RPC: eth_getTransactionByHash
   * Get transaction details by hash
   */
  async ethGetTransactionByHash(hash: string) {
    try {
      // Try to find transaction by ID (hash without 0x)
      const cleanHash = hash.replace('0x', '');

      // In a real implementation, we'd need a hash->ID mapping
      // For now, we'll search recent transactions
      const transactions = await this.prisma.semillaTransaction.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
        include: {
          User_SemillaTransaction_fromIdToUser: true,
          User_SemillaTransaction_toIdToUser: true,
        },
      });

      // This is simplified - in production you'd want proper hash indexing
      const transaction = transactions[0]; // Placeholder

      if (!transaction) {
        return null;
      }

      // Convert to Ethereum transaction format
      return {
        hash,
        nonce: '0x0',
        blockHash: '0x' + transaction.id.replace(/-/g, '').slice(0, 64),
        blockNumber: '0x1',
        transactionIndex: '0x0',
        from: transaction.User_SemillaTransaction_fromIdToUser?.walletAddress || '0x0',
        to: transaction.User_SemillaTransaction_toIdToUser?.walletAddress || '0x0',
        value: '0x' + Math.floor(transaction.amount * 100).toString(16),
        gas: '0x5208', // 21000 in hex
        gasPrice: '0x0', // No gas in SEMILLA network
        input: '0x',
      };
    } catch (error) {
      this.logger.error('Error getting transaction:', error);
      return null;
    }
  }

  /**
   * RPC: eth_call
   * Execute a contract call (for ERC-20 token queries)
   */
  async ethCall(params: {
    to: string;
    data: string;
  }): Promise<string> {
    try {
      // Decode the function call
      const methodId = params.data.slice(0, 10);

      // ERC-20 balanceOf(address) = 0x70a08231
      if (methodId === '0x70a08231') {
        const address = '0x' + params.data.slice(-40);
        const balance = await this.ethGetBalance(address);
        // Pad to 32 bytes
        return balance.padStart(66, '0');
      }

      // ERC-20 totalSupply() = 0x18160ddd
      if (methodId === '0x18160ddd') {
        const totalSupply = await this.semillaService.getTotalSupply();
        const totalInUnits = Math.floor(totalSupply * 100);
        return '0x' + totalInUnits.toString(16).padStart(64, '0');
      }

      // ERC-20 decimals() = 0x313ce567
      if (methodId === '0x313ce567') {
        return '0x' + (2).toString(16).padStart(64, '0'); // 2 decimals
      }

      // ERC-20 symbol() = 0x95d89b41
      if (methodId === '0x95d89b41') {
        // Return "SEMILLA" encoded
        const symbol = 'SEMILLA';
        const encoded = Buffer.from(symbol).toString('hex');
        return '0x' + encoded.padStart(64, '0');
      }

      // ERC-20 name() = 0x06fdde03
      if (methodId === '0x06fdde03') {
        const name = 'Semilla Token';
        const encoded = Buffer.from(name).toString('hex');
        return '0x' + encoded.padStart(64, '0');
      }

      return '0x';
    } catch (error) {
      this.logger.error('Error in eth_call:', error);
      return '0x';
    }
  }

  /**
   * Get network configuration for MetaMask
   */
  getNetworkConfig() {
    return {
      chainId: this.CHAIN_ID,
      chainName: this.CHAIN_NAME,
      nativeCurrency: this.NATIVE_CURRENCY,
      rpcUrls: [process.env.PUBLIC_RPC_URL || 'http://localhost:4000/rpc'],
      blockExplorerUrls: [process.env.PUBLIC_EXPLORER_URL || 'http://localhost:3000/explorer'],
    };
  }

  /**
   * Get SEMILLA token configuration for adding to MetaMask
   */
  getTokenConfig() {
    return {
      type: 'ERC20',
      options: {
        address: this.SEMILLA_CONTRACT_ADDRESS,
        symbol: 'SEMILLA',
        decimals: 2,
        image: process.env.PUBLIC_URL + '/images/semilla-token.png',
      },
    };
  }
}
