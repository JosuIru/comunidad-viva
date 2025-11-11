import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { PrismaService } from '../prisma/prisma.service';
import { AchievementsService } from '../achievements/achievements.service';
import { CommunityVisibility, CommunityType } from '@prisma/client';

describe('CommunitiesService', () => {
  let service: CommunitiesService;
  let prismaService: any;

  const mockCommunity = {
    id: 'community-123',
    name: 'Test Community',
    slug: 'test-community',
    type: CommunityType.NEIGHBORHOOD,
    visibility: CommunityVisibility.PUBLIC,
    description: 'A test community',
    location: 'Test Location',
    lat: 40.7128,
    lng: -74.0060,
    radiusKm: 5,
    requiresApproval: false,
    allowExternalOffers: true,
    logo: null,
    bannerImage: null,
    primaryColor: '#3B82F6',
    language: 'es',
    currency: 'EUR',
    membersCount: 10,
    activeMembersCount: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
    governanceId: 'gov-123',
  };

  const mockGovernance = {
    id: 'gov-123',
    communityId: 'community-123',
    founders: ['user-123'],
    minProposalReputation: 10,
    minVoteReputation: 1,
    minModerateReputation: 5,
    votingPeriodDays: 7,
    quorumPercentage: 10,
    approvalThreshold: 60,
    bootstrapEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    communityId: 'community-123',
    generosityScore: 15,
    password: 'hashed',
    phone: null,
    avatar: null,
    bio: null,
    role: 'CITIZEN' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null,
    emailVerified: false,
    phoneVerified: false,
    onboardingCompleted: false,
    did: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommunitiesService,
        {
          provide: PrismaService,
          useValue: {
            community: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            membershipRequest: {
              findUnique: jest.fn(),
              create: jest.fn(),
              delete: jest.fn(),
            },
            auditLog: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: AchievementsService,
          useValue: {
            checkAchievements: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<CommunitiesService>(CommunitiesService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCommunityDto = {
      name: 'New Community',
      slug: 'new-community',
      type: CommunityType.NEIGHBORHOOD,
      description: 'A new community',
      location: 'New Location',
      lat: 40.7128,
      lng: -74.0060,
      radiusKm: 5,
      visibility: CommunityVisibility.PUBLIC,
      requiresApproval: false,
      allowExternalOffers: true,
      language: 'es',
      currency: 'EUR',
    };

    it('should create a community with governance', async () => {
      const userId = 'user-123';
      const createdCommunity = {
        ...mockCommunity,
        governance: mockGovernance,
      };

      prismaService.community.create.mockResolvedValue(createdCommunity);

      const result = await service.create(userId, createCommunityDto);

      expect(prismaService.community.create).toHaveBeenCalledWith({
        data: {
          ...createCommunityDto,
          governance: {
            create: {
              founders: [userId],
              bootstrapEndDate: expect.any(Date),
            },
          },
        },
        include: {
          governance: true,
        },
      });
      expect(result).toEqual(createdCommunity);
      expect(result.governance).toBeDefined();
    });

    it('should set bootstrap period to 30 days', async () => {
      const userId = 'user-123';
      const createdCommunity = {
        ...mockCommunity,
        governance: mockGovernance,
      };

      prismaService.community.create.mockResolvedValue(createdCommunity);

      await service.create(userId, createCommunityDto);

      const createCall = prismaService.community.create.mock.calls[0][0];
      const bootstrapEndDate = createCall.data.governance.create.bootstrapEndDate;

      const daysDiff = Math.round(
        (bootstrapEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(daysDiff).toBeGreaterThanOrEqual(29);
      expect(daysDiff).toBeLessThanOrEqual(30);
    });

    it('should include creator as founder', async () => {
      const userId = 'creator-456';
      const createdCommunity = {
        ...mockCommunity,
        governance: { ...mockGovernance, founders: [userId] },
      };

      prismaService.community.create.mockResolvedValue(createdCommunity);

      await service.create(userId, createCommunityDto);

      const createCall = prismaService.community.create.mock.calls[0][0];
      expect(createCall.data.governance.create.founders).toContain(userId);
    });
  });

  describe('findAll', () => {
    it('should return all public communities', async () => {
      const communities = [mockCommunity];
      prismaService.community.findMany.mockResolvedValue(communities);

      const result = await service.findAll();

      expect(prismaService.community.findMany).toHaveBeenCalledWith({
        where: {
          visibility: {
            not: CommunityVisibility.PRIVATE,
          },
        },
        include: {
          _count: {
            select: {
              users: true,
              offers: true,
              events: true,
            },
          },
        },
        orderBy: {
          membersCount: 'desc',
        },
      });
      expect(result).toEqual(communities);
    });

    it('should filter by type', async () => {
      const communities = [mockCommunity];
      prismaService.community.findMany.mockResolvedValue(communities);

      await service.findAll({ type: CommunityType.NEIGHBORHOOD });

      const whereClause = prismaService.community.findMany.mock.calls[0][0].where;
      expect(whereClause.type).toBe(CommunityType.NEIGHBORHOOD);
    });

    it('should filter by visibility', async () => {
      const communities = [mockCommunity];
      prismaService.community.findMany.mockResolvedValue(communities);

      await service.findAll({ visibility: CommunityVisibility.PUBLIC });

      const whereClause = prismaService.community.findMany.mock.calls[0][0].where;
      expect(whereClause.visibility).toBe(CommunityVisibility.PUBLIC);
    });

    it('should search by name, description, or location', async () => {
      const communities = [mockCommunity];
      prismaService.community.findMany.mockResolvedValue(communities);

      await service.findAll({ search: 'test' });

      const whereClause = prismaService.community.findMany.mock.calls[0][0].where;
      expect(whereClause.OR).toEqual([
        { name: { contains: 'test', mode: 'insensitive' } },
        { description: { contains: 'test', mode: 'insensitive' } },
        { location: { contains: 'test', mode: 'insensitive' } },
      ]);
    });

    it('should not include private communities in public listing', async () => {
      prismaService.community.findMany.mockResolvedValue([]);

      await service.findAll();

      const whereClause = prismaService.community.findMany.mock.calls[0][0].where;
      expect(whereClause.visibility).toEqual({
        not: CommunityVisibility.PRIVATE,
      });
    });
  });

  describe('findOne', () => {
    it('should return community details for public community', async () => {
      const communityWithGovernance = {
        ...mockCommunity,
        governance: mockGovernance,
        _count: {
          users: 10,
          offers: 5,
          events: 3,
          connectionsOut: 2,
          connectionsIn: 1,
        },
      };

      prismaService.community.findUnique.mockResolvedValue(communityWithGovernance);

      const result = await service.findOne('community-123');

      expect(prismaService.community.findUnique).toHaveBeenCalledWith({
        where: { id: 'community-123' },
        include: {
          governance: true,
          _count: {
            select: {
              users: true,
              offers: true,
              events: true,
              connectionsOut: true,
              connectionsIn: true,
            },
          },
        },
      });
      expect(result).toMatchObject(communityWithGovernance);
    });

    it('should throw NotFoundException if community not found', async () => {
      prismaService.community.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should include member status when userId provided', async () => {
      const communityWithGovernance = {
        ...mockCommunity,
        governance: mockGovernance,
        _count: {
          users: 10,
          offers: 5,
          events: 3,
          connectionsOut: 2,
          connectionsIn: 1,
        },
      };

      prismaService.community.findUnique.mockResolvedValue(communityWithGovernance);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('community-123', 'user-123');

      expect(result).toHaveProperty('isMember', true);
      expect(result).toHaveProperty('isFounder', true);
      expect(result).toHaveProperty('canPropose', true);
      expect(result).toHaveProperty('canVote', true);
    });

    it('should calculate permissions based on reputation', async () => {
      const communityWithGovernance = {
        ...mockCommunity,
        governance: mockGovernance,
        _count: {
          users: 10,
          offers: 5,
          events: 3,
          connectionsOut: 2,
          connectionsIn: 1,
        },
      };

      const lowReputationUser = {
        ...mockUser,
        generosityScore: 3,
      };

      prismaService.community.findUnique.mockResolvedValue(communityWithGovernance);
      prismaService.user.findUnique.mockResolvedValue(lowReputationUser);

      const result = await service.findOne('community-123', 'user-123');

      expect(result).toHaveProperty('canPropose', false); // Needs 10
      expect(result).toHaveProperty('canVote', true); // Needs 1
      expect(result).toHaveProperty('canModerate', false); // Needs 5
    });

    it('should restrict private community details for non-members', async () => {
      const privateCommunity = {
        ...mockCommunity,
        visibility: CommunityVisibility.PRIVATE,
        governance: mockGovernance,
        _count: {
          users: 10,
          offers: 5,
          events: 3,
          connectionsOut: 2,
          connectionsIn: 1,
        },
      };

      const nonMember = {
        ...mockUser,
        communityId: 'other-community',
      };

      prismaService.community.findUnique.mockResolvedValue(privateCommunity);
      prismaService.user.findUnique.mockResolvedValue(nonMember);

      const result = await service.findOne('community-123', 'user-456');

      expect(result).toEqual({
        id: privateCommunity.id,
        name: privateCommunity.name,
        type: privateCommunity.type,
        visibility: privateCommunity.visibility,
        requiresApproval: privateCommunity.requiresApproval,
        isMember: false,
        restricted: true,
      });
      expect(result).not.toHaveProperty('description');
    });
  });

  describe('findBySlug', () => {
    it('should find community by slug', async () => {
      const communityWithGovernance = {
        ...mockCommunity,
        governance: mockGovernance,
        _count: {
          users: 10,
          offers: 5,
          events: 3,
          connectionsOut: 2,
          connectionsIn: 1,
        },
      };

      prismaService.community.findUnique
        .mockResolvedValueOnce(mockCommunity)
        .mockResolvedValueOnce(communityWithGovernance);

      const result = await service.findBySlug('test-community');

      expect(prismaService.community.findUnique).toHaveBeenNthCalledWith(1, {
        where: { slug: 'test-community' },
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if slug not found', async () => {
      prismaService.community.findUnique.mockResolvedValue(null);

      await expect(service.findBySlug('non-existent-slug')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('permissions and authorization', () => {
    it('should correctly identify founders', async () => {
      const communityWithGovernance = {
        ...mockCommunity,
        governance: mockGovernance,
        _count: {
          users: 10,
          offers: 5,
          events: 3,
          connectionsOut: 2,
          connectionsIn: 1,
        },
      };

      prismaService.community.findUnique.mockResolvedValue(communityWithGovernance);
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('community-123', 'user-123');

      expect((result as any).isFounder).toBe(true);
    });

    it('should identify non-founders correctly', async () => {
      const communityWithGovernance = {
        ...mockCommunity,
        governance: mockGovernance,
        _count: {
          users: 10,
          offers: 5,
          events: 3,
          connectionsOut: 2,
          connectionsIn: 1,
        },
      };

      prismaService.community.findUnique.mockResolvedValue(communityWithGovernance);
      prismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        id: 'other-user',
      });

      const result = await service.findOne('community-123', 'other-user');

      expect((result as any).isFounder).toBe(false);
    });

    it('should deny permissions to non-members', async () => {
      const communityWithGovernance = {
        ...mockCommunity,
        governance: mockGovernance,
        _count: {
          users: 10,
          offers: 5,
          events: 3,
          connectionsOut: 2,
          connectionsIn: 1,
        },
      };

      const nonMember = {
        ...mockUser,
        communityId: null,
      };

      prismaService.community.findUnique.mockResolvedValue(communityWithGovernance);
      prismaService.user.findUnique.mockResolvedValue(nonMember);

      const result = await service.findOne('community-123', 'user-456');

      expect((result as any).isMember).toBe(false);
      expect((result as any).canPropose).toBe(false);
      expect((result as any).canVote).toBe(false);
      expect((result as any).canModerate).toBe(false);
    });
  });
});
