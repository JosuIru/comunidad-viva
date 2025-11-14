import { Test, TestingModule } from '@nestjs/testing';
import { OffersService } from './offers.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';
import { OfferType, OfferStatus } from '@prisma/client';

describe('OffersService', () => {
  let service: OffersService;
  let prisma: PrismaService;
  let emailService: EmailService;

  const mockPrismaService = {
    offer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    offerInterest: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  const mockEmailService = {
    sendOfferInterest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OffersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<OffersService>(OffersService);
    prisma = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an offer', async () => {
      const userId = 'user-id';
      const offerData = {
        title: 'Test Offer',
        description: 'Test Description',
        type: OfferType.SERVICE,
        category: 'SERVICES',
        priceCredits: 10,
      };

      const mockOffer = {
        id: 'offer-id',
        userId,
        ...offerData,
        status: OfferStatus.ACTIVE,
        createdAt: new Date(),
      };

      mockPrismaService.offer.create.mockResolvedValue(mockOffer);

      const result = await service.create(userId, offerData);

      expect(result).toEqual(mockOffer);
      expect(mockPrismaService.offer.create).toHaveBeenCalledWith({
        data: {
          ...offerData,
          userId,
        },
      });
    });
  });

  describe('findAll', () => {
    it('should return all active offers', async () => {
      const mockOffers = [
        {
          id: 'offer-1',
          title: 'Offer 1',
          status: OfferStatus.ACTIVE,
          user: { id: 'user-1', name: 'User 1', avatar: null },
        },
        {
          id: 'offer-2',
          title: 'Offer 2',
          status: OfferStatus.ACTIVE,
          user: { id: 'user-2', name: 'User 2', avatar: null },
        },
      ];

      mockPrismaService.offer.findMany.mockResolvedValue(mockOffers);

      const result = await service.findAll();

      expect(result).toEqual(mockOffers);
      expect(mockPrismaService.offer.findMany).toHaveBeenCalledWith({
        where: {
          status: OfferStatus.ACTIVE,
        },
        select: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter offers by type', async () => {
      const mockOffers = [
        {
          id: 'offer-1',
          type: OfferType.PRODUCT,
          status: OfferStatus.ACTIVE,
        },
      ];

      mockPrismaService.offer.findMany.mockResolvedValue(mockOffers);

      await service.findAll({ type: OfferType.PRODUCT });

      expect(mockPrismaService.offer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: OfferStatus.ACTIVE,
            type: OfferType.PRODUCT,
          }),
        }),
      );
    });

    it('should filter offers by category', async () => {
      const mockOffers = [
        {
          id: 'offer-1',
          category: 'FOOD',
          status: OfferStatus.ACTIVE,
        },
      ];

      mockPrismaService.offer.findMany.mockResolvedValue(mockOffers);

      await service.findAll({ category: 'FOOD' });

      expect(mockPrismaService.offer.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: OfferStatus.ACTIVE,
            category: 'FOOD',
          }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return offer and increment views', async () => {
      const offerId = 'offer-id';
      const mockOffer = {
        id: offerId,
        title: 'Test Offer',
        views: 5,
        user: { id: 'user-id', name: 'Test User' },
        interestedUsers: [],
      };

      mockPrismaService.offer.update.mockResolvedValue({});
      mockPrismaService.offer.findUnique.mockResolvedValue(mockOffer);

      const result = await service.findOne(offerId);

      expect(result).toBeDefined();
      expect(result.userIsInterested).toBe(false);
      expect(mockPrismaService.offer.update).toHaveBeenCalledWith({
        where: { id: offerId },
        data: {
          views: { increment: 1 },
        },
      });
    });

    it('should return null if offer not found', async () => {
      const offerId = 'non-existent-id';

      mockPrismaService.offer.update.mockResolvedValue({});
      mockPrismaService.offer.findUnique.mockResolvedValue(null);

      const result = await service.findOne(offerId);

      expect(result).toBeNull();
    });

    it('should indicate if user is interested', async () => {
      const offerId = 'offer-id';
      const userId = 'user-id';
      const mockOffer = {
        id: offerId,
        title: 'Test Offer',
        user: { id: 'owner-id', name: 'Owner' },
        interestedUsers: [{ id: 'interest-id' }],
      };

      mockPrismaService.offer.update.mockResolvedValue({});
      mockPrismaService.offer.findUnique.mockResolvedValue(mockOffer);

      const result = await service.findOne(offerId, userId);

      expect(result.userIsInterested).toBe(true);
    });
  });

  describe('toggleInterest', () => {
    it('should add interest if not already interested', async () => {
      const offerId = 'offer-id';
      const userId = 'user-id';

      const mockOffer = {
        id: offerId,
        title: 'Test Offer',
        userId: 'owner-id',
        user: {
          id: 'owner-id',
          name: 'Owner',
          email: 'owner@test.com',
        },
      };

      const mockUser = {
        id: userId,
        name: 'Interested User',
        email: 'user@test.com',
      };

      mockPrismaService.offerInterest.findUnique.mockResolvedValue(null);
      mockPrismaService.offer.findUnique.mockResolvedValue(mockOffer);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.$transaction.mockResolvedValue([{}, {}]);
      mockEmailService.sendOfferInterest.mockResolvedValue(undefined);

      const result = await service.toggleInterest(offerId, userId);

      expect(result.interested).toBe(true);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(mockEmailService.sendOfferInterest).toHaveBeenCalledWith(
        'owner@test.com',
        'Interested User',
        'user@test.com',
        'Test Offer',
      );
    });

    it('should remove interest if already interested', async () => {
      const offerId = 'offer-id';
      const userId = 'user-id';

      const mockExistingInterest = {
        id: 'interest-id',
        userId,
        offerId,
      };

      mockPrismaService.offerInterest.findUnique.mockResolvedValue(mockExistingInterest);
      mockPrismaService.$transaction.mockResolvedValue([{}, {}]);

      const result = await service.toggleInterest(offerId, userId);

      expect(result.interested).toBe(false);
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should not send email if user is the offer owner', async () => {
      const offerId = 'offer-id';
      const userId = 'owner-id'; // Same as offer owner

      const mockOffer = {
        id: offerId,
        title: 'Test Offer',
        userId: 'owner-id', // Same user
        user: {
          id: 'owner-id',
          name: 'Owner',
          email: 'owner@test.com',
        },
      };

      const mockUser = {
        id: userId,
        name: 'Owner',
        email: 'owner@test.com',
      };

      mockPrismaService.offerInterest.findUnique.mockResolvedValue(null);
      mockPrismaService.offer.findUnique.mockResolvedValue(mockOffer);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.$transaction.mockResolvedValue([{}, {}]);

      await service.toggleInterest(offerId, userId);

      expect(mockEmailService.sendOfferInterest).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update offer', async () => {
      const offerId = 'offer-id';
      const userId = 'user-id';
      const updateData = {
        title: 'Updated Title',
        description: 'Updated Description',
      };

      const mockUpdatedOffer = {
        id: offerId,
        userId,
        ...updateData,
        status: OfferStatus.ACTIVE,
      };

      mockPrismaService.offer.update.mockResolvedValue(mockUpdatedOffer);

      const result = await service.update(offerId, userId, updateData);

      expect(result).toEqual(mockUpdatedOffer);
      expect(mockPrismaService.offer.update).toHaveBeenCalledWith({
        where: { id: offerId, userId },
        data: updateData,
      });
    });
  });

  describe('delete', () => {
    it('should mark offer as cancelled (soft delete)', async () => {
      const offerId = 'offer-id';
      const userId = 'user-id';

      const mockCancelledOffer = {
        id: offerId,
        userId,
        status: OfferStatus.CANCELLED,
      };

      mockPrismaService.offer.update.mockResolvedValue(mockCancelledOffer);

      const result = await service.delete(offerId, userId);

      expect(result.status).toBe(OfferStatus.CANCELLED);
      expect(mockPrismaService.offer.update).toHaveBeenCalledWith({
        where: { id: offerId, userId },
        data: { status: OfferStatus.CANCELLED },
      });
    });
  });

  describe('findUserOffers', () => {
    it('should return all non-cancelled offers for user', async () => {
      const userId = 'user-id';

      const mockOffers = [
        {
          id: 'offer-1',
          userId,
          title: 'Offer 1',
          status: OfferStatus.ACTIVE,
          user: { id: userId, name: 'User' },
          interestedUsers: [],
        },
        {
          id: 'offer-2',
          userId,
          title: 'Offer 2',
          status: OfferStatus.COMPLETED,
          user: { id: userId, name: 'User' },
          interestedUsers: [],
        },
      ];

      mockPrismaService.offer.findMany.mockResolvedValue(mockOffers);

      const result = await service.findUserOffers(userId);

      expect(result).toEqual(mockOffers);
      expect(mockPrismaService.offer.findMany).toHaveBeenCalledWith({
        where: {
          userId,
          status: {
            not: OfferStatus.CANCELLED,
          },
        },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should include interested users', async () => {
      const userId = 'user-id';

      const mockOffers = [
        {
          id: 'offer-1',
          userId,
          title: 'Offer 1',
          status: OfferStatus.ACTIVE,
          user: { id: userId, name: 'User' },
          interestedUsers: [
            {
              id: 'interest-1',
              user: {
                id: 'interested-user-1',
                name: 'Interested User 1',
                email: 'user1@test.com',
              },
            },
            {
              id: 'interest-2',
              user: {
                id: 'interested-user-2',
                name: 'Interested User 2',
                email: 'user2@test.com',
              },
            },
          ],
        },
      ];

      mockPrismaService.offer.findMany.mockResolvedValue(mockOffers);

      const result = await service.findUserOffers(userId);

      expect(result[0].interestedUsers).toHaveLength(2);
    });
  });
});
