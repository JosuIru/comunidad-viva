import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { PrismaService } from '../prisma/prisma.service';
import SemillaTokenABI from './abis/SemillaToken.abi.json';

export enum BlockchainNetwork {
  AMOY = 'amoy',
  POLYGON = 'polygon',
  BSC_TESTNET = 'bsc_testnet',
  BSC = 'bsc',
}

interface ContractAddresses {
  [BlockchainNetwork.AMOY]?: string;
  [BlockchainNetwork.POLYGON]?: string;
  [BlockchainNetwork.BSC_TESTNET]?: string;
  [BlockchainNetwork.BSC]?: string;
}

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private providers: Map<BlockchainNetwork, ethers.JsonRpcProvider> =
    new Map();
  private contracts: Map<BlockchainNetwork, ethers.Contract> = new Map();

  // Contract addresses (will be populated after deployment)
  private contractAddresses: ContractAddresses = {
    [BlockchainNetwork.AMOY]: process.env.SEMILLA_TOKEN_AMOY,
    [BlockchainNetwork.POLYGON]: process.env.SEMILLA_TOKEN_POLYGON,
    [BlockchainNetwork.BSC_TESTNET]: process.env.SEMILLA_TOKEN_BSC_TESTNET,
    [BlockchainNetwork.BSC]: process.env.SEMILLA_TOKEN_BSC,
  };

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('🔗 Initializing Blockchain Service...');
    await this.initializeProviders();
    await this.initializeContracts();
    await this.startEventListeners();
  }

  /**
   * Initialize RPC providers for each network
   */
  private async initializeProviders() {
    const networks = [
      {
        name: BlockchainNetwork.AMOY,
        rpcUrl:
          this.configService.get('AMOY_RPC_URL') ||
          'https://rpc-amoy.polygon.technology',
      },
      {
        name: BlockchainNetwork.POLYGON,
        rpcUrl:
          this.configService.get('POLYGON_RPC_URL') ||
          'https://polygon-rpc.com',
      },
      {
        name: BlockchainNetwork.BSC_TESTNET,
        rpcUrl:
          this.configService.get('BSC_TESTNET_RPC_URL') ||
          'https://data-seed-prebsc-1-s1.binance.org:8545',
      },
      {
        name: BlockchainNetwork.BSC,
        rpcUrl:
          this.configService.get('BSC_RPC_URL') ||
          'https://bsc-dataseed.binance.org',
      },
    ];

    for (const network of networks) {
      try {
        const provider = new ethers.JsonRpcProvider(network.rpcUrl);
        await provider.getNetwork(); // Test connection
        this.providers.set(network.name, provider);
        this.logger.log(`✅ Connected to ${network.name}`);
      } catch (error) {
        this.logger.warn(
          `⚠️  Failed to connect to ${network.name}: ${error.message}`,
        );
      }
    }
  }

  /**
   * Initialize contract instances
   */
  private async initializeContracts() {
    for (const [network, provider] of this.providers) {
      const address = this.contractAddresses[network];

      if (!address) {
        this.logger.warn(
          `⚠️  No contract address configured for ${network} (set SEMILLA_TOKEN_${network.toUpperCase()} in .env)`,
        );
        continue;
      }

      try {
        const contract = new ethers.Contract(
          address,
          SemillaTokenABI,
          provider,
        );

        // Verify contract exists
        const code = await provider.getCode(address);
        if (code === '0x') {
          throw new Error('No contract deployed at this address');
        }

        // Verify it's the correct contract
        const name = await contract.name();
        const symbol = await contract.symbol();

        this.contracts.set(network, contract);
        this.logger.log(
          `✅ ${network} contract initialized: ${name} (${symbol}) at ${address}`,
        );
      } catch (error) {
        this.logger.error(
          `❌ Failed to initialize ${network} contract: ${error.message}`,
        );
      }
    }
  }

  /**
   * Start listening to contract events
   */
  private async startEventListeners() {
    for (const [network, contract] of this.contracts) {
      this.logger.log(`👂 Starting event listeners for ${network}...`);

      // Listen for TokensMinted events
      contract.on(
        'TokensMinted',
        async (to: string, amount: bigint, minter: string, event: any) => {
          await this.handleTokensMinted(network, to, amount, minter, event);
        },
      );

      // Listen for TokensBurned events
      contract.on(
        'TokensBurned',
        async (from: string, amount: bigint, event: any) => {
          await this.handleTokensBurned(network, from, amount, event);
        },
      );

      // Listen for EmergencyPause events
      contract.on(
        'EmergencyPause',
        async (pauser: string, reason: string, event: any) => {
          await this.handleEmergencyPause(network, pauser, reason, event);
        },
      );

      // Listen for EmergencyUnpause events
      contract.on('EmergencyUnpause', async (unpauser: string, event: any) => {
        await this.handleEmergencyUnpause(network, unpauser, event);
      });

      this.logger.log(`✅ Event listeners active for ${network}`);
    }
  }

  /**
   * Handle TokensMinted event
   */
  private async handleTokensMinted(
    network: BlockchainNetwork,
    to: string,
    amount: bigint,
    minter: string,
    event: any,
  ) {
    this.logger.log(
      `💰 TokensMinted on ${network}: ${ethers.formatEther(amount)} SEMILLA to ${to}`,
    );

    try {
      // Find corresponding bridge transaction
      // Convert network name to BridgeChain enum value
      const chainMap = {
        [BlockchainNetwork.AMOY]: 'POLYGON',
        [BlockchainNetwork.POLYGON]: 'POLYGON',
        [BlockchainNetwork.BSC_TESTNET]: 'BSC',
        [BlockchainNetwork.BSC]: 'BSC',
      };

      const transaction = await this.prisma.bridgeTransaction.findFirst({
        where: {
          targetChain: chainMap[network] as any,
          externalAddress: to.toLowerCase(),
          status: 'PENDING',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (transaction) {
        // Update transaction status
        await this.prisma.bridgeTransaction.update({
          where: { id: transaction.id },
          data: {
            status: 'MINTED',
            externalTxHash: event.log.transactionHash,
            completedAt: new Date(),
          },
        });

        this.logger.log(
          `✅ Bridge transaction ${transaction.id} marked as MINTED`,
        );
      } else {
        this.logger.warn(
          `⚠️  No pending transaction found for mint to ${to} on ${network}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `❌ Error handling TokensMinted event: ${error.message}`,
      );
    }
  }

  /**
   * Handle TokensBurned event (reverse bridge)
   */
  private async handleTokensBurned(
    network: BlockchainNetwork,
    from: string,
    amount: bigint,
    event: any,
  ) {
    this.logger.log(
      `🔥 TokensBurned on ${network}: ${ethers.formatEther(amount)} SEMILLA from ${from}`,
    );

    try {
      // TODO: Implement reverse bridge logic
      // This would unlock SEMILLA on Gailu Chain when tokens are burned on external chain
      this.logger.log(
        `⚠️  Reverse bridge not yet implemented. Tokens burned: ${ethers.formatEther(amount)}`,
      );
    } catch (error) {
      this.logger.error(
        `❌ Error handling TokensBurned event: ${error.message}`,
      );
    }
  }

  /**
   * Handle EmergencyPause event
   */
  private async handleEmergencyPause(
    network: BlockchainNetwork,
    pauser: string,
    reason: string,
    event: any,
  ) {
    this.logger.error(
      `🚨 EMERGENCY PAUSE on ${network} by ${pauser}: ${reason}`,
    );

    try {
      // Log security event
      await this.prisma.securityEvent.create({
        data: {
          type: 'CONTRACT_PAUSED',
          severity: 'CRITICAL',
          details: {
            network,
            pauser,
            reason,
            txHash: event.log.transactionHash,
            blockNumber: event.log.blockNumber,
          },
        },
      });

      // TODO: Send alert notifications (email, Discord, etc)
    } catch (error) {
      this.logger.error(
        `❌ Error handling EmergencyPause event: ${error.message}`,
      );
    }
  }

  /**
   * Handle EmergencyUnpause event
   */
  private async handleEmergencyUnpause(
    network: BlockchainNetwork,
    unpauser: string,
    event: any,
  ) {
    this.logger.log(
      `✅ Emergency unpause on ${network} by ${unpauser}`,
    );

    try {
      await this.prisma.securityEvent.create({
        data: {
          type: 'CONTRACT_UNPAUSED',
          severity: 'HIGH',
          details: {
            network,
            unpauser,
            txHash: event.log.transactionHash,
            blockNumber: event.log.blockNumber,
          },
        },
      });
    } catch (error) {
      this.logger.error(
        `❌ Error handling EmergencyUnpause event: ${error.message}`,
      );
    }
  }

  /**
   * Get contract for a specific network
   */
  getContract(network: BlockchainNetwork): ethers.Contract | null {
    return this.contracts.get(network) || null;
  }

  /**
   * Get provider for a specific network
   */
  getProvider(network: BlockchainNetwork): ethers.JsonRpcProvider | null {
    return this.providers.get(network) || null;
  }

  /**
   * Check if contract is paused
   */
  async isContractPaused(network: BlockchainNetwork): Promise<boolean> {
    const contract = this.getContract(network);
    if (!contract) {
      throw new Error(`No contract found for network: ${network}`);
    }

    try {
      return await contract.paused();
    } catch (error) {
      this.logger.error(
        `Error checking pause status for ${network}: ${error.message}`,
      );
      return true; // Fail safe: assume paused if we can't check
    }
  }

  /**
   * Get token balance of an address
   */
  async getBalance(
    network: BlockchainNetwork,
    address: string,
  ): Promise<string> {
    const contract = this.getContract(network);
    if (!contract) {
      throw new Error(`No contract found for network: ${network}`);
    }

    const balance = await contract.balanceOf(address);
    return ethers.formatEther(balance);
  }

  /**
   * Get total supply of tokens
   */
  async getTotalSupply(network: BlockchainNetwork): Promise<string> {
    const contract = this.getContract(network);
    if (!contract) {
      throw new Error(`No contract found for network: ${network}`);
    }

    const supply = await contract.totalSupply();
    return ethers.formatEther(supply);
  }

  /**
   * Get remaining mintable supply
   */
  async getRemainingMintableSupply(network: BlockchainNetwork): Promise<string> {
    const contract = this.getContract(network);
    if (!contract) {
      throw new Error(`No contract found for network: ${network}`);
    }

    const remaining = await contract.getRemainingMintableSupply();
    return ethers.formatEther(remaining);
  }
}
