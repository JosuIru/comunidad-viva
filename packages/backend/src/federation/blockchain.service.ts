import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';
import { PrismaService } from '../prisma/prisma.service';
import SemillaTokenABI from './abis/SemillaToken.abi.json';
import { randomUUID } from 'crypto';
import { BridgeService, BridgeChain } from './bridge.service';
import { NotificationService } from './notification.service';

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
    @Inject(forwardRef(() => BridgeService))
    private bridgeService: BridgeService,
    private notificationService: NotificationService,
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
    const amountFormatted = ethers.formatEther(amount);
    const txHash = event.log.transactionHash;

    this.logger.log(
      `🔥 TokensBurned on ${network}: ${amountFormatted} SEMILLA from ${from}`,
    );

    try {
      // Map network to BridgeChain
      const chainMap: Record<BlockchainNetwork, BridgeChain | null> = {
        [BlockchainNetwork.AMOY]: BridgeChain.POLYGON, // Amoy is Polygon testnet
        [BlockchainNetwork.POLYGON]: BridgeChain.POLYGON,
        [BlockchainNetwork.BSC_TESTNET]: null, // Not supported yet
        [BlockchainNetwork.BSC]: null, // Not supported yet
      };

      const bridgeChain = chainMap[network];
      if (!bridgeChain) {
        this.logger.warn(`⚠️ Chain ${network} not supported for bridge unlock`);
        return;
      }

      // Find the pending LOCK transaction for this burn
      const pendingBridge = await this.prisma.bridgeTransaction.findFirst({
        where: {
          externalAddress: from.toLowerCase(),
          targetChain: bridgeChain,
          status: { in: ['LOCKED', 'MINTED'] },
          direction: 'LOCK',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!pendingBridge) {
        // This might be a direct burn without a lock (user initiated unlock)
        this.logger.log(
          `ℹ️ No pending bridge found for burn from ${from}. This may be a user-initiated unlock.`,
        );

        // Log the event for manual review
        await this.prisma.security_events.create({
          data: {
            id: randomUUID(),
            type: 'BRIDGE_BURN_NO_LOCK',
            severity: 'INFO',
            details: {
              network,
              from,
              amount: amountFormatted,
              txHash,
              blockNumber: event.log.blockNumber,
            },
          },
        });
        return;
      }

      // Process the unlock
      this.logger.log(
        `🔓 Processing reverse bridge unlock for user ${pendingBridge.userDID}`,
      );

      // Update bridge transaction with burn info and mark for unlock
      await this.prisma.bridgeTransaction.update({
        where: { id: pendingBridge.id },
        data: {
          status: 'BURNED',
          externalTxHash: txHash,
        },
      });

      // Call the bridge service to complete the unlock
      const unlockResult = await this.bridgeService.burnAndUnlock(
        pendingBridge.userDID,
        parseFloat(amountFormatted),
        bridgeChain,
        txHash,
      );

      this.logger.log(
        `✅ Reverse bridge completed! Unlocked ${amountFormatted} SEMILLA for ${pendingBridge.userDID} (tx: ${unlockResult.id})`,
      );

      // Log successful unlock event
      await this.prisma.security_events.create({
        data: {
          id: randomUUID(),
          type: 'BRIDGE_UNLOCK_SUCCESS',
          severity: 'INFO',
          details: {
            network,
            from,
            userDID: pendingBridge.userDID,
            amount: amountFormatted,
            txHash,
            bridgeTxId: unlockResult.id,
          },
        },
      });

    } catch (error) {
      this.logger.error(
        `❌ Error handling TokensBurned event: ${error.message}`,
      );

      // Log error event
      await this.prisma.security_events.create({
        data: {
          id: randomUUID(),
          type: 'BRIDGE_UNLOCK_FAILED',
          severity: 'ERROR',
          details: {
            network,
            from,
            amount: amountFormatted,
            txHash: event.log.transactionHash,
            error: error.message,
          },
        },
      });
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
      await this.prisma.security_events.create({
        data: {
          id: randomUUID(),
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

      // Send alert notifications
      await this.notificationService.sendEmergencyPauseAlert(
        network,
        pauser,
        reason,
        event.log.transactionHash,
      );
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
      await this.prisma.security_events.create({
        data: {
          id: randomUUID(),
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

      // Send alert notification
      await this.notificationService.sendEmergencyUnpauseAlert(
        network,
        unpauser,
        event.log.transactionHash,
      );
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
