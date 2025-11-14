import { Test, TestingModule } from '@nestjs/testing';
import { CommunityPacksService } from '../community-packs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrganizedCommunityType } from '@prisma/client';

describe('CommunityPacksService', () => {
  let service: CommunityPacksService;
  let prisma: PrismaService;

  const mockPrismaService = {
    community: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    communityPack: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    communitySetupStep: {
      findUnique: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    communityMetric: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunityPacksService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommunityPacksService>(CommunityPacksService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPack', () => {
    it('should throw NotFoundException if community does not exist', async () => {
      mockPrismaService.community.findUnique.mockResolvedValue(null);

      await expect(
        service.createPack('comm-123', {
          packType: OrganizedCommunityType.CONSUMER_GROUP,
        }, 'user-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not authorized', async () => {
      const community = {
        id: 'comm-123',
        governance: { founders: ['other-user'] },
      };

      const user = {
        communityId: 'comm-123',
        generosityScore: 3, // < 5
      };

      mockPrismaService.community.findUnique.mockResolvedValue(community);
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(
        service.createPack('comm-123', {
          packType: OrganizedCommunityType.CONSUMER_GROUP,
        }, 'user-123'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should allow founder to create pack', async () => {
      const community = {
        id: 'comm-123',
        governance: { founders: ['user-123'] },
      };

      const user = {
        communityId: 'comm-123',
        generosityScore: 3,
      };

      mockPrismaService.community.findUnique.mockResolvedValue(community);
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.communityPack.findUnique.mockResolvedValue(null);
      mockPrismaService.communityPack.create.mockResolvedValue({
        id: 'pack-123',
        packType: OrganizedCommunityType.CONSUMER_GROUP,
      });

      const result = await service.createPack('comm-123', {
        packType: OrganizedCommunityType.CONSUMER_GROUP,
      }, 'user-123');

      expect(result).toBeDefined();
      expect(mockPrismaService.communityPack.create).toHaveBeenCalled();
    });

    it('should allow high-reputation member to create pack', async () => {
      const community = {
        id: 'comm-123',
        governance: { founders: ['other-user'] },
      };

      const user = {
        communityId: 'comm-123',
        generosityScore: 10, // >= 5
      };

      mockPrismaService.community.findUnique.mockResolvedValue(community);
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.communityPack.findUnique.mockResolvedValue(null);
      mockPrismaService.communityPack.create.mockResolvedValue({
        id: 'pack-123',
        packType: OrganizedCommunityType.CONSUMER_GROUP,
      });

      const result = await service.createPack('comm-123', {
        packType: OrganizedCommunityType.CONSUMER_GROUP,
      }, 'user-123');

      expect(result).toBeDefined();
      expect(mockPrismaService.communityPack.create).toHaveBeenCalled();
    });

    it('should create setup steps for consumer group', async () => {
      const community = {
        id: 'comm-123',
        governance: { founders: ['user-123'] },
      };

      const user = {
        communityId: 'comm-123',
        generosityScore: 10,
      };

      mockPrismaService.community.findUnique.mockResolvedValue(community);
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.communityPack.findUnique.mockResolvedValue(null);
      mockPrismaService.communityPack.create.mockResolvedValue({
        id: 'pack-123',
        packType: OrganizedCommunityType.CONSUMER_GROUP,
      });

      await service.createPack('comm-123', {
        packType: OrganizedCommunityType.CONSUMER_GROUP,
      }, 'user-123');

      const createCall = mockPrismaService.communityPack.create.mock.calls[0][0];
      expect(createCall.data.setupSteps).toBeDefined();
      expect(createCall.data.setupSteps.create).toHaveLength(4);
      expect(createCall.data.setupSteps.create[0]).toMatchObject({
        stepKey: 'create_first_order',
        completed: false,
      });
    });
  });

  describe('updatePack', () => {
    it('should update pack configuration', async () => {
      const community = {
        id: 'comm-123',
        governance: { founders: ['user-123'] },
      };

      const user = {
        communityId: 'comm-123',
        generosityScore: 10,
      };

      mockPrismaService.community.findUnique.mockResolvedValue(community);
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.communityPack.update.mockResolvedValue({
        id: 'pack-123',
        enabledFeatures: ['feature1', 'feature2'],
      });

      const result = await service.updatePack('comm-123', {
        enabledFeatures: ['feature1', 'feature2'],
      }, 'user-123');

      expect(result).toBeDefined();
      expect(mockPrismaService.communityPack.update).toHaveBeenCalledWith({
        where: { communityId: 'comm-123' },
        data: expect.objectContaining({
          enabledFeatures: ['feature1', 'feature2'],
        }),
      });
    });
  });

  describe('completeStep', () => {
    it('should mark step as completed', async () => {
      const community = {
        id: 'comm-123',
        governance: { founders: ['user-123'] },
      };

      const user = {
        communityId: 'comm-123',
        generosityScore: 10,
      };

      const pack = {
        id: 'pack-123',
        setupSteps: [
          { id: 'step-123', stepKey: 'create_first_order', completed: false },
        ],
      };

      mockPrismaService.community.findUnique.mockResolvedValue(community);
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.communityPack.findUnique.mockResolvedValue(pack);
      mockPrismaService.communitySetupStep.update.mockResolvedValue({
        id: 'step-123',
        completed: true,
      });
      mockPrismaService.communityPack.update.mockResolvedValue({
        id: 'pack-123',
        setupProgress: 25,
      });

      const result = await service.completeStep('comm-123', {
        stepKey: 'create_first_order',
      }, 'user-123');

      expect(result).toBeDefined();
      expect(mockPrismaService.communitySetupStep.update).toHaveBeenCalledWith({
        where: { id: 'step-123' },
        data: expect.objectContaining({
          completed: true,
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should update setup progress percentage', async () => {
      const community = {
        id: 'comm-123',
        governance: { founders: ['user-123'] },
      };

      const user = {
        communityId: 'comm-123',
        generosityScore: 10,
      };

      const pack = {
        id: 'pack-123',
        setupSteps: [
          { id: 'step-1', completed: true },
          { id: 'step-2', completed: true },
          { id: 'step-3', completed: false },
          { id: 'step-4', completed: false },
        ],
      };

      mockPrismaService.community.findUnique.mockResolvedValue(community);
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.communityPack.findUnique.mockResolvedValue(pack);
      mockPrismaService.communitySetupStep.update.mockResolvedValue({});
      mockPrismaService.communityPack.update.mockResolvedValue({});

      await service.completeStep('comm-123', {
        stepKey: 'step-3',
      }, 'user-123');

      // 3 de 4 completados = 75%
      expect(mockPrismaService.communityPack.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            setupProgress: 75,
          }),
        }),
      );
    });
  });

  describe('updateMetric', () => {
    it('should update metric value', async () => {
      const pack = {
        id: 'pack-123',
        community: {
          id: 'comm-123',
          governance: { founders: ['user-123'] },
        },
        metrics: [
          {
            id: 'metric-123',
            metricKey: 'monthly_savings',
            currentValue: 100,
            history: [],
          },
        ],
      };

      const user = {
        communityId: 'comm-123',
        generosityScore: 10,
      };

      mockPrismaService.communityPack.findUnique.mockResolvedValue(pack);
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.communityMetric.update.mockResolvedValue({
        id: 'metric-123',
        currentValue: 150,
      });

      const result = await service.updateMetric(
        'comm-123',
        'monthly_savings',
        { value: 150, note: 'Manual update' },
        'user-123',
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.communityMetric.update).toHaveBeenCalledWith({
        where: { id: 'metric-123' },
        data: expect.objectContaining({
          currentValue: 150,
          history: expect.arrayContaining([
            expect.objectContaining({
              value: 100,
              note: 'Manual update',
            }),
          ]),
        }),
      });
    });
  });

  describe('getPackTypes', () => {
    it.skip('should return all available pack types', () => {
      // TODO: Implement getPackTypes method in CommunityPacksService
      const types = (service as any).getPackTypes();

      expect(types).toHaveLength(3);
      expect(types).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: OrganizedCommunityType.CONSUMER_GROUP,
            name: expect.any(String),
            features: expect.any(Array),
            metrics: expect.any(Array),
          }),
          expect.objectContaining({
            type: OrganizedCommunityType.HOUSING_COOP,
          }),
          expect.objectContaining({
            type: OrganizedCommunityType.COMMUNITY_BAR,
          }),
        ]),
      );
    });

    it.skip('should include examples for each pack type', () => {
      // TODO: Implement getPackTypes method in CommunityPacksService
      const types = (service as any).getPackTypes();

      types.forEach((type) => {
        expect(type.examples).toBeDefined();
        expect(type.examples.length).toBeGreaterThan(0);
      });
    });
  });
});
