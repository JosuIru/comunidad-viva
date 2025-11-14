import { Test, TestingModule } from '@nestjs/testing';
import { MetricsCalculatorService } from '../metrics-calculator.service';
import { PrismaService } from '../../prisma/prisma.service';
import { OrganizedCommunityType } from '@prisma/client';

describe('MetricsCalculatorService', () => {
  let service: MetricsCalculatorService;
  let prisma: PrismaService;

  const mockPrismaService = {
    communityPack: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    communityMetric: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    offer: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    event: {
      count: jest.fn(),
    },
    liveEventParticipant: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsCalculatorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MetricsCalculatorService>(MetricsCalculatorService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateMetric', () => {
    it('should create new metric if it does not exist', async () => {
      const packId = 'pack-123';
      const metricKey = 'active_members';
      const newValue = 50;

      mockPrismaService.communityMetric.findFirst.mockResolvedValue(null);
      mockPrismaService.communityMetric.create.mockResolvedValue({
        id: 'metric-123',
        packId,
        metricKey,
        currentValue: newValue,
      });

      await service['updateMetric'](packId, metricKey, newValue);

      expect(mockPrismaService.communityMetric.create).toHaveBeenCalledWith({
        data: {
          packId,
          metricKey,
          metricName: metricKey,
          currentValue: newValue,
          unit: '',
        },
      });
    });

    it('should update existing metric and store in history', async () => {
      const packId = 'pack-123';
      const metricKey = 'active_members';
      const oldValue = 40;
      const newValue = 50;

      const existingMetric = {
        id: 'metric-123',
        packId,
        metricKey,
        currentValue: oldValue,
        history: [],
      };

      mockPrismaService.communityMetric.findFirst.mockResolvedValue(existingMetric);
      mockPrismaService.communityMetric.update.mockResolvedValue({
        ...existingMetric,
        currentValue: newValue,
      });

      await service['updateMetric'](packId, metricKey, newValue);

      expect(mockPrismaService.communityMetric.update).toHaveBeenCalledWith({
        where: { id: existingMetric.id },
        data: {
          currentValue: newValue,
          history: expect.arrayContaining([
            expect.objectContaining({
              value: oldValue,
              date: expect.any(String),
            }),
          ]),
        },
      });
    });

    it('should not update if value has not changed', async () => {
      const packId = 'pack-123';
      const metricKey = 'active_members';
      const value = 50;

      const existingMetric = {
        id: 'metric-123',
        packId,
        metricKey,
        currentValue: value,
        history: [],
      };

      mockPrismaService.communityMetric.findFirst.mockResolvedValue(existingMetric);

      await service['updateMetric'](packId, metricKey, value);

      expect(mockPrismaService.communityMetric.update).not.toHaveBeenCalled();
    });
  });

  describe('calculateMetricsForPack', () => {
    it('should calculate consumer group metrics', async () => {
      const packId = 'pack-123';
      const packType = OrganizedCommunityType.CONSUMER_GROUP;

      const mockPack = {
        id: packId,
        packType,
        communityId: 'comm-123',
        community: {
          users: [{ id: '1' }, { id: '2' }, { id: '3' }],
          offers: [
            { userId: '1' },
            { userId: '2' },
            { userId: '1' }, // mismo usuario
          ],
        },
      };

      mockPrismaService.communityPack.findUnique.mockResolvedValue(mockPack);
      mockPrismaService.communityMetric.findFirst.mockResolvedValue(null);
      mockPrismaService.communityMetric.create.mockResolvedValue({});

      await service.calculateMetricsForPack(packId, packType);

      // Verificar que se crearon métricas
      expect(mockPrismaService.communityMetric.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            packId,
            metricKey: 'active_members',
            currentValue: 3, // 3 usuarios
          }),
        }),
      );

      expect(mockPrismaService.communityMetric.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            packId,
            metricKey: 'local_producers',
            currentValue: 2, // 2 usuarios únicos con ofertas
          }),
        }),
      );
    });

    it('should calculate housing coop metrics', async () => {
      const packId = 'pack-123';
      const packType = OrganizedCommunityType.HOUSING_COOP;

      const mockPack = {
        id: packId,
        packType,
        communityId: 'comm-123',
        community: {
          users: [{ id: '1' }, { id: '2' }],
          events: [],
        },
      };

      mockPrismaService.communityPack.findUnique.mockResolvedValue(mockPack);
      mockPrismaService.event.count.mockResolvedValue(5);
      mockPrismaService.Offer.findMany.mockResolvedValue([]);
      mockPrismaService.liveEventParticipant.findMany.mockResolvedValue([]);
      mockPrismaService.communityMetric.findFirst.mockResolvedValue(null);
      mockPrismaService.communityMetric.create.mockResolvedValue({});

      await service.calculateMetricsForPack(packId, packType);

      expect(mockPrismaService.communityMetric.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metricKey: 'space_bookings',
            currentValue: 5,
          }),
        }),
      );
    });

    it('should calculate community bar metrics', async () => {
      const packId = 'pack-123';
      const packType = OrganizedCommunityType.COMMUNITY_BAR;

      const mockPack = {
        id: packId,
        packType,
        communityId: 'comm-123',
        community: {
          users: [{ id: '1' }, { id: '2' }],
          events: [],
          offers: [{ userId: '1' }, { userId: '2' }],
        },
      };

      mockPrismaService.communityPack.findUnique.mockResolvedValue(mockPack);
      mockPrismaService.event.count.mockResolvedValue(10);
      mockPrismaService.communityMetric.findFirst.mockResolvedValue(null);
      mockPrismaService.communityMetric.create.mockResolvedValue({});

      await service.calculateMetricsForPack(packId, packType);

      expect(mockPrismaService.communityMetric.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metricKey: 'events_hosted',
            currentValue: 10,
          }),
        }),
      );

      expect(mockPrismaService.communityMetric.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metricKey: 'local_suppliers',
            currentValue: 2,
          }),
        }),
      );
    });
  });

  describe('aggregateGlobalMetrics', () => {
    it('should aggregate metrics from all packs', async () => {
      const mockPacks = [
        {
          packType: OrganizedCommunityType.CONSUMER_GROUP,
          community: {
            users: [{ id: '1' }, { id: '2' }],
            events: [{ id: 'e1' }],
          },
          metrics: [
            { metricKey: 'monthly_savings', currentValue: 100 },
            { metricKey: 'kg_local_food', currentValue: 50 },
          ],
        },
        {
          packType: OrganizedCommunityType.CONSUMER_GROUP,
          community: {
            users: [{ id: '3' }],
            events: [],
          },
          metrics: [
            { metricKey: 'monthly_savings', currentValue: 150 },
            { metricKey: 'kg_local_food', currentValue: 75 },
          ],
        },
      ];

      mockPrismaService.communityPack.findMany.mockResolvedValue(mockPacks);

      const result = await service.aggregateGlobalMetrics();

      expect(result.totalCommunities).toBe(2);
      expect(result.totalMembers).toBe(3); // 2 + 1
      expect(result.totalEvents).toBe(1);
      expect(result.byType[OrganizedCommunityType.CONSUMER_GROUP]).toEqual({
        count: 2,
        totalMembers: 3,
        metrics: {
          monthly_savings: 250, // 100 + 150
          kg_local_food: 125, // 50 + 75
        },
      });
    });
  });
});
