import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreditReason } from '@prisma/client';

describe('CreditsService', () => {
  let service: CreditsService;
  let prismaService: any;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    credits: 100,
  };

  const mockTransaction = {
    id: 'tx-123',
    userId: 'user-123',
    amount: 10,
    balance: 110,
    reason: CreditReason.EVENT_ATTENDANCE,
    relatedId: 'event-123',
    description: 'Asistencia a evento',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditsService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
            },
            creditTransaction: {
              findMany: jest.fn(),
              findFirst: jest.fn(),
              create: jest.fn(),
              count: jest.fn(),
              aggregate: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CreditsService>(CreditsService);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('grantCredits', () => {
    it('should grant credits successfully', async () => {
      const updatedUser = { credits: 110 };

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.creditTransaction.findMany.mockResolvedValue([]);
      prismaService.creditTransaction.findFirst.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation((callback) => {
        return callback({
          user: {
            update: jest.fn().mockResolvedValue(updatedUser),
          },
          creditTransaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        });
      });

      const result = await service.grantCredits(
        'user-123',
        10,
        CreditReason.EVENT_ATTENDANCE,
        'event-123',
        'Test event'
      );

      expect(result.newBalance).toBe(110);
      expect(result.amount).toBe(10);
      expect(result.leveledUp).toBe(false);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.grantCredits('non-existent', 10, CreditReason.EVENT_ATTENDANCE)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when daily limit exceeded', async () => {
      const existingTransactions = [
        { amount: 10 },
        { amount: 5 },
      ];

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.creditTransaction.findMany.mockResolvedValue(existingTransactions);

      // EVENT_ATTENDANCE has dailyLimit: 15, trying to add 5 more when already has 15
      await expect(
        service.grantCredits('user-123', 5, CreditReason.EVENT_ATTENDANCE)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for duplicate transaction', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.creditTransaction.findMany.mockResolvedValue([]);
      prismaService.creditTransaction.findFirst.mockResolvedValue(mockTransaction);

      await expect(
        service.grantCredits('user-123', 10, CreditReason.EVENT_ATTENDANCE, 'event-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should detect level up', async () => {
      const lowCreditUser = { ...mockUser, credits: 40 };
      const updatedUser = { credits: 50 }; // Crosses to level 2 (Brote)

      prismaService.user.findUnique.mockResolvedValue(lowCreditUser);
      prismaService.creditTransaction.findMany.mockResolvedValue([]);
      prismaService.creditTransaction.findFirst.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation((callback) => {
        return callback({
          user: {
            update: jest.fn().mockResolvedValue(updatedUser),
          },
          creditTransaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        });
      });

      const result = await service.grantCredits(
        'user-123',
        10,
        CreditReason.ADMIN_GRANT
      );

      expect(result.leveledUp).toBe(true);
      expect(result.level.level).toBe(2);
      expect(result.level.name).toBe('Brote');
    });

    it('should allow admin grants without daily limit', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.creditTransaction.findMany.mockResolvedValue([]);
      prismaService.creditTransaction.findFirst.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation((callback) => {
        return callback({
          user: {
            update: jest.fn().mockResolvedValue({ credits: 200 }),
          },
          creditTransaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        });
      });

      const result = await service.grantCredits(
        'user-123',
        100,
        CreditReason.ADMIN_GRANT
      );

      expect(result.newBalance).toBe(200);
    });
  });

  describe('spendCredits', () => {
    it('should spend credits successfully', async () => {
      const updatedUser = { credits: 90 };
      const spendTransaction = { ...mockTransaction, amount: -10, balance: 90 };

      prismaService.$transaction.mockImplementation((callback) => {
        return callback({
          user: {
            findUnique: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(updatedUser),
          },
          creditTransaction: {
            create: jest.fn().mockResolvedValue(spendTransaction),
          },
        });
      });

      const result = await service.spendCredits(
        'user-123',
        10,
        CreditReason.PURCHASE,
        'offer-123'
      );

      expect(result.newBalance).toBe(90);
      expect(result.spent).toBe(10);
      expect(result.transaction.amount).toBe(-10);
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.$transaction.mockImplementation((callback) => {
        return callback({
          user: {
            findUnique: jest.fn().mockResolvedValue(null),
          },
        });
      });

      await expect(
        service.spendCredits('non-existent', 10, CreditReason.PURCHASE)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when insufficient credits', async () => {
      const poorUser = { ...mockUser, credits: 5 };

      prismaService.$transaction.mockImplementation((callback) => {
        return callback({
          user: {
            findUnique: jest.fn().mockResolvedValue(poorUser),
          },
        });
      });

      await expect(
        service.spendCredits('user-123', 10, CreditReason.PURCHASE)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserLevel', () => {
    it('should return correct level for credits', () => {
      expect(service.getUserLevel(0).level).toBe(1);
      expect(service.getUserLevel(0).name).toBe('Semilla');

      expect(service.getUserLevel(50).level).toBe(2);
      expect(service.getUserLevel(50).name).toBe('Brote');

      expect(service.getUserLevel(150).level).toBe(3);
      expect(service.getUserLevel(150).name).toBe('Colaborador');

      expect(service.getUserLevel(1000).level).toBe(6);
      expect(service.getUserLevel(1000).name).toBe('Líder');

      expect(service.getUserLevel(5000).level).toBe(6); // Max level
    });

    it('should return level 1 for negative credits', () => {
      const level = service.getUserLevel(-10);
      expect(level.level).toBe(1);
      expect(level.name).toBe('Semilla');
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      const transactions = [mockTransaction];

      prismaService.creditTransaction.findMany.mockResolvedValue(transactions);
      prismaService.creditTransaction.count.mockResolvedValue(1);

      const result = await service.getTransactions('user-123');

      expect(result.transactions).toEqual(transactions);
      expect(result.total).toBe(1);
      expect(result.limit).toBe(50);
      expect(result.offset).toBe(0);
    });

    it('should filter by earning type', async () => {
      prismaService.creditTransaction.findMany.mockResolvedValue([]);
      prismaService.creditTransaction.count.mockResolvedValue(0);

      await service.getTransactions('user-123', { type: 'earning' });

      const whereClause = prismaService.creditTransaction.findMany.mock.calls[0][0].where;
      expect(whereClause.amount).toEqual({ gt: 0 });
    });

    it('should filter by spending type', async () => {
      prismaService.creditTransaction.findMany.mockResolvedValue([]);
      prismaService.creditTransaction.count.mockResolvedValue(0);

      await service.getTransactions('user-123', { type: 'spending' });

      const whereClause = prismaService.creditTransaction.findMany.mock.calls[0][0].where;
      expect(whereClause.amount).toEqual({ lt: 0 });
    });

    it('should support custom pagination', async () => {
      prismaService.creditTransaction.findMany.mockResolvedValue([]);
      prismaService.creditTransaction.count.mockResolvedValue(0);

      await service.getTransactions('user-123', { limit: 10, offset: 20 });

      const findOptions = prismaService.creditTransaction.findMany.mock.calls[0][0];
      expect(findOptions.take).toBe(10);
      expect(findOptions.skip).toBe(20);
    });
  });

  describe('getBalance', () => {
    it('should return balance and level info', async () => {
      prismaService.user.findUnique.mockResolvedValue({ credits: 75 });

      const result = await service.getBalance('user-123');

      expect(result.balance).toBe(75);
      expect(result.level.level).toBe(2); // Brote (50-149)
      expect(result.nextLevel?.level).toBe(3); // Colaborador
      expect(result.progress).toBeGreaterThan(0);
      expect(result.progress).toBeLessThan(100);
    });

    it('should return 100% progress for max level', async () => {
      prismaService.user.findUnique.mockResolvedValue({ credits: 2000 });

      const result = await service.getBalance('user-123');

      expect(result.level.level).toBe(6); // Líder
      expect(result.nextLevel).toBeUndefined();
      expect(result.progress).toBe(100);
    });

    it('should throw NotFoundException when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getBalance('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('getEarningStats', () => {
    it('should return earning statistics', async () => {
      const mockAggregate = { _sum: { amount: 10 } };

      prismaService.creditTransaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 5 } }) // today
        .mockResolvedValueOnce({ _sum: { amount: 15 } }) // week
        .mockResolvedValueOnce({ _sum: { amount: 50 } }) // month
        .mockResolvedValueOnce({ _sum: { amount: 200 } }) // total earned
        .mockResolvedValueOnce({ _sum: { amount: -50 } }); // total spent

      const result = await service.getEarningStats('user-123');

      expect(result.today).toBe(5);
      expect(result.week).toBe(15);
      expect(result.month).toBe(50);
      expect(result.totalEarned).toBe(200);
      expect(result.totalSpent).toBe(50); // Should be positive
    });

    it('should handle null aggregates gracefully', async () => {
      const nullAggregate = { _sum: { amount: null } };

      prismaService.creditTransaction.aggregate.mockResolvedValue(nullAggregate);

      const result = await service.getEarningStats('user-123');

      expect(result.today).toBe(0);
      expect(result.week).toBe(0);
      expect(result.month).toBe(0);
      expect(result.totalEarned).toBe(0);
      expect(result.totalSpent).toBe(0);
    });
  });

  describe('getEarningOpportunities', () => {
    it('should return list of earning opportunities', () => {
      const opportunities = service.getEarningOpportunities();

      expect(opportunities.length).toBeGreaterThan(0);
      expect(opportunities.every(opp => opp.amount > 0)).toBe(true);

      const eventOpportunity = opportunities.find(
        opp => opp.reason === CreditReason.EVENT_ATTENDANCE
      );
      expect(eventOpportunity).toBeDefined();
      expect(eventOpportunity?.amount).toBe(3);
      expect(eventOpportunity?.dailyLimit).toBe(15);
    });

    it('should not include spending reasons', () => {
      const opportunities = service.getEarningOpportunities();

      const spendingReasons = [
        CreditReason.PURCHASE,
        CreditReason.DISCOUNT,
        CreditReason.SERVICE,
      ];

      opportunities.forEach(opp => {
        expect(spendingReasons).not.toContain(opp.reason);
      });
    });
  });

  describe('getLeaderboard', () => {
    it('should return top users with levels', async () => {
      const topUsers = [
        { id: '1', name: 'User 1', avatar: null, credits: 500 },
        { id: '2', name: 'User 2', avatar: null, credits: 300 },
        { id: '3', name: 'User 3', avatar: null, credits: 150 },
      ];

      prismaService.user.findMany.mockResolvedValue(topUsers);

      const result = await service.getLeaderboard(3);

      expect(result).toHaveLength(3);
      expect(result[0].level.level).toBe(5); // Impulsor
      expect(result[1].level.level).toBe(4); // Conector
      expect(result[2].level.level).toBe(3); // Colaborador
    });

    it('should respect limit parameter', async () => {
      prismaService.user.findMany.mockResolvedValue([]);

      await service.getLeaderboard(5);

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
        })
      );
    });

    it('should use default limit of 10', async () => {
      prismaService.user.findMany.mockResolvedValue([]);

      await service.getLeaderboard();

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      );
    });

    it('should order by credits descending', async () => {
      prismaService.user.findMany.mockResolvedValue([]);

      await service.getLeaderboard();

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { credits: 'desc' },
        })
      );
    });
  });

  describe('Concurrency Tests - Atomic Transactions', () => {
    // Nota: Estos tests verifican que el código usa transacciones atómicas correctamente.
    // Los tests unitarios no pueden simular race conditions reales, pero verifican
    // que las transacciones se usen correctamente. Para tests de integración reales
    // con concurrencia, se necesitaría una base de datos real.

    it('should use atomic transaction for grantCredits', async () => {
      const transactionCallback = jest.fn(async (tx) => {
        return {
          updatedUser: { credits: 110 },
          creditTransaction: mockTransaction,
        };
      });

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.creditTransaction.findMany.mockResolvedValue([]);
      prismaService.creditTransaction.findFirst.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation((callback) => {
        return callback({
          user: {
            update: jest.fn().mockResolvedValue({ credits: 110 }),
          },
          creditTransaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        });
      });

      await service.grantCredits(
        'user-123',
        10,
        CreditReason.EVENT_ATTENDANCE
      );

      // Verificar que $transaction fue llamado con una función callback
      expect(prismaService.$transaction).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should use atomic transaction for spendCredits', async () => {
      prismaService.$transaction.mockImplementation((callback) => {
        return callback({
          user: {
            findUnique: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue({ credits: 90 }),
          },
          creditTransaction: {
            create: jest.fn().mockResolvedValue({
              ...mockTransaction,
              amount: -10,
              balance: 90,
            }),
          },
        });
      });

      await service.spendCredits(
        'user-123',
        10,
        CreditReason.PURCHASE
      );

      // Verificar que $transaction fue llamado con una función callback
      expect(prismaService.$transaction).toHaveBeenCalledWith(
        expect.any(Function)
      );
    });

    it('should validate balance inside transaction for spendCredits', async () => {
      const poorUser = { ...mockUser, credits: 5 };

      prismaService.$transaction.mockImplementation((callback) => {
        return callback({
          user: {
            findUnique: jest.fn().mockResolvedValue(poorUser),
          },
        });
      });

      // Debe lanzar error DENTRO de la transacción
      await expect(
        service.spendCredits('user-123', 10, CreditReason.PURCHASE)
      ).rejects.toThrow(BadRequestException);

      // La transacción debe haber sido llamada
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should use increment operation in grantCredits', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ credits: 110 });

      prismaService.user.findUnique.mockResolvedValue(mockUser);
      prismaService.creditTransaction.findMany.mockResolvedValue([]);
      prismaService.creditTransaction.findFirst.mockResolvedValue(null);
      prismaService.$transaction.mockImplementation((callback) => {
        return callback({
          user: {
            update: mockUpdate,
          },
          creditTransaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        });
      });

      await service.grantCredits(
        'user-123',
        10,
        CreditReason.EVENT_ATTENDANCE
      );

      // Verificar que se usa increment en lugar de asignar un valor calculado
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            credits: { increment: 10 },
          }),
        })
      );
    });

    it('should use decrement operation in spendCredits', async () => {
      const mockUpdate = jest.fn().mockResolvedValue({ credits: 90 });

      prismaService.$transaction.mockImplementation((callback) => {
        return callback({
          user: {
            findUnique: jest.fn().mockResolvedValue(mockUser),
            update: mockUpdate,
          },
          creditTransaction: {
            create: jest.fn().mockResolvedValue({
              ...mockTransaction,
              amount: -10,
            }),
          },
        });
      });

      await service.spendCredits(
        'user-123',
        10,
        CreditReason.PURCHASE
      );

      // Verificar que se usa decrement en lugar de asignar un valor calculado
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            credits: { decrement: 10 },
          }),
        })
      );
    });
  });
});
