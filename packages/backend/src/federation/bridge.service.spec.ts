import { Test, TestingModule } from '@nestjs/testing';
import { BridgeService, BridgeChain } from './bridge.service';
import { PrismaService } from '../prisma/prisma.service';
import { SemillaService } from './semilla.service';
import { DIDService } from './did.service';
import { BadRequestException } from '@nestjs/common';

describe('BridgeService', () => {
  let service: BridgeService;
  let prisma: PrismaService;
  let semillaService: SemillaService;
  let didService: DIDService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    semillaTransaction: {
      create: jest.fn(),
    },
    bridgeTransaction: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockSemillaService = {
    // Mock any methods if needed
  };

  const mockDIDService = {
    parseDID: jest.fn(),
    isLocalDID: jest.fn(),
    getNodeId: jest.fn().mockReturnValue('node-1'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BridgeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SemillaService,
          useValue: mockSemillaService,
        },
        {
          provide: DIDService,
          useValue: mockDIDService,
        },
      ],
    }).compile();

    service = module.get<BridgeService>(BridgeService);
    prisma = module.get<PrismaService>(PrismaService);
    semillaService = module.get<SemillaService>(SemillaService);
    didService = module.get<DIDService>(DIDService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('lockAndBridge', () => {
    it('should lock SEMILLA and prepare for bridging to Polygon', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';
      const amount = 100;
      const targetChain = BridgeChain.POLYGON;
      const externalAddress = '0x1234567890abcdef';

      // Mock DID parsing
      mockDIDService.parseDID.mockReturnValue({
        method: 'gailu',
        nodeId: 'node-1',
        entityType: 'user',
        userId: 'user-id',
      });
      mockDIDService.isLocalDID.mockReturnValue(true);

      // Mock user with sufficient balance
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: 'user-id',
        semillaBalance: 200,
      });

      // Mock transaction
      const mockBridgeTx = {
        id: 'bridge-tx-id',
        userId: 'user-id',
        userDID,
        amount,
        fee: 0.5,
        direction: 'LOCK',
        targetChain,
        externalAddress,
        status: 'LOCKED',
        internalTxId: 'internal-tx-id',
        createdAt: new Date(),
      };

      mockPrismaService.$transaction.mockResolvedValue(mockBridgeTx);

      const result = await service.lockAndBridge(
        userDID,
        amount,
        targetChain,
        externalAddress,
      );

      expect(result).toBeDefined();
      expect(result.amount).toBe(amount);
      expect(result.direction).toBe('LOCK');
      expect(result.targetChain).toBe(targetChain);
      expect(result.status).toBe('LOCKED');
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should lock SEMILLA and prepare for bridging to Solana', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';
      const amount = 50;
      const targetChain = BridgeChain.SOLANA;
      const externalAddress = 'solana-address-123';

      mockDIDService.parseDID.mockReturnValue({
        userId: 'user-id',
      });
      mockDIDService.isLocalDID.mockReturnValue(true);

      mockPrismaService.User.findUnique.mockResolvedValue({
        id: 'user-id',
        semillaBalance: 100,
      });

      const mockBridgeTx = {
        id: 'bridge-tx-id',
        userId: 'user-id',
        userDID,
        amount,
        fee: 0.1,
        direction: 'LOCK',
        targetChain,
        externalAddress,
        status: 'LOCKED',
        internalTxId: 'internal-tx-id',
        createdAt: new Date(),
      };

      mockPrismaService.$transaction.mockResolvedValue(mockBridgeTx);

      const result = await service.lockAndBridge(
        userDID,
        amount,
        targetChain,
        externalAddress,
      );

      expect(result).toBeDefined();
      expect(result.targetChain).toBe(BridgeChain.SOLANA);
      expect(result.status).toBe('LOCKED');
    });

    it('should throw BadRequestException for unsupported chain', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';
      const amount = 100;
      const targetChain = 'ETHEREUM' as BridgeChain; // Unsupported
      const externalAddress = '0x123';

      await expect(
        service.lockAndBridge(userDID, amount, targetChain, externalAddress),
      ).rejects.toThrow('Chain ETHEREUM not supported');
    });

    it('should throw BadRequestException if amount below minimum for Polygon', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';
      const amount = 5; // Less than 10 minimum
      const targetChain = BridgeChain.POLYGON;
      const externalAddress = '0x123';

      await expect(
        service.lockAndBridge(userDID, amount, targetChain, externalAddress),
      ).rejects.toThrow('Minimum bridge amount is 10 SEMILLA');
    });

    it('should throw BadRequestException if amount below minimum for Solana', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';
      const amount = 0.5; // Less than 1 minimum
      const targetChain = BridgeChain.SOLANA;
      const externalAddress = 'solana-123';

      await expect(
        service.lockAndBridge(userDID, amount, targetChain, externalAddress),
      ).rejects.toThrow('Minimum bridge amount is 1 SEMILLA');
    });

    it('should throw BadRequestException for invalid DID', async () => {
      const userDID = 'invalid-did';
      const amount = 100;
      const targetChain = BridgeChain.POLYGON;
      const externalAddress = '0x123';

      mockDIDService.parseDID.mockReturnValue(null);

      await expect(
        service.lockAndBridge(userDID, amount, targetChain, externalAddress),
      ).rejects.toThrow('Invalid or non-local user DID');
    });

    it('should throw BadRequestException for non-local DID', async () => {
      const userDID = 'did:gailu:remote-node:user:user-id';
      const amount = 100;
      const targetChain = BridgeChain.POLYGON;
      const externalAddress = '0x123';

      mockDIDService.parseDID.mockReturnValue({
        userId: 'user-id',
      });
      mockDIDService.isLocalDID.mockReturnValue(false); // Not local

      await expect(
        service.lockAndBridge(userDID, amount, targetChain, externalAddress),
      ).rejects.toThrow('Invalid or non-local user DID');
    });

    it('should throw BadRequestException if user not found', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';
      const amount = 100;
      const targetChain = BridgeChain.POLYGON;
      const externalAddress = '0x123';

      mockDIDService.parseDID.mockReturnValue({ userId: 'user-id' });
      mockDIDService.isLocalDID.mockReturnValue(true);

      mockPrismaService.User.findUnique.mockResolvedValue(null);

      await expect(
        service.lockAndBridge(userDID, amount, targetChain, externalAddress),
      ).rejects.toThrow('User not found');
    });

    it('should throw BadRequestException if insufficient balance', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';
      const amount = 100;
      const targetChain = BridgeChain.POLYGON;
      const externalAddress = '0x123';

      mockDIDService.parseDID.mockReturnValue({ userId: 'user-id' });
      mockDIDService.isLocalDID.mockReturnValue(true);

      mockPrismaService.User.findUnique.mockResolvedValue({
        id: 'user-id',
        semillaBalance: 50, // Not enough for 100 + 0.5 fee
      });

      await expect(
        service.lockAndBridge(userDID, amount, targetChain, externalAddress),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.lockAndBridge(userDID, amount, targetChain, externalAddress),
      ).rejects.toThrow('Insufficient balance');
    });
  });

  describe('burnAndUnlock', () => {
    it('should unlock SEMILLA after burning on external chain', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';
      const amount = 100;
      const sourceChain = BridgeChain.POLYGON;
      const externalTxHash = '0xabcdef1234567890';

      mockDIDService.parseDID.mockReturnValue({ userId: 'user-id' });
      mockDIDService.isLocalDID.mockReturnValue(true);

      // Mock verification succeeds
      jest.spyOn(service as any, 'verifyExternalBurn').mockResolvedValue(true);

      // Mock no existing transaction
      mockPrismaService.bridgeTransaction.findFirst.mockResolvedValue(null);

      const mockBridgeTx = {
        id: 'bridge-tx-id',
        userId: 'user-id',
        userDID,
        amount,
        fee: 0.5,
        direction: 'UNLOCK',
        targetChain: sourceChain,
        externalAddress: '',
        externalTxHash,
        status: 'UNLOCKED',
        internalTxId: 'internal-tx-id',
        createdAt: new Date(),
        completedAt: new Date(),
      };

      mockPrismaService.$transaction.mockResolvedValue(mockBridgeTx);

      const result = await service.burnAndUnlock(
        userDID,
        amount,
        sourceChain,
        externalTxHash,
      );

      expect(result).toBeDefined();
      expect(result.direction).toBe('UNLOCK');
      expect(result.status).toBe('UNLOCKED');
      expect(result.externalTxHash).toBe(externalTxHash);
    });

    it('should throw BadRequestException for unsupported chain', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';
      const amount = 100;
      const sourceChain = 'ETHEREUM' as BridgeChain;
      const externalTxHash = '0xabc';

      await expect(
        service.burnAndUnlock(userDID, amount, sourceChain, externalTxHash),
      ).rejects.toThrow('Chain ETHEREUM not supported');
    });

    it('should throw BadRequestException for invalid DID', async () => {
      const userDID = 'invalid-did';
      const amount = 100;
      const sourceChain = BridgeChain.POLYGON;
      const externalTxHash = '0xabc';

      mockDIDService.parseDID.mockReturnValue(null);

      await expect(
        service.burnAndUnlock(userDID, amount, sourceChain, externalTxHash),
      ).rejects.toThrow('Invalid or non-local user DID');
    });

    it('should throw BadRequestException if external burn not verified', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';
      const amount = 100;
      const sourceChain = BridgeChain.POLYGON;
      const externalTxHash = '0xabc';

      mockDIDService.parseDID.mockReturnValue({ userId: 'user-id' });
      mockDIDService.isLocalDID.mockReturnValue(true);

      // Mock verification fails
      jest
        .spyOn(service as any, 'verifyExternalBurn')
        .mockResolvedValue(false);

      await expect(
        service.burnAndUnlock(userDID, amount, sourceChain, externalTxHash),
      ).rejects.toThrow('External burn transaction not verified');
    });

    it('should throw BadRequestException if transaction already processed', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';
      const amount = 100;
      const sourceChain = BridgeChain.POLYGON;
      const externalTxHash = '0xabc';

      mockDIDService.parseDID.mockReturnValue({ userId: 'user-id' });
      mockDIDService.isLocalDID.mockReturnValue(true);

      jest.spyOn(service as any, 'verifyExternalBurn').mockResolvedValue(true);

      // Mock existing transaction
      mockPrismaService.bridgeTransaction.findFirst.mockResolvedValue({
        id: 'existing-tx',
        externalTxHash,
        direction: 'UNLOCK',
      });

      await expect(
        service.burnAndUnlock(userDID, amount, sourceChain, externalTxHash),
      ).rejects.toThrow('Transaction already processed');
    });
  });

  describe('getBridgeTransaction', () => {
    it('should return bridge transaction by ID', async () => {
      const txId = 'bridge-tx-id';

      const mockTx = {
        id: txId,
        userId: 'user-id',
        userDID: 'did:gailu:node-1:user:user-id',
        amount: 100,
        fee: 0.5,
        direction: 'LOCK',
        targetChain: BridgeChain.POLYGON,
        externalAddress: '0x123',
        status: 'LOCKED',
        internalTxId: 'internal-tx-id',
        createdAt: new Date(),
      };

      mockPrismaService.bridgeTransaction.findUnique.mockResolvedValue(mockTx);

      const result = await service.getBridgeTransaction(txId);

      expect(result).toBeDefined();
      expect(result?.id).toBe(txId);
      expect(result?.amount).toBe(100);
    });

    it('should return null if transaction not found', async () => {
      const txId = 'non-existent-id';

      mockPrismaService.bridgeTransaction.findUnique.mockResolvedValue(null);

      const result = await service.getBridgeTransaction(txId);

      expect(result).toBeNull();
    });
  });

  describe('getUserBridgeHistory', () => {
    it('should return user bridge transaction history', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';

      const mockTransactions = [
        {
          id: 'tx-1',
          userId: 'user-id',
          userDID,
          amount: 100,
          fee: 0.5,
          direction: 'LOCK',
          targetChain: BridgeChain.POLYGON,
          externalAddress: '0x123',
          status: 'LOCKED',
          createdAt: new Date(),
        },
        {
          id: 'tx-2',
          userId: 'user-id',
          userDID,
          amount: 50,
          fee: 0.5,
          direction: 'UNLOCK',
          targetChain: BridgeChain.POLYGON,
          externalAddress: '0x123',
          status: 'UNLOCKED',
          createdAt: new Date(),
        },
      ];

      mockPrismaService.bridgeTransaction.findMany.mockResolvedValue(
        mockTransactions,
      );

      const result = await service.getUserBridgeHistory(userDID);

      expect(result).toHaveLength(2);
      expect(result[0].direction).toBe('LOCK');
      expect(result[1].direction).toBe('UNLOCK');
    });

    it('should respect limit parameter', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';

      mockPrismaService.bridgeTransaction.findMany.mockResolvedValue([]);

      await service.getUserBridgeHistory(userDID, 10);

      expect(mockPrismaService.bridgeTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        }),
      );
    });

    it('should use default limit of 50', async () => {
      const userDID = 'did:gailu:node-1:user:user-id';

      mockPrismaService.bridgeTransaction.findMany.mockResolvedValue([]);

      await service.getUserBridgeHistory(userDID);

      expect(mockPrismaService.bridgeTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        }),
      );
    });
  });

  describe('getBridgeStats', () => {
    it('should return comprehensive bridge statistics', async () => {
      mockPrismaService.bridgeTransaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 10000 } }) // totalBridged
        .mockResolvedValueOnce({ _sum: { amount: 6000 } }) // totalLocked
        .mockResolvedValueOnce({ _sum: { amount: 4000 } }); // totalUnlocked

      mockPrismaService.bridgeTransaction.groupBy.mockResolvedValue([
        {
          targetChain: BridgeChain.POLYGON,
          _sum: { amount: 7000 },
          _count: 50,
        },
        {
          targetChain: BridgeChain.SOLANA,
          _sum: { amount: 3000 },
          _count: 30,
        },
      ]);

      const result = await service.getBridgeStats();

      expect(result).toBeDefined();
      expect(result.totalBridged).toBe(10000);
      expect(result.totalLocked).toBe(6000);
      expect(result.totalUnlocked).toBe(4000);
      expect(result.byChain).toHaveLength(2);
      expect(result.byChain[0].chain).toBe(BridgeChain.POLYGON);
      expect(result.byChain[0].totalAmount).toBe(7000);
      expect(result.byChain[0].transactionCount).toBe(50);
    });

    it('should handle zero amounts', async () => {
      mockPrismaService.bridgeTransaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: null } })
        .mockResolvedValueOnce({ _sum: { amount: null } })
        .mockResolvedValueOnce({ _sum: { amount: null } });

      mockPrismaService.bridgeTransaction.groupBy.mockResolvedValue([]);

      const result = await service.getBridgeStats();

      expect(result.totalBridged).toBe(0);
      expect(result.totalLocked).toBe(0);
      expect(result.totalUnlocked).toBe(0);
      expect(result.byChain).toEqual([]);
    });
  });

  describe('getSupportedChains', () => {
    it('should return list of supported chains with configuration', () => {
      const chains = service.getSupportedChains();

      expect(chains).toBeDefined();
      expect(chains.length).toBeGreaterThan(0);

      const polygonChain = chains.find((c) => c.chain === BridgeChain.POLYGON);
      expect(polygonChain).toBeDefined();
      expect(polygonChain?.minAmount).toBe(10);
      expect(polygonChain?.fee).toBe(0.5);

      const solanaChain = chains.find((c) => c.chain === BridgeChain.SOLANA);
      expect(solanaChain).toBeDefined();
      expect(solanaChain?.minAmount).toBe(1);
      expect(solanaChain?.fee).toBe(0.1);
    });
  });
});
