import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { TimeBankService } from './timebank.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { EmailService } from '../notifications/email.service';
import { TransactionStatus, CreditReason } from '@prisma/client';

describe('TimeBankService', () => {
  let service: TimeBankService;
  let prismaService: any;
  let creditsService: any;
  let emailService: any;

  const mockUser = {
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    avatar: null,
  };

  const mockProvider = {
    id: 'provider-123',
    name: 'Provider',
    email: 'provider@example.com',
    avatar: null,
  };

  const mockTransaction = {
    id: 'tx-123',
    requesterId: 'user-123',
    providerId: 'provider-123',
    description: 'Help with gardening',
    hours: 2,
    credits: 2,
    scheduledFor: new Date(),
    status: TransactionStatus.PENDING,
    requesterRating: null,
    providerRating: null,
    requesterComment: null,
    providerComment: null,
    impactStory: null,
    chainedFavor: false,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeBankService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
            timeBankOffer: {
              findUnique: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            timeBankTransaction: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
              aggregate: jest.fn(),
            },
          },
        },
        {
          provide: CreditsService,
          useValue: {
            grantCredits: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendTimeBankRequest: jest.fn(),
            sendTimeBankConfirmation: jest.fn(),
            sendTimeBankCompletion: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TimeBankService>(TimeBankService);
    prismaService = module.get(PrismaService);
    creditsService = module.get(CreditsService);
    emailService = module.get(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRequest', () => {
    const createRequestDto = {
      providerId: 'provider-123',
      description: 'Help with gardening',
      hours: 2,
      scheduledFor: new Date().toISOString(),
    };

    it('should create a time bank request successfully', async () => {
      const createdTransaction = {
        ...mockTransaction,
        requester: mockUser,
        provider: mockProvider,
      };

      prismaService.user.findUnique.mockResolvedValue(mockProvider);
      prismaService.timeBankTransaction.create.mockResolvedValue(createdTransaction);
      emailService.sendTimeBankRequest.mockResolvedValue(true);

      const result = await service.createRequest('user-123', createRequestDto);

      expect(result).toEqual(createdTransaction);
      expect(prismaService.timeBankTransaction.create).toHaveBeenCalled();
      expect(emailService.sendTimeBankRequest).toHaveBeenCalledWith(
        'provider@example.com',
        'Test User',
        'Help with gardening',
        2,
        expect.any(Date)
      );
    });

    it('should throw NotFoundException when provider not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createRequest('user-123', createRequestDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when requesting from yourself', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.createRequest('user-123', { ...createRequestDto, providerId: 'user-123' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should validate offer belongs to provider', async () => {
      const wrongOffer = {
        id: 'offer-123',
        offer: { userId: 'other-user' },
      };

      prismaService.user.findUnique.mockResolvedValue(mockProvider);
      prismaService.timeBankOffer.findUnique.mockResolvedValue(wrongOffer);

      await expect(
        service.createRequest('user-123', { ...createRequestDto, offerId: 'offer-123' })
      ).rejects.toThrow(BadRequestException);
    });

    it('should calculate credits correctly (1 per hour, rounded)', async () => {
      const createdTransaction = {
        ...mockTransaction,
        hours: 2.7,
        credits: 3,
        requester: mockUser,
        provider: mockProvider,
      };

      prismaService.user.findUnique.mockResolvedValue(mockProvider);
      prismaService.timeBankTransaction.create.mockResolvedValue(createdTransaction);
      emailService.sendTimeBankRequest.mockResolvedValue(true);

      await service.createRequest('user-123', { ...createRequestDto, hours: 2.7 });

      const createCall = prismaService.timeBankTransaction.create.mock.calls[0][0];
      expect(createCall.data.credits).toBe(3);
    });
  });

  describe('confirmTransaction', () => {
    it('should confirm transaction as provider', async () => {
      const updatedTransaction = {
        ...mockTransaction,
        status: TransactionStatus.CONFIRMED,
        requester: mockUser,
        provider: mockProvider,
      };

      prismaService.timeBankTransaction.findUnique.mockResolvedValue(mockTransaction);
      prismaService.timeBankTransaction.update.mockResolvedValue(updatedTransaction);
      emailService.sendTimeBankConfirmation.mockResolvedValue(true);

      const result = await service.confirmTransaction('tx-123', 'provider-123', true);

      expect(result.status).toBe(TransactionStatus.CONFIRMED);
      expect(emailService.sendTimeBankConfirmation).toHaveBeenCalledWith(
        'test@example.com',
        'Provider',
        'Help with gardening',
        true
      );
    });

    it('should reject transaction as provider', async () => {
      const updatedTransaction = {
        ...mockTransaction,
        status: TransactionStatus.CANCELLED,
        requester: mockUser,
        provider: mockProvider,
      };

      prismaService.timeBankTransaction.findUnique.mockResolvedValue(mockTransaction);
      prismaService.timeBankTransaction.update.mockResolvedValue(updatedTransaction);
      emailService.sendTimeBankConfirmation.mockResolvedValue(true);

      const result = await service.confirmTransaction('tx-123', 'provider-123', false);

      expect(result.status).toBe(TransactionStatus.CANCELLED);
      expect(emailService.sendTimeBankConfirmation).toHaveBeenCalledWith(
        'test@example.com',
        'Provider',
        'Help with gardening',
        false
      );
    });

    it('should throw ForbiddenException if not provider', async () => {
      prismaService.timeBankTransaction.findUnique.mockResolvedValue(mockTransaction);

      await expect(
        service.confirmTransaction('tx-123', 'other-user', true)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if transaction not pending', async () => {
      const confirmedTransaction = {
        ...mockTransaction,
        status: TransactionStatus.CONFIRMED,
      };

      prismaService.timeBankTransaction.findUnique.mockResolvedValue(confirmedTransaction);

      await expect(
        service.confirmTransaction('tx-123', 'provider-123', true)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('completeTransaction', () => {
    const confirmedTransaction = {
      ...mockTransaction,
      status: TransactionStatus.CONFIRMED,
    };

    const completeDto = {
      rating: 5,
      comment: 'Great help!',
    };

    it('should complete transaction from requester side', async () => {
      const updatedTransaction = {
        ...confirmedTransaction,
        requesterRating: 5,
        requesterComment: 'Great help!',
        requester: mockUser,
        provider: mockProvider,
      };

      prismaService.timeBankTransaction.findUnique.mockResolvedValue(confirmedTransaction);
      prismaService.timeBankTransaction.update.mockResolvedValue(updatedTransaction);

      const result = await service.completeTransaction('tx-123', 'user-123', completeDto);

      expect(result.requesterRating).toBe(5);
      expect(result.status).toBe(TransactionStatus.CONFIRMED); // Not completed yet
    });

    it('should complete transaction and award credits when both sides done', async () => {
      const partiallyCompleted = {
        ...confirmedTransaction,
        providerRating: 5,
        providerComment: 'Nice person',
      };

      const fullyCompleted = {
        ...partiallyCompleted,
        requesterRating: 5,
        requesterComment: 'Great help!',
        status: TransactionStatus.COMPLETED,
        completedAt: new Date(),
        requester: mockUser,
        provider: mockProvider,
      };

      prismaService.timeBankTransaction.findUnique.mockResolvedValue(partiallyCompleted);
      prismaService.timeBankTransaction.update.mockResolvedValue(fullyCompleted);
      creditsService.grantCredits.mockResolvedValue({});
      emailService.sendTimeBankCompletion.mockResolvedValue(true);

      const result = await service.completeTransaction('tx-123', 'user-123', completeDto);

      expect(result.status).toBe(TransactionStatus.COMPLETED);
      expect(creditsService.grantCredits).toHaveBeenCalledWith(
        'provider-123',
        2,
        CreditReason.TIME_BANK_HOUR,
        'tx-123',
        expect.any(String)
      );
      expect(emailService.sendTimeBankCompletion).toHaveBeenCalledTimes(2);
    });

    it('should throw BadRequestException if not confirmed', async () => {
      prismaService.timeBankTransaction.findUnique.mockResolvedValue(mockTransaction);

      await expect(
        service.completeTransaction('tx-123', 'user-123', completeDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if not part of transaction', async () => {
      prismaService.timeBankTransaction.findUnique.mockResolvedValue(confirmedTransaction);

      await expect(
        service.completeTransaction('tx-123', 'other-user', completeDto)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if already completed side', async () => {
      const alreadyRated = {
        ...confirmedTransaction,
        requesterRating: 4,
        requesterComment: 'Already rated',
      };

      prismaService.timeBankTransaction.findUnique.mockResolvedValue(alreadyRated);

      await expect(
        service.completeTransaction('tx-123', 'user-123', completeDto)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelTransaction', () => {
    it('should cancel transaction as requester', async () => {
      const cancelledTransaction = {
        ...mockTransaction,
        status: TransactionStatus.CANCELLED,
        requester: mockUser,
        provider: mockProvider,
      };

      prismaService.timeBankTransaction.findUnique.mockResolvedValue(mockTransaction);
      prismaService.timeBankTransaction.update.mockResolvedValue(cancelledTransaction);

      const result = await service.cancelTransaction('tx-123', 'user-123');

      expect(result.status).toBe(TransactionStatus.CANCELLED);
    });

    it('should throw ForbiddenException if not part of transaction', async () => {
      prismaService.timeBankTransaction.findUnique.mockResolvedValue(mockTransaction);

      await expect(
        service.cancelTransaction('tx-123', 'other-user')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if already completed', async () => {
      const completedTransaction = {
        ...mockTransaction,
        status: TransactionStatus.COMPLETED,
      };

      prismaService.timeBankTransaction.findUnique.mockResolvedValue(completedTransaction);

      await expect(
        service.cancelTransaction('tx-123', 'user-123')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getTransactions', () => {
    it('should return user transactions', async () => {
      const transactions = [mockTransaction];

      prismaService.timeBankTransaction.findMany.mockResolvedValue(transactions);
      prismaService.timeBankTransaction.count.mockResolvedValue(1);

      const result = await service.getTransactions('user-123');

      expect(result.transactions).toEqual(transactions);
      expect(result.total).toBe(1);
    });

    it('should filter by status', async () => {
      prismaService.timeBankTransaction.findMany.mockResolvedValue([]);
      prismaService.timeBankTransaction.count.mockResolvedValue(0);

      await service.getTransactions('user-123', { status: TransactionStatus.COMPLETED });

      const whereClause = prismaService.timeBankTransaction.findMany.mock.calls[0][0].where;
      expect(whereClause.status).toBe(TransactionStatus.COMPLETED);
    });

    it('should filter by role (requester)', async () => {
      prismaService.timeBankTransaction.findMany.mockResolvedValue([]);
      prismaService.timeBankTransaction.count.mockResolvedValue(0);

      await service.getTransactions('user-123', { role: 'requester' });

      const whereClause = prismaService.timeBankTransaction.findMany.mock.calls[0][0].where;
      expect(whereClause.OR).toEqual([{ requesterId: 'user-123' }]);
    });

    it('should filter by role (provider)', async () => {
      prismaService.timeBankTransaction.findMany.mockResolvedValue([]);
      prismaService.timeBankTransaction.count.mockResolvedValue(0);

      await service.getTransactions('user-123', { role: 'provider' });

      const whereClause = prismaService.timeBankTransaction.findMany.mock.calls[0][0].where;
      expect(whereClause.OR).toEqual([{ providerId: 'user-123' }]);
    });
  });

  describe('getTransaction', () => {
    it('should return transaction details', async () => {
      const transactionWithDetails = {
        ...mockTransaction,
        requester: mockUser,
        provider: mockProvider,
      };

      prismaService.timeBankTransaction.findUnique.mockResolvedValue(transactionWithDetails);

      const result = await service.getTransaction('tx-123', 'user-123');

      expect(result).toEqual(transactionWithDetails);
    });

    it('should throw NotFoundException if transaction not found', async () => {
      prismaService.timeBankTransaction.findUnique.mockResolvedValue(null);

      await expect(
        service.getTransaction('non-existent', 'user-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if not part of transaction', async () => {
      prismaService.timeBankTransaction.findUnique.mockResolvedValue(mockTransaction);

      await expect(
        service.getTransaction('tx-123', 'other-user')
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getAvailableOffers', () => {
    it('should return available offers', async () => {
      const offers = [{ id: 'offer-1' }];

      prismaService.timeBankOffer.findMany.mockResolvedValue(offers);
      prismaService.timeBankOffer.count.mockResolvedValue(1);

      const result = await service.getAvailableOffers();

      expect(result.offers).toEqual(offers);
      expect(result.total).toBe(1);
    });

    it('should filter by category', async () => {
      prismaService.timeBankOffer.findMany.mockResolvedValue([]);
      prismaService.timeBankOffer.count.mockResolvedValue(0);

      await service.getAvailableOffers({ category: 'GARDENING' });

      const whereClause = prismaService.timeBankOffer.findMany.mock.calls[0][0].where;
      expect(whereClause.skill.category).toBe('GARDENING');
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      prismaService.timeBankTransaction.count
        .mockResolvedValueOnce(5) // as requester
        .mockResolvedValueOnce(3); // as provider

      prismaService.timeBankTransaction.findMany.mockResolvedValue([
        { requesterRating: 5 },
        { requesterRating: 4 },
      ]);

      prismaService.timeBankTransaction.aggregate
        .mockResolvedValueOnce({ _sum: { hours: 10 } }) // hours provided
        .mockResolvedValueOnce({ _sum: { hours: 8 } }); // hours received

      const result = await service.getUserStats('user-123');

      expect(result.transactionsCompleted).toBe(8);
      expect(result.hoursProvided).toBe(10);
      expect(result.hoursReceived).toBe(8);
      expect(result.averageRating).toBe(4.5);
      expect(result.totalRatings).toBe(2);
    });

    it('should handle zero ratings', async () => {
      prismaService.timeBankTransaction.count.mockResolvedValue(0);
      prismaService.timeBankTransaction.findMany.mockResolvedValue([]);
      prismaService.timeBankTransaction.aggregate.mockResolvedValue({ _sum: { hours: null } });

      const result = await service.getUserStats('user-123');

      expect(result.averageRating).toBe(0);
      expect(result.totalRatings).toBe(0);
      expect(result.hoursProvided).toBe(0);
      expect(result.hoursReceived).toBe(0);
    });
  });

  describe('getUserTimeBankOffers', () => {
    it('should return user time bank offers', async () => {
      const offers = [{ id: 'offer-1' }, { id: 'offer-2' }];

      prismaService.timeBankOffer.findMany.mockResolvedValue(offers);

      const result = await service.getUserTimeBankOffers('user-123');

      expect(result).toEqual(offers);
      expect(prismaService.timeBankOffer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            offer: {
              userId: 'user-123',
            },
          },
        })
      );
    });
  });
});
