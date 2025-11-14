import { Test, TestingModule } from '@nestjs/testing';
import { AchievementsService } from './achievements.service';
import { PrismaService } from '../prisma/prisma.service';
import { AppWebSocketGateway } from '../websocket/websocket.gateway';
import { BadgeType } from '@prisma/client';

describe('AchievementsService', () => {
  let service: AchievementsService;
  let prisma: PrismaService;
  let wsGateway: AppWebSocketGateway;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    userBadge: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
    },
    event: {
      count: jest.fn(),
    },
    skill: {
      count: jest.fn(),
    },
    timeBankOffer: {
      count: jest.fn(),
    },
    timeBankTransaction: {
      count: jest.fn(),
    },
    proposal: {
      count: jest.fn(),
    },
    proposalVote: {
      count: jest.fn(),
    },
    moderationVote: {
      count: jest.fn(),
    },
    post: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    reaction: {
      count: jest.fn(),
    },
    creditTransaction: {
      create: jest.fn(),
    },
  };

  const mockWebSocketGateway = {
    sendNotificationToUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AppWebSocketGateway,
          useValue: mockWebSocketGateway,
        },
      ],
    }).compile();

    service = module.get<AchievementsService>(AchievementsService);
    prisma = module.get<PrismaService>(PrismaService);
    wsGateway = module.get<AppWebSocketGateway>(AppWebSocketGateway);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkAchievements', () => {
    it('should award HELPER_10 badge when user has helped 10 people', async () => {
      const userId = 'test-user-id';

      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        peopleHelped: 10,
        credits: 50,
      });
      mockPrismaService.userBadge.create.mockResolvedValue({
        id: 'badge-id',
        userId,
        badgeType: BadgeType.HELPER_10,
        isNew: true,
      });
      mockPrismaService.User.update.mockResolvedValue({
        id: userId,
        credits: 100,
        experience: 100,
      });
      mockPrismaService.creditTransaction.create.mockResolvedValue({});

      const newBadges = await service.checkAchievements(userId);

      expect(newBadges).toContain(BadgeType.HELPER_10);
      expect(mockPrismaService.userBadge.create).toHaveBeenCalled();
      expect(mockWebSocketGateway.sendNotificationToUser).toHaveBeenCalledWith(
        userId,
        expect.objectContaining({
          type: 'badge_unlocked',
          data: expect.objectContaining({
            badgeType: BadgeType.HELPER_10,
            name: 'Ayudante',
          }),
        }),
      );
    });

    it('should not award badge if already owned', async () => {
      const userId = 'test-user-id';

      mockPrismaService.userBadge.findMany.mockResolvedValue([
        { badgeType: BadgeType.HELPER_10 },
      ]);
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        peopleHelped: 10,
      });

      const newBadges = await service.checkAchievements(userId);

      expect(newBadges).toEqual([]);
      expect(mockPrismaService.userBadge.create).not.toHaveBeenCalled();
    });

    it('should award TIME_GIVER_10 badge when user has shared 10 hours', async () => {
      const userId = 'test-user-id';

      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        hoursShared: 10.5,
        credits: 0,
      });
      mockPrismaService.userBadge.create.mockResolvedValue({
        id: 'badge-id',
        userId,
        badgeType: BadgeType.TIME_GIVER_10,
      });
      mockPrismaService.User.update.mockResolvedValue({});
      mockPrismaService.creditTransaction.create.mockResolvedValue({});

      const newBadges = await service.checkAchievements(userId);

      expect(newBadges).toContain(BadgeType.TIME_GIVER_10);
    });

    it('should award ORGANIZER_FIRST badge for first event', async () => {
      const userId = 'test-user-id';

      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.event.count.mockResolvedValue(1);
      mockPrismaService.userBadge.create.mockResolvedValue({
        id: 'badge-id',
        userId,
        badgeType: BadgeType.ORGANIZER_FIRST,
      });
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        credits: 0,
      });
      mockPrismaService.User.update.mockResolvedValue({});
      mockPrismaService.creditTransaction.create.mockResolvedValue({});

      const newBadges = await service.checkAchievements(userId);

      expect(newBadges).toContain(BadgeType.ORGANIZER_FIRST);
      expect(mockPrismaService.event.count).toHaveBeenCalledWith({
        where: { organizerId: userId },
      });
    });

    it('should award ECO_STARTER badge when CO2 saved reaches 10kg', async () => {
      const userId = 'test-user-id';

      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        co2Avoided: 10,
        credits: 0,
      });
      mockPrismaService.userBadge.create.mockResolvedValue({
        id: 'badge-id',
        userId,
        badgeType: BadgeType.ECO_STARTER,
      });
      mockPrismaService.User.update.mockResolvedValue({});
      mockPrismaService.creditTransaction.create.mockResolvedValue({});

      const newBadges = await service.checkAchievements(userId);

      expect(newBadges).toContain(BadgeType.ECO_STARTER);
    });

    it('should award LEARNER_FIRST badge for first skill', async () => {
      const userId = 'test-user-id';

      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.skill.count.mockResolvedValue(1);
      mockPrismaService.userBadge.create.mockResolvedValue({
        id: 'badge-id',
        userId,
        badgeType: BadgeType.LEARNER_FIRST,
      });
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        credits: 0,
      });
      mockPrismaService.User.update.mockResolvedValue({});
      mockPrismaService.creditTransaction.create.mockResolvedValue({});

      const newBadges = await service.checkAchievements(userId);

      expect(newBadges).toContain(BadgeType.LEARNER_FIRST);
    });

    it('should award VOTER_FIRST badge for first vote', async () => {
      const userId = 'test-user-id';

      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.proposalVote.count.mockResolvedValue(1);
      mockPrismaService.userBadge.create.mockResolvedValue({
        id: 'badge-id',
        userId,
        badgeType: BadgeType.VOTER_FIRST,
      });
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        credits: 0,
      });
      mockPrismaService.User.update.mockResolvedValue({});
      mockPrismaService.creditTransaction.create.mockResolvedValue({});

      const newBadges = await service.checkAchievements(userId);

      expect(newBadges).toContain(BadgeType.VOTER_FIRST);
    });
  });

  describe('awardBadge', () => {
    it('should create badge and award credits and XP', async () => {
      const userId = 'test-user-id';
      const badgeType = BadgeType.HELPER_10;

      mockPrismaService.userBadge.create.mockResolvedValue({
        id: 'badge-id',
        userId,
        badgeType,
      });
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        credits: 50,
      });
      mockPrismaService.User.update.mockResolvedValue({
        id: userId,
        credits: 100,
        experience: 100,
      });
      mockPrismaService.creditTransaction.create.mockResolvedValue({});

      await service.awardBadge(userId, badgeType);

      expect(mockPrismaService.userBadge.create).toHaveBeenCalledWith({
        data: {
          userId,
          badgeType,
          isNew: true,
          metadata: expect.objectContaining({
            name: 'Ayudante',
            description: 'Ayudaste a 10 personas a través del banco de tiempo',
            icon: '🤝',
            rarity: 'COMMON',
            category: 'AYUDA_MUTUA',
          }),
        },
      });

      expect(mockPrismaService.User.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          credits: { increment: 50 },
          experience: { increment: 100 },
        },
      });

      expect(mockPrismaService.creditTransaction.create).toHaveBeenCalled();
      expect(mockWebSocketGateway.sendNotificationToUser).toHaveBeenCalled();
    });

    it('should handle badge with title reward (LEGENDARY)', async () => {
      const userId = 'test-user-id';
      const badgeType = BadgeType.HELPER_500;

      mockPrismaService.userBadge.create.mockResolvedValue({
        id: 'badge-id',
        userId,
        badgeType,
      });
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        credits: 0,
      });
      mockPrismaService.User.update.mockResolvedValue({});
      mockPrismaService.creditTransaction.create.mockResolvedValue({});

      await service.awardBadge(userId, badgeType);

      expect(mockPrismaService.userBadge.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          metadata: expect.objectContaining({
            name: 'Ángel de la Comunidad',
            rarity: 'LEGENDARY',
          }),
        }),
      });
    });
  });

  describe('getUserBadges', () => {
    it('should return all user badges ordered by earned date', async () => {
      const userId = 'test-user-id';
      const mockBadges = [
        {
          id: '1',
          userId,
          badgeType: BadgeType.HELPER_10,
          earnedAt: new Date('2025-11-02'),
        },
        {
          id: '2',
          userId,
          badgeType: BadgeType.LEARNER_FIRST,
          earnedAt: new Date('2025-11-01'),
        },
      ];

      mockPrismaService.userBadge.findMany.mockResolvedValue(mockBadges);

      const badges = await service.getUserBadges(userId);

      expect(badges).toEqual(mockBadges);
      expect(mockPrismaService.userBadge.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { earnedAt: 'desc' },
      });
    });
  });

  describe('getBadgeProgress', () => {
    it('should return progress for all badges', async () => {
      const userId = 'test-user-id';

      mockPrismaService.userBadge.findFirst.mockResolvedValue(null);
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        peopleHelped: 5,
        hoursShared: 25,
        co2Avoided: 50,
        connectionsCount: 8,
        totalSaved: 250,
      });
      mockPrismaService.event.count.mockResolvedValue(2);
      mockPrismaService.skill.count.mockResolvedValue(3);
      mockPrismaService.timeBankOffer.count.mockResolvedValue(0);
      mockPrismaService.timeBankTransaction.count.mockResolvedValue(5);
      mockPrismaService.proposal.count.mockResolvedValue(0);
      mockPrismaService.proposalVote.count.mockResolvedValue(7);
      mockPrismaService.moderationVote.count.mockResolvedValue(0);
      mockPrismaService.post.findMany.mockResolvedValue([]);
      mockPrismaService.reaction.count.mockResolvedValue(0);
      mockPrismaService.post.count.mockResolvedValue(0);

      const progress = await service.getBadgeProgress(userId);

      expect(progress).toBeInstanceOf(Array);
      expect(progress.length).toBeGreaterThan(0);

      const helperBadge = progress.find((p) => p.badgeType === BadgeType.HELPER_10);
      expect(helperBadge).toBeDefined();
      expect(helperBadge.progress).toBe(5);
      expect(helperBadge.maxProgress).toBe(10);
      expect(helperBadge.percentage).toBe(50);
      expect(helperBadge.unlocked).toBe(false);
    });

    it('should mark unlocked badges correctly', async () => {
      const userId = 'test-user-id';

      mockPrismaService.userBadge.findFirst.mockImplementation(({ where }) => {
        if (where.badgeType === BadgeType.HELPER_10) {
          return Promise.resolve({ id: '1', userId, badgeType: BadgeType.HELPER_10 });
        }
        return Promise.resolve(null);
      });
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        peopleHelped: 15,
      });
      mockPrismaService.event.count.mockResolvedValue(0);
      mockPrismaService.skill.count.mockResolvedValue(0);
      mockPrismaService.timeBankOffer.count.mockResolvedValue(0);
      mockPrismaService.timeBankTransaction.count.mockResolvedValue(0);
      mockPrismaService.proposal.count.mockResolvedValue(0);
      mockPrismaService.proposalVote.count.mockResolvedValue(0);
      mockPrismaService.moderationVote.count.mockResolvedValue(0);
      mockPrismaService.post.findMany.mockResolvedValue([]);
      mockPrismaService.post.count.mockResolvedValue(0);

      const progress = await service.getBadgeProgress(userId);

      const helperBadge = progress.find((p) => p.badgeType === BadgeType.HELPER_10);
      expect(helperBadge.unlocked).toBe(true);
    });
  });

  describe('markBadgesAsSeen', () => {
    it('should mark specified badges as not new', async () => {
      const userId = 'test-user-id';
      const badgeTypes = [BadgeType.HELPER_10, BadgeType.LEARNER_FIRST];

      mockPrismaService.userBadge.updateMany.mockResolvedValue({ count: 2 });

      await service.markBadgesAsSeen(userId, badgeTypes);

      expect(mockPrismaService.userBadge.updateMany).toHaveBeenCalledWith({
        where: {
          userId,
          badgeType: { in: badgeTypes },
        },
        data: {
          isNew: false,
        },
      });
    });
  });

  describe('getBadgeDefinition', () => {
    it('should return badge definition for valid badge type', () => {
      const definition = service.getBadgeDefinition(BadgeType.HELPER_10);

      expect(definition).toBeDefined();
      expect(definition.name).toBe('Ayudante');
      expect(definition.maxProgress).toBe(10);
      expect(definition.rewards).toEqual({ credits: 50, xp: 100 });
    });

    it('should return undefined for invalid badge type', () => {
      const definition = service.getBadgeDefinition('INVALID_BADGE' as BadgeType);

      expect(definition).toBeUndefined();
    });
  });

  describe('getAllBadgeDefinitions', () => {
    it('should return all badge definitions', () => {
      const definitions = service.getAllBadgeDefinitions();

      expect(definitions).toBeInstanceOf(Array);
      expect(definitions.length).toBeGreaterThan(0);
      expect(definitions[0]).toHaveProperty('type');
      expect(definitions[0]).toHaveProperty('name');
      expect(definitions[0]).toHaveProperty('description');
      expect(definitions[0]).toHaveProperty('icon');
      expect(definitions[0]).toHaveProperty('rarity');
    });
  });

  describe('getUserBadgeStats', () => {
    it('should return user badge statistics', async () => {
      const userId = 'test-user-id';
      const mockBadges = [
        {
          id: '1',
          userId,
          badgeType: BadgeType.HELPER_10,
          earnedAt: new Date(),
        },
        {
          id: '2',
          userId,
          badgeType: BadgeType.HELPER_50,
          earnedAt: new Date(),
        },
        {
          id: '3',
          userId,
          badgeType: BadgeType.ECO_STARTER,
          earnedAt: new Date(),
        },
      ];

      mockPrismaService.userBadge.findMany.mockResolvedValue(mockBadges);

      const stats = await service.getUserBadgeStats(userId);

      expect(stats).toHaveProperty('totalUnlocked', 3);
      expect(stats).toHaveProperty('totalBadges');
      expect(stats).toHaveProperty('completionPercentage');
      expect(stats).toHaveProperty('byRarity');
      expect(stats.byRarity).toHaveProperty('COMMON');
      expect(stats.byRarity).toHaveProperty('RARE');
      expect(stats.byRarity).toHaveProperty('EPIC');
      expect(stats.byRarity).toHaveProperty('LEGENDARY');
      expect(stats).toHaveProperty('recent');
      expect(stats.recent.length).toBeLessThanOrEqual(5);
    });

    it('should group badges by rarity correctly', async () => {
      const userId = 'test-user-id';
      const mockBadges = [
        { id: '1', userId, badgeType: BadgeType.HELPER_10 }, // COMMON
        { id: '2', userId, badgeType: BadgeType.HELPER_50 }, // RARE
        { id: '3', userId, badgeType: BadgeType.HELPER_100 }, // EPIC
      ];

      mockPrismaService.userBadge.findMany.mockResolvedValue(mockBadges);

      const stats = await service.getUserBadgeStats(userId);

      expect(stats.byRarity.COMMON).toBe(1);
      expect(stats.byRarity.RARE).toBe(1);
      expect(stats.byRarity.EPIC).toBe(1);
    });
  });

  describe('Badge Condition Tests', () => {
    it('should check PIONEER badge (top 100 users)', async () => {
      const userId = 'test-user-id';
      const userCreatedAt = new Date('2025-01-01');

      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        createdAt: userCreatedAt,
      });
      mockPrismaService.User.count.mockResolvedValue(50); // User is 50th

      mockPrismaService.userBadge.create.mockResolvedValue({});
      mockPrismaService.User.update.mockResolvedValue({});
      mockPrismaService.creditTransaction.create.mockResolvedValue({});

      const newBadges = await service.checkAchievements(userId);

      expect(newBadges).toContain(BadgeType.PIONEER);
    });

    it('should check STORYTELLER badge (50 posts)', async () => {
      const userId = 'test-user-id';

      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.post.count.mockResolvedValue(50);
      mockPrismaService.userBadge.create.mockResolvedValue({});
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        credits: 0,
      });
      mockPrismaService.User.update.mockResolvedValue({});
      mockPrismaService.creditTransaction.create.mockResolvedValue({});

      const newBadges = await service.checkAchievements(userId);

      expect(newBadges).toContain(BadgeType.STORYTELLER);
    });

    it('should check MODERATOR_FAIR badge (100 moderation votes)', async () => {
      const userId = 'test-user-id';

      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.moderationVote.count.mockResolvedValue(100);
      mockPrismaService.userBadge.create.mockResolvedValue({});
      mockPrismaService.User.findUnique.mockResolvedValue({
        id: userId,
        credits: 0,
      });
      mockPrismaService.User.update.mockResolvedValue({});
      mockPrismaService.creditTransaction.create.mockResolvedValue({});

      const newBadges = await service.checkAchievements(userId);

      expect(newBadges).toContain(BadgeType.MODERATOR_FAIR);
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully when checking achievements', async () => {
      const userId = 'test-user-id';

      mockPrismaService.userBadge.findMany.mockResolvedValue([]);
      mockPrismaService.User.findUnique.mockRejectedValue(new Error('Database error'));

      // Should not throw, just log error and continue
      const newBadges = await service.checkAchievements(userId);

      expect(newBadges).toEqual([]);
    });

    it('should skip awarding if badge definition not found', async () => {
      const userId = 'test-user-id';
      const invalidBadgeType = 'INVALID_BADGE' as BadgeType;

      await service.awardBadge(userId, invalidBadgeType);

      expect(mockPrismaService.userBadge.create).not.toHaveBeenCalled();
    });
  });
});
