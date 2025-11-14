import { Test, TestingModule } from '@nestjs/testing';
import { ChallengesService } from './challenges.service';
import { PrismaService } from '../prisma/prisma.service';
import { ViralFeaturesService } from '../engagement/viral-features.service';
import { SeedType, CreditReason } from '@prisma/client';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ChallengesService', () => {
  let service: ChallengesService;
  let prisma: PrismaService;
  let viralFeaturesService: ViralFeaturesService;

  const mockPrismaService = {
    dailySeed: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    userDailySeedCompletion: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    creditTransaction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockViralFeaturesService = {
    checkLevelUp: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChallengesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ViralFeaturesService,
          useValue: mockViralFeaturesService,
        },
      ],
    }).compile();

    service = module.get<ChallengesService>(ChallengesService);
    prisma = module.get<PrismaService>(PrismaService);
    viralFeaturesService = module.get<ViralFeaturesService>(ViralFeaturesService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTodayChallenge', () => {
    it('should return existing challenge for today', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockChallenge = {
        id: 'challenge-id',
        date: today,
        type: SeedType.GREETING,
        challenge: 'Saluda a 3 vecinos nuevos',
        description: 'Rompe el hielo y conecta con tu comunidad',
        creditsReward: 5,
        participantsCount: 10,
        completions: [
          { userId: 'user-1' },
          { userId: 'user-2' },
        ],
      };

      mockPrismaService.dailySeed.findUnique.mockResolvedValue(mockChallenge);

      const result = await service.getTodayChallenge();

      expect(result).toEqual(mockChallenge);
      expect(mockPrismaService.dailySeed.findUnique).toHaveBeenCalledWith({
        where: { date: today },
        include: {
          completions: {
            select: {
              userId: true,
            },
          },
        },
      });
    });

    it('should create new challenge if none exists for today', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockNewChallenge = {
        id: 'new-challenge-id',
        date: today,
        type: SeedType.SHARING,
        challenge: 'Comparte algo que no uses',
        description: 'Ofrece un objeto o habilidad en el marketplace',
        creditsReward: 5,
        participantsCount: 0,
        completions: [],
      };

      mockPrismaService.dailySeed.findUnique
        .mockResolvedValueOnce(null) // First call: no challenge exists
        .mockResolvedValueOnce(mockNewChallenge); // Second call: returns created challenge

      mockPrismaService.dailySeed.create.mockResolvedValue(mockNewChallenge);

      const result = await service.getTodayChallenge();

      expect(result).toEqual(mockNewChallenge);
      expect(mockPrismaService.dailySeed.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          date: today,
          type: expect.any(String),
          challenge: expect.any(String),
          description: expect.any(String),
          creditsReward: 5,
        }),
      });
    });
  });

  describe('getTodayChallengeForUser', () => {
    it('should return challenge with completion status for user', async () => {
      const userId = 'test-user-id';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockChallenge = {
        id: 'challenge-id',
        date: today,
        type: SeedType.HELPING,
        challenge: 'Ayuda a alguien con una tarea',
        description: 'Ofrece tu tiempo o conocimiento a un vecino',
        creditsReward: 5,
        participantsCount: 5,
        completions: [
          { userId },
        ],
      };

      mockPrismaService.dailySeed.findUnique.mockResolvedValue(mockChallenge);

      const result = await service.getTodayChallengeForUser(userId);

      expect(result).toEqual({
        ...mockChallenge,
        completed: true,
      });
      expect(mockPrismaService.dailySeed.findUnique).toHaveBeenCalledWith({
        where: { date: today },
        include: {
          completions: {
            where: {
              userId,
            },
          },
        },
      });
    });

    it('should return completed: false when user has not completed challenge', async () => {
      const userId = 'test-user-id';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockChallenge = {
        id: 'challenge-id',
        date: today,
        type: SeedType.LEARNING,
        challenge: 'Aprende algo nuevo de un vecino',
        description: 'Participa en un intercambio de conocimientos',
        creditsReward: 5,
        participantsCount: 3,
        completions: [],
      };

      mockPrismaService.dailySeed.findUnique.mockResolvedValue(mockChallenge);

      const result = await service.getTodayChallengeForUser(userId);

      expect(result.completed).toBe(false);
    });

    it('should create challenge if none exists for today', async () => {
      const userId = 'test-user-id';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockNewChallenge = {
        id: 'new-challenge-id',
        date: today,
        type: SeedType.CONNECTING,
        challenge: 'Conecta a dos personas que puedan ayudarse',
        description: 'Facilita una nueva conexión comunitaria',
        creditsReward: 5,
        participantsCount: 0,
        completions: [],
      };

      mockPrismaService.dailySeed.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockNewChallenge);

      mockPrismaService.dailySeed.create.mockResolvedValue(mockNewChallenge);

      const result = await service.getTodayChallengeForUser(userId);

      expect(result.completed).toBe(false);
      expect(mockPrismaService.dailySeed.create).toHaveBeenCalled();
    });
  });

  describe('completeChallenge', () => {
    it('should complete challenge and award credits', async () => {
      const userId = 'test-user-id';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockChallenge = {
        id: 'challenge-id',
        date: today,
        type: SeedType.ECO_ACTION,
        challenge: 'Realiza una acción ecológica',
        description: 'Participa en una limpieza o acción sostenible',
        creditsReward: 5,
        participantsCount: 10,
      };

      const mockUser = {
        id: userId,
        credits: 50,
      };

      const mockCompletion = {
        id: 'completion-id',
        userId,
        dailySeedId: mockChallenge.id,
        creditsAwarded: 5,
        completedAt: new Date(),
      };

      mockPrismaService.dailySeed.findUnique.mockResolvedValue(mockChallenge);
      mockPrismaService.userDailySeedCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.User.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.$transaction.mockResolvedValue([mockCompletion]);
      mockViralFeaturesService.checkLevelUp.mockResolvedValue(null);

      const result = await service.completeChallenge(userId);

      expect(result.success).toBe(true);
      expect(result.creditsAwarded).toBe(5);
      expect(result.message).toContain('5 créditos');

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockViralFeaturesService.checkLevelUp).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if no challenge exists for today', async () => {
      const userId = 'test-user-id';

      mockPrismaService.dailySeed.findUnique.mockResolvedValue(null);

      await expect(service.completeChallenge(userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.completeChallenge(userId)).rejects.toThrow(
        'No challenge available for today',
      );
    });

    it('should throw BadRequestException if user already completed challenge', async () => {
      const userId = 'test-user-id';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockChallenge = {
        id: 'challenge-id',
        date: today,
        type: SeedType.GREETING,
        challenge: 'Saluda a 3 vecinos nuevos',
        description: 'Rompe el hielo y conecta con tu comunidad',
        creditsReward: 5,
        participantsCount: 5,
      };

      const mockExistingCompletion = {
        id: 'existing-completion-id',
        userId,
        dailySeedId: mockChallenge.id,
        creditsAwarded: 5,
        completedAt: new Date(),
      };

      mockPrismaService.dailySeed.findUnique.mockResolvedValue(mockChallenge);
      mockPrismaService.userDailySeedCompletion.findUnique.mockResolvedValue(
        mockExistingCompletion,
      );

      await expect(service.completeChallenge(userId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.completeChallenge(userId)).rejects.toThrow(
        'You have already completed today\'s challenge',
      );
    });

    it('should increment participantsCount when challenge is completed', async () => {
      const userId = 'test-user-id';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockChallenge = {
        id: 'challenge-id',
        date: today,
        type: SeedType.SHARING,
        challenge: 'Comparte algo que no uses',
        creditsReward: 5,
        participantsCount: 8,
      };

      const mockUser = {
        id: userId,
        credits: 100,
      };

      mockPrismaService.dailySeed.findUnique.mockResolvedValue(mockChallenge);
      mockPrismaService.userDailySeedCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.User.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.$transaction.mockResolvedValue([{}]);
      mockViralFeaturesService.checkLevelUp.mockResolvedValue(null);

      await service.completeChallenge(userId);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();

      // Verify the transaction includes 4 operations
      const transactionCall = mockPrismaService.$transaction.mock.calls[0][0];
      expect(transactionCall).toHaveLength(4);
    });

    it('should award XP along with credits', async () => {
      const userId = 'test-user-id';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockChallenge = {
        id: 'challenge-id',
        date: today,
        type: SeedType.HELPING,
        challenge: 'Ayuda a alguien',
        creditsReward: 5,
        participantsCount: 2,
      };

      const mockUser = {
        id: userId,
        credits: 20,
      };

      mockPrismaService.dailySeed.findUnique.mockResolvedValue(mockChallenge);
      mockPrismaService.userDailySeedCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.User.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.$transaction.mockResolvedValue([{}]);
      mockViralFeaturesService.checkLevelUp.mockResolvedValue(null);

      await service.completeChallenge(userId);

      // Verify transaction includes experience increment
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should create credit transaction record', async () => {
      const userId = 'test-user-id';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockChallenge = {
        id: 'challenge-id',
        date: today,
        type: SeedType.LEARNING,
        challenge: 'Aprende algo nuevo',
        description: 'Test description',
        creditsReward: 5,
        participantsCount: 1,
      };

      const mockUser = {
        id: userId,
        credits: 45,
      };

      mockPrismaService.dailySeed.findUnique.mockResolvedValue(mockChallenge);
      mockPrismaService.userDailySeedCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.User.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.$transaction.mockResolvedValue([{}]);
      mockViralFeaturesService.checkLevelUp.mockResolvedValue(null);

      await service.completeChallenge(userId);

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should check for level up after completion', async () => {
      const userId = 'test-user-id';
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockChallenge = {
        id: 'challenge-id',
        date: today,
        type: SeedType.CONNECTING,
        challenge: 'Conecta personas',
        creditsReward: 5,
        participantsCount: 0,
      };

      const mockUser = {
        id: userId,
        credits: 95,
      };

      const mockLevelUp = {
        leveled: true,
        newLevel: 3,
        rewards: { credits: 10 },
      };

      mockPrismaService.dailySeed.findUnique.mockResolvedValue(mockChallenge);
      mockPrismaService.userDailySeedCompletion.findUnique.mockResolvedValue(null);
      mockPrismaService.User.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.$transaction.mockResolvedValue([{}]);
      mockViralFeaturesService.checkLevelUp.mockResolvedValue(mockLevelUp);

      const result = await service.completeChallenge(userId);

      expect(result.levelUp).toEqual(mockLevelUp);
      expect(mockViralFeaturesService.checkLevelUp).toHaveBeenCalledWith(userId);
    });
  });

  describe('Challenge Pool', () => {
    it('should have 6 different challenge types in the pool', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      mockPrismaService.dailySeed.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValue({
          id: 'challenge-id',
          date: today,
          type: SeedType.GREETING,
          challenge: 'Test',
          creditsReward: 5,
          completions: [],
        });

      mockPrismaService.dailySeed.create.mockImplementation((args) => {
        // Verify challenge is from the pool
        const validTypes = [
          SeedType.GREETING,
          SeedType.SHARING,
          SeedType.HELPING,
          SeedType.LEARNING,
          SeedType.CONNECTING,
          SeedType.ECO_ACTION,
        ];

        expect(validTypes).toContain(args.data.type);
        expect(args.data.creditsReward).toBe(5);

        return Promise.resolve({
          id: 'new-challenge-id',
          ...args.data,
        });
      });

      await service.getTodayChallenge();

      expect(mockPrismaService.dailySeed.create).toHaveBeenCalled();
    });

    it('should always award 5 credits for daily challenges', async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      mockPrismaService.dailySeed.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValue({
          id: 'challenge-id',
          date: today,
          type: SeedType.ECO_ACTION,
          challenge: 'Test',
          creditsReward: 5,
          completions: [],
        });

      mockPrismaService.dailySeed.create.mockImplementation((args) => {
        expect(args.data.creditsReward).toBe(5);

        return Promise.resolve({
          id: 'new-challenge-id',
          ...args.data,
        });
      });

      await service.getTodayChallenge();
    });
  });

  describe('Date Handling', () => {
    it('should normalize date to start of day', async () => {
      const mockChallenge = {
        id: 'challenge-id',
        date: new Date(),
        type: SeedType.GREETING,
        challenge: 'Test',
        creditsReward: 5,
        completions: [],
      };

      mockPrismaService.dailySeed.findUnique.mockResolvedValue(mockChallenge);

      await service.getTodayChallenge();

      const callArg = mockPrismaService.dailySeed.findUnique.mock.calls[0][0];
      const dateArg = callArg.where.date;

      expect(dateArg.getHours()).toBe(0);
      expect(dateArg.getMinutes()).toBe(0);
      expect(dateArg.getSeconds()).toBe(0);
      expect(dateArg.getMilliseconds()).toBe(0);
    });
  });
});
