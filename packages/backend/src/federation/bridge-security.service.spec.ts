import { Test, TestingModule } from '@nestjs/testing';
import { BridgeSecurityService } from './bridge-security.service';
import { PrismaService } from '../prisma/prisma.service';
import { BridgeChain } from './bridge.service';

describe('BridgeSecurityService', () => {
  let service: BridgeSecurityService;
  let prisma: PrismaService;

  const mockPrisma = {
    bridgeTransaction: {
      count: jest.fn(),
      aggregate: jest.fn(),
      findFirst: jest.fn(),
    },
    securityEvent: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    blacklist: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BridgeSecurityService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<BridgeSecurityService>(BridgeSecurityService);
    prisma = module.get<PrismaService>(PrismaService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkBridgeAllowed', () => {
    const userDID = 'did:gailu:node123:user456';
    const amount = 100;
    const targetChain = BridgeChain.POLYGON;
    const externalAddress = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';

    beforeEach(() => {
      // Mock default successful responses
      mockPrisma.bridgeTransaction.aggregate.mockResolvedValue({
        _sum: { amount: 0 },
        _count: 0,
      });
      mockPrisma.bridgeTransaction.findFirst.mockResolvedValue(null);
      mockPrisma.bridgeTransaction.count.mockResolvedValue(0);
    });

    it('should allow valid bridge transaction', async () => {
      const result = await service.checkBridgeAllowed(
        userDID,
        amount,
        targetChain,
        externalAddress,
      );

      expect(result.allowed).toBe(true);
    });

    it('should block when circuit breaker is open', async () => {
      await service.openCircuitBreaker('Testing');

      const result = await service.checkBridgeAllowed(
        userDID,
        amount,
        targetChain,
        externalAddress,
      );

      expect(result.allowed).toBe(false);
      expect(result.severity).toBe('CRITICAL');
      expect(result.reason).toContain('Bridge temporarily disabled');

      await service.closeCircuitBreaker();
    });

    it('should block blacklisted DID', async () => {
      await service.addToBlacklist('DID', userDID, 'Test blacklist');

      const result = await service.checkBridgeAllowed(
        userDID,
        amount,
        targetChain,
        externalAddress,
      );

      expect(result.allowed).toBe(false);
      expect(result.severity).toBe('HIGH');
      expect(result.reason).toContain('blacklisted');
    });

    it('should block blacklisted address', async () => {
      await service.addToBlacklist('ADDRESS', externalAddress, 'Test blacklist');

      const result = await service.checkBridgeAllowed(
        userDID,
        amount,
        targetChain,
        externalAddress,
      );

      expect(result.allowed).toBe(false);
      expect(result.severity).toBe('HIGH');
      expect(result.reason).toContain('blacklisted');
    });

    it('should block transactions exceeding maximum amount', async () => {
      const largeAmount = 100000; // Exceeds 50,000 limit

      const result = await service.checkBridgeAllowed(
        userDID,
        largeAmount,
        targetChain,
        externalAddress,
      );

      expect(result.allowed).toBe(false);
      expect(result.severity).toBe('MEDIUM');
      expect(result.reason).toContain('exceeds maximum');
    });

    it('should block when hourly rate limit exceeded', async () => {
      // Mock 10 transactions in last hour (limit is 10)
      mockPrisma.bridgeTransaction.aggregate
        .mockResolvedValueOnce({
          _sum: { amount: 1000 },
          _count: 11, // Exceeds limit
        })
        .mockResolvedValueOnce({
          _sum: { amount: 1000 },
          _count: 11,
        });

      const result = await service.checkBridgeAllowed(
        userDID,
        amount,
        targetChain,
        externalAddress,
      );

      expect(result.allowed).toBe(false);
      expect(result.severity).toBe('MEDIUM');
      expect(result.reason).toContain('Rate limit exceeded');
    });

    it('should block when hourly volume limit exceeded', async () => {
      // Mock volume exceeding limit
      mockPrisma.bridgeTransaction.aggregate
        .mockResolvedValueOnce({
          _sum: { amount: 9950 }, // Close to 10k limit
          _count: 5,
        })
        .mockResolvedValueOnce({
          _sum: { amount: 9950 },
          _count: 5,
        });

      const result = await service.checkBridgeAllowed(
        userDID,
        100, // Would exceed 10k
        targetChain,
        externalAddress,
      );

      expect(result.allowed).toBe(false);
      expect(result.severity).toBe('MEDIUM');
      expect(result.reason).toContain('Volume limit exceeded');
    });

    it('should block concurrent transactions', async () => {
      // Mock pending transaction
      mockPrisma.bridgeTransaction.count.mockResolvedValue(1);

      const result = await service.checkBridgeAllowed(
        userDID,
        amount,
        targetChain,
        externalAddress,
      );

      expect(result.allowed).toBe(false);
      expect(result.severity).toBe('HIGH');
      expect(result.reason).toContain('pending bridge transaction');
    });

    it('should allow transaction after time delay', async () => {
      // Mock last transaction was 2 minutes ago
      const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
      mockPrisma.bridgeTransaction.findFirst.mockResolvedValue({
        createdAt: twoMinutesAgo,
      });

      const result = await service.checkBridgeAllowed(
        userDID,
        amount,
        targetChain,
        externalAddress,
      );

      expect(result.allowed).toBe(true);
    });

    it('should block transaction within minimum time window', async () => {
      // Mock last transaction was 30 seconds ago
      const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
      mockPrisma.bridgeTransaction.findFirst.mockResolvedValue({
        createdAt: thirtySecondsAgo,
      });

      const result = await service.checkBridgeAllowed(
        userDID,
        amount,
        targetChain,
        externalAddress,
      );

      expect(result.allowed).toBe(false);
      expect(result.severity).toBe('LOW');
      expect(result.reason).toContain('wait at least 1 minute');
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit breaker', async () => {
      await service.openCircuitBreaker('Test emergency');

      const status = service.getCircuitBreakerStatus();
      expect(status.open).toBe(true);
      expect(status.reason).toBe('Test emergency');
    });

    it('should close circuit breaker', async () => {
      await service.openCircuitBreaker('Test');
      await service.closeCircuitBreaker();

      const status = service.getCircuitBreakerStatus();
      expect(status.open).toBe(false);
      expect(status.reason).toBe(null);
    });
  });

  describe('Blacklist Management', () => {
    it('should add DID to blacklist', async () => {
      const did = 'did:gailu:node123:user789';
      await service.addToBlacklist('DID', did, 'Test reason');

      expect(mockPrisma.blacklist.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'DID',
          value: did,
          reason: 'Test reason',
          active: true,
        }),
      });
    });

    it('should add address to blacklist (lowercase)', async () => {
      const address = '0xABCD1234';
      await service.addToBlacklist('ADDRESS', address, 'Test reason');

      expect(mockPrisma.blacklist.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'ADDRESS',
          value: address.toLowerCase(),
        }),
      });
    });

    it('should get blacklist entries', async () => {
      mockPrisma.blacklist.findMany.mockResolvedValue([
        { type: 'DID', value: 'did:gailu:test', active: true },
      ]);

      const entries = await service.getBlacklist('DID');
      expect(entries).toHaveLength(1);
      expect(mockPrisma.blacklist.findMany).toHaveBeenCalledWith({
        where: { active: true, type: 'DID' },
        orderBy: { addedAt: 'desc' },
      });
    });

    it('should remove from blacklist', async () => {
      mockPrisma.blacklist.update.mockResolvedValue({
        id: 'test-id',
        type: 'DID',
        value: 'did:gailu:test',
        active: false,
      });

      await service.removeFromBlacklist('test-id');

      expect(mockPrisma.blacklist.update).toHaveBeenCalledWith({
        where: { id: 'test-id' },
        data: expect.objectContaining({
          active: false,
        }),
      });
    });
  });

  describe('Security Statistics', () => {
    it('should get security stats', async () => {
      mockPrisma.securityEvent.count.mockResolvedValue(100);
      mockPrisma.blacklist.count.mockResolvedValue(5);
      mockPrisma.securityEvent.groupBy.mockResolvedValue([
        { severity: 'HIGH', _count: 10 },
      ]);

      const stats = await service.getSecurityStats();

      expect(stats).toHaveProperty('totalEvents');
      expect(stats).toHaveProperty('eventsLast24h');
      expect(stats).toHaveProperty('blacklistedDIDs');
      expect(stats).toHaveProperty('circuitBreaker');
    });

    it('should get recent security events', async () => {
      const mockEvents = [
        { id: '1', type: 'TEST_EVENT', severity: 'LOW' },
      ];
      mockPrisma.securityEvent.findMany.mockResolvedValue(mockEvents);

      const events = await service.getSecurityEvents(50);

      expect(events).toEqual(mockEvents);
      expect(mockPrisma.securityEvent.findMany).toHaveBeenCalledWith({
        take: 50,
        orderBy: { timestamp: 'desc' },
      });
    });
  });
});
