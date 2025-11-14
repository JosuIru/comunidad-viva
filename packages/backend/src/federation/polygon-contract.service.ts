import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';

/**
 * Polygon Contract Service
 *
 * Handles interaction with the WrappedSEMILLA ERC-20 contract on Polygon
 */
@Injectable()
export class PolygonContractService {
  private readonly logger = new Logger(PolygonContractService.name);
  private provider: ethers.JsonRpcProvider | null = null;
  private contract: ethers.Contract | null = null;
  private wallet: ethers.Wallet | null = null;

  // Contract ABI (only the functions we need)
  private readonly CONTRACT_ABI = [
    'function bridgeMint(address to, uint256 amount, string calldata gailuDID, bytes32 internalTxId) external',
    'function bridgeBurn(uint256 amount, string calldata gailuDID, bytes32 bridgeRequestId) external',
    'function balanceOf(address account) external view returns (uint256)',
    'function totalSupply() external view returns (uint256)',
    'function decimals() external view returns (uint8)',
    'event BridgeMint(address indexed to, uint256 amount, string gailuDID, bytes32 internalTxId)',
    'event BridgeBurn(address indexed from, uint256 amount, string gailuDID, bytes32 bridgeRequestId)',
  ];

  constructor() {
    this.initialize();
  }

  /**
   * Initialize connection to Polygon network
   */
  private initialize() {
    try {
      const rpcUrl = process.env.POLYGON_RPC_URL;
      const contractAddress = process.env.POLYGON_SEMILLA_CONTRACT;
      const privateKey = process.env.POLYGON_BRIDGE_PRIVATE_KEY;

      if (!rpcUrl || !contractAddress) {
        this.logger.warn('Polygon configuration missing. Bridge service will not work.');
        return;
      }

      // Setup provider
      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      // Setup contract
      this.contract = new ethers.Contract(
        contractAddress,
        this.CONTRACT_ABI,
        this.provider,
      );

      // Setup wallet if private key provided
      if (privateKey) {
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        // Connect contract with signer for transactions
        this.contract = this.contract.connect(this.wallet) as ethers.Contract;
        this.logger.log('Polygon bridge service initialized successfully');
      } else {
        this.logger.warn('No private key provided. Can only read from contract.');
      }
    } catch (error) {
      this.logger.error('Failed to initialize Polygon service:', error);
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.contract !== null && this.wallet !== null;
  }

  /**
   * Mint wSEMILLA tokens on Polygon
   */
  async mintTokens(
    recipientAddress: string,
    amount: number,
    gailuDID: string,
    internalTxId: string,
  ): Promise<{ txHash: string; blockNumber: number }> {
    if (!this.contract || !this.wallet) {
      throw new Error('Polygon service not initialized');
    }

    try {
      // Convert amount to smallest unit (2 decimals)
      const amountInUnits = Math.floor(amount * 100);

      // Convert internalTxId to bytes32
      const txIdBytes = ethers.id(internalTxId);

      this.logger.log(
        `Minting ${amount} wSEMILLA to ${recipientAddress} (${amountInUnits} units)`,
      );

      // Send transaction
      const tx = await this.contract.bridgeMint(
        recipientAddress,
        amountInUnits,
        gailuDID,
        txIdBytes,
      );

      // Wait for confirmation
      const receipt = await tx.wait();

      this.logger.log(
        `Minted successfully. TX: ${receipt.hash}, Block: ${receipt.blockNumber}`,
      );

      return {
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
      };
    } catch (error) {
      this.logger.error('Mint failed:', error);
      throw error;
    }
  }

  /**
   * Verify a burn transaction on Polygon
   */
  async verifyBurnTransaction(
    txHash: string,
  ): Promise<{
    valid: boolean;
    from: string;
    amount: number;
    gailuDID: string;
    bridgeRequestId: string;
  } | null> {
    if (!this.contract || !this.provider) {
      throw new Error('Polygon service not initialized');
    }

    try {
      // Get transaction receipt
      const receipt = await this.provider.getTransactionReceipt(txHash);

      if (!receipt) {
        this.logger.warn(`Transaction ${txHash} not found`);
        return null;
      }

      // Parse logs to find BridgeBurn event
      const iface = new ethers.Interface(this.CONTRACT_ABI);

      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog({
            topics: log.topics as string[],
            data: log.data,
          });

          if (parsed && parsed.name === 'BridgeBurn') {
            const amountInUnits = Number(parsed.args[1]);
            const amount = amountInUnits / 100; // Convert from units to SEMILLA

            return {
              valid: true,
              from: parsed.args[0],
              amount,
              gailuDID: parsed.args[2],
              bridgeRequestId: parsed.args[3],
            };
          }
        } catch (e) {
          // Not the log we're looking for, continue
        }
      }

      this.logger.warn(`No BridgeBurn event found in transaction ${txHash}`);
      return null;
    } catch (error) {
      this.logger.error('Verify burn failed:', error);
      throw error;
    }
  }

  /**
   * Get wSEMILLA balance for an address
   */
  async getBalance(address: string): Promise<number> {
    if (!this.contract) {
      throw new Error('Polygon service not initialized');
    }

    try {
      const balance = await this.contract.balanceOf(address);
      const balanceInUnits = Number(balance);
      return balanceInUnits / 100; // Convert to SEMILLA (2 decimals)
    } catch (error) {
      this.logger.error('Get balance failed:', error);
      return 0;
    }
  }

  /**
   * Get total wSEMILLA supply on Polygon
   */
  async getTotalSupply(): Promise<number> {
    if (!this.contract) {
      throw new Error('Polygon service not initialized');
    }

    try {
      const supply = await this.contract.totalSupply();
      const supplyInUnits = Number(supply);
      return supplyInUnits / 100; // Convert to SEMILLA
    } catch (error) {
      this.logger.error('Get total supply failed:', error);
      return 0;
    }
  }

  /**
   * Get network status
   */
  async getNetworkStatus(): Promise<{
    connected: boolean;
    chainId?: number;
    blockNumber?: number;
    gasPrice?: string;
  }> {
    if (!this.provider) {
      return { connected: false };
    }

    try {
      const [network, blockNumber, feeData] = await Promise.all([
        this.provider.getNetwork(),
        this.provider.getBlockNumber(),
        this.provider.getFeeData(),
      ]);

      return {
        connected: true,
        chainId: Number(network.chainId),
        blockNumber,
        gasPrice: feeData.gasPrice
          ? ethers.formatUnits(feeData.gasPrice, 'gwei')
          : undefined,
      };
    } catch (error) {
      this.logger.error('Get network status failed:', error);
      return { connected: false };
    }
  }

  /**
   * Estimate gas for minting
   */
  async estimateMintGas(
    recipientAddress: string,
    amount: number,
  ): Promise<{ gasLimit: string; estimatedCost: string }> {
    if (!this.contract || !this.wallet) {
      throw new Error('Polygon service not initialized');
    }

    try {
      const amountInUnits = Math.floor(amount * 100);
      const txIdBytes = ethers.id('test-tx-id');

      // Estimate gas
      const gasLimit = await this.contract.bridgeMint.estimateGas(
        recipientAddress,
        amountInUnits,
        'did:gailu:test',
        txIdBytes,
      );

      // Get current gas price
      const feeData = await this.provider!.getFeeData();
      const gasPriceWei = feeData.gasPrice || ethers.parseUnits('50', 'gwei');

      // Calculate total cost in MATIC
      const totalCostWei = gasLimit * gasPriceWei;
      const totalCostMatic = ethers.formatEther(totalCostWei);

      return {
        gasLimit: gasLimit.toString(),
        estimatedCost: totalCostMatic + ' MATIC',
      };
    } catch (error) {
      this.logger.error('Estimate gas failed:', error);
      throw error;
    }
  }
}
