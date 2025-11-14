import { Test, TestingModule } from '@nestjs/testing';
import { BridgesService } from '../bridges.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BridgeType } from '@prisma/client';

describe('BridgesService', () => {
  let service: BridgesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    community: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    communityBridge: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    user: {
      count: jest.fn(),
    },
    offer: {
      count: jest.fn(),
    },
    event: {
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BridgesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BridgesService>(BridgesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateGeographicDistance', () => {
    it('should calculate distance using Haversine formula', () => {
      // Madrid to Barcelona: ~500km
      const madrid = { lat: 40.4168, lng: -3.7038 };
      const barcelona = { lat: 41.3851, lng: 2.1734 };

      const distance = service['calculateGeographicDistance'](
        madrid.lat,
        madrid.lng,
        barcelona.lat,
        barcelona.lng,
      );

      expect(distance).toBeGreaterThan(500);
      expect(distance).toBeLessThan(550);
    });

    it('should return 0 for same location', () => {
      const distance = service['calculateGeographicDistance'](
        40.4168,
        -3.7038,
        40.4168,
        -3.7038,
      );

      expect(distance).toBe(0);
    });
  });

  describe('areGeographicallyClose', () => {
    it('should return true for communities within 50km', () => {
      const communityA = { lat: 40.4168, lng: -3.7038 }; // Madrid
      const communityB = { lat: 40.5, lng: -3.6 }; // Cerca de Madrid

      const result = service['areGeographicallyClose'](communityA, communityB);

      expect(result).toBe(true);
    });

    it('should return false for communities beyond 50km', () => {
      const communityA = { lat: 40.4168, lng: -3.7038 }; // Madrid
      const communityB = { lat: 41.3851, lng: 2.1734 }; // Barcelona

      const result = service['areGeographicallyClose'](communityA, communityB);

      expect(result).toBe(false);
    });

    it('should return false if coordinates are missing', () => {
      const communityA = { lat: null, lng: null };
      const communityB = { lat: 40.4168, lng: -3.7038 };

      const result = service['areGeographicallyClose'](communityA, communityB);

      expect(result).toBe(false);
    });
  });

  describe('calculateGeographicStrength', () => {
    it('should return 1.0 for very close communities (<5km)', () => {
      const communityA = { lat: 40.4168, lng: -3.7038 };
      const communityB = { lat: 40.42, lng: -3.70 }; // ~1km

      const strength = service['calculateGeographicStrength'](communityA, communityB);

      expect(strength).toBeGreaterThan(0.9);
      expect(strength).toBeLessThanOrEqual(1.0);
    });

    it('should return lower strength for distant communities', () => {
      const communityA = { lat: 40.4168, lng: -3.7038 };
      const communityB = { lat: 40.6, lng: -3.5 }; // ~30km

      const strength = service['calculateGeographicStrength'](communityA, communityB);

      expect(strength).toBeLessThan(0.5);
      expect(strength).toBeGreaterThan(0);
    });
  });

  describe('getSharedMembersCount', () => {
    it('should count users who belong to both communities', async () => {
      mockPrismaService.user.count.mockResolvedValue(3);

      const count = await service['getSharedMembersCount']('comm-a', 'comm-b');

      expect(count).toBe(3);
      expect(mockPrismaService.user.count).toHaveBeenCalled();
    });
  });

  describe('createOrUpdateBridge', () => {
    it('should create new bridge if it does not exist', async () => {
      mockPrismaService.communityBridge.findFirst.mockResolvedValue(null);
      mockPrismaService.communityBridge.create.mockResolvedValue({
        id: 'bridge-123',
      });

      const result = await service['createOrUpdateBridge'](
        'comm-a',
        'comm-b',
        BridgeType.GEOGRAPHIC,
        0.8,
        0,
      );

      expect(result).toBe('created');
      expect(mockPrismaService.communityBridge.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          sourceCommunityId: 'comm-a',
          targetCommunityId: 'comm-b',
          bridgeType: BridgeType.GEOGRAPHIC,
          strength: 0.8,
          sharedMembers: 0,
          status: 'ACTIVE',
        }),
      });
    });

    it('should update existing bridge', async () => {
      const existingBridge = {
        id: 'bridge-123',
        strength: 0.5,
      };

      mockPrismaService.communityBridge.findFirst.mockResolvedValue(existingBridge);
      mockPrismaService.communityBridge.update.mockResolvedValue({
        ...existingBridge,
        strength: 0.8,
      });

      const result = await service['createOrUpdateBridge'](
        'comm-a',
        'comm-b',
        BridgeType.GEOGRAPHIC,
        0.8,
        0,
      );

      expect(result).toBe('updated');
      expect(mockPrismaService.communityBridge.update).toHaveBeenCalledWith({
        where: { id: existingBridge.id },
        data: expect.objectContaining({
          strength: 0.8,
        }),
      });
    });
  });

  describe('detectBridges', () => {
    it('should detect geographic bridge', async () => {
      const communityA = {
        id: 'comm-a',
        lat: 40.4168,
        lng: -3.7038,
        users: [],
        onboardingPack: null,
        events: [],
      };

      const communityB = {
        id: 'comm-b',
        lat: 40.45,
        lng: -3.70,
        users: [],
        onboardingPack: null,
        events: [],
      };

      mockPrismaService.community.findUnique
        .mockResolvedValueOnce(communityA)
        .mockResolvedValueOnce(communityB);

      mockPrismaService.communityBridge.findFirst.mockResolvedValue(null);
      mockPrismaService.communityBridge.create.mockResolvedValue({});
      mockPrismaService.user.count.mockResolvedValue(0);
      mockPrismaService.Offer.count.mockResolvedValue(0);
      mockPrismaService.event.count.mockResolvedValue(0);

      const result = await service.detectBridgesBetween('comm-a', 'comm-b');

      expect(result.detected).toBeGreaterThan(0);
      expect(mockPrismaService.communityBridge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            bridgeType: BridgeType.GEOGRAPHIC,
          }),
        }),
      );
    });

    it('should detect thematic bridge for same pack type', async () => {
      const communityA = {
        id: 'comm-a',
        lat: null,
        lng: null,
        users: [],
        onboardingPack: { packType: 'CONSUMER_GROUP' },
        events: [],
      };

      const communityB = {
        id: 'comm-b',
        lat: null,
        lng: null,
        users: [],
        onboardingPack: { packType: 'CONSUMER_GROUP' },
        events: [],
      };

      mockPrismaService.community.findUnique
        .mockResolvedValueOnce(communityA)
        .mockResolvedValueOnce(communityB);

      mockPrismaService.communityBridge.findFirst.mockResolvedValue(null);
      mockPrismaService.communityBridge.create.mockResolvedValue({});
      mockPrismaService.user.count.mockResolvedValue(0);
      mockPrismaService.Offer.count.mockResolvedValue(0);
      mockPrismaService.event.count.mockResolvedValue(0);

      const result = await service.detectBridgesBetween('comm-a', 'comm-b');

      expect(result.detected).toBeGreaterThan(0);
      expect(mockPrismaService.communityBridge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            bridgeType: BridgeType.THEMATIC,
          }),
        }),
      );
    });

    it('should detect spontaneous bridge for shared members', async () => {
      const communityA = {
        id: 'comm-a',
        lat: null,
        lng: null,
        users: [{ id: '1' }, { id: '2' }],
        onboardingPack: null,
        events: [],
      };

      const communityB = {
        id: 'comm-b',
        lat: null,
        lng: null,
        users: [{ id: '3' }, { id: '4' }],
        onboardingPack: null,
        events: [],
      };

      mockPrismaService.community.findUnique
        .mockResolvedValueOnce(communityA)
        .mockResolvedValueOnce(communityB);

      mockPrismaService.communityBridge.findFirst.mockResolvedValue(null);
      mockPrismaService.communityBridge.create.mockResolvedValue({});
      mockPrismaService.user.count.mockResolvedValue(1); // 1 miembro compartido
      mockPrismaService.Offer.count.mockResolvedValue(0);
      mockPrismaService.event.count.mockResolvedValue(0);

      const result = await service.detectBridgesBetween('comm-a', 'comm-b');

      expect(result.detected).toBeGreaterThan(0);
      expect(mockPrismaService.communityBridge.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            bridgeType: BridgeType.SPONTANEOUS,
            sharedMembers: 1,
          }),
        }),
      );
    });
  });

  describe('getNetworkStats', () => {
    it('should aggregate network statistics', async () => {
      mockPrismaService.communityBridge.count.mockResolvedValue(25);
      mockPrismaService.communityBridge.aggregate.mockResolvedValue({
        _avg: { strength: 0.65 },
      });
      mockPrismaService.communityBridge.findMany.mockResolvedValue([
        { bridgeType: BridgeType.GEOGRAPHIC },
        { bridgeType: BridgeType.GEOGRAPHIC },
        { bridgeType: BridgeType.THEMATIC },
        { bridgeType: BridgeType.SPONTANEOUS },
      ]);

      const stats = await service.getNetworkStats();

      expect(stats.totalBridges).toBe(25);
      expect(stats.averageStrength).toBe(0.65);
      expect(stats.bridgesByType.GEOGRAPHIC).toBe(2);
      expect(stats.bridgesByType.THEMATIC).toBe(1);
      expect(stats.bridgesByType.SPONTANEOUS).toBe(1);
    });
  });
});
