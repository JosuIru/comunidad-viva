import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { GroupBuysService } from './groupbuys.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../notifications/email.service';

describe('GroupBuysService', () => {
  let service: GroupBuysService;
  let prismaService: any;
  let emailService: any;

  const mockOffer = {
    id: 'offer-123',
    userId: 'user-123',
    title: 'Bulk Rice',
    description: 'Organic rice in bulk',
    type: 'GROUP_BUY',
    category: 'FOOD',
    priceEur: 2.5,
    status: 'ACTIVE',
    user: {
      id: 'user-123',
      name: 'Organizer',
      email: 'organizer@test.com',
    },
  };

  const mockPriceBreaks = [
    { minQuantity: 10, pricePerUnit: 2.0, savings: 0.5 },
    { minQuantity: 20, pricePerUnit: 1.5, savings: 1.0 },
  ];

  const mockGroupBuy = {
    id: 'groupbuy-123',
    offerId: 'offer-123',
    minParticipants: 5,
    maxParticipants: 20,
    currentParticipants: 3,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    pickupLat: 40.7128,
    pickupLng: -74.0060,
    pickupAddress: 'Test Pickup Location',
    priceBreaks: mockPriceBreaks,
    participants: [],
    offer: mockOffer,
  };

  const mockParticipant = {
    id: 'participant-123',
    groupBuyId: 'groupbuy-123',
    userId: 'user-456',
    quantity: 5,
    committed: false,
    joinedAt: new Date(),
    user: {
      id: 'user-456',
      name: 'Participant',
      avatar: null,
      email: 'participant@test.com',
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupBuysService,
        {
          provide: PrismaService,
          useValue: {
            offer: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            groupBuy: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
            groupBuyParticipant: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            groupBuyOrder: {
              create: jest.fn(),
            },
            $queryRaw: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            sendGroupBuyParticipation: jest.fn(),
            sendGroupBuyClosed: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<GroupBuysService>(GroupBuysService);
    prismaService = module.get(PrismaService);
    emailService = module.get(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createGroupBuy', () => {
    const createGroupBuyDto = {
      offerId: 'offer-123',
      minParticipants: 5,
      maxParticipants: 20,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      pickupLat: 40.7128,
      pickupLng: -74.0060,
      pickupAddress: 'Test Location',
      priceBreaks: mockPriceBreaks,
    };

    it('should create a group buy with price breaks', async () => {
      prismaService.offer.findUnique.mockResolvedValue(mockOffer);
      prismaService.groupBuy.create.mockResolvedValue(mockGroupBuy);

      const result = await service.createGroupBuy('user-123', createGroupBuyDto);

      expect(prismaService.offer.findUnique).toHaveBeenCalledWith({
        where: { id: 'offer-123' },
      });
      expect(prismaService.groupBuy.create).toHaveBeenCalled();
      expect(result).toEqual(mockGroupBuy);
    });

    it('should throw NotFoundException when offer not found', async () => {
      prismaService.offer.findUnique.mockResolvedValue(null);

      await expect(
        service.createGroupBuy('user-123', createGroupBuyDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not offer owner', async () => {
      prismaService.offer.findUnique.mockResolvedValue({
        ...mockOffer,
        userId: 'other-user',
      });

      await expect(
        service.createGroupBuy('user-123', createGroupBuyDto)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when offer type is not GROUP_BUY', async () => {
      prismaService.offer.findUnique.mockResolvedValue({
        ...mockOffer,
        type: 'SERVICE',
      });

      await expect(
        service.createGroupBuy('user-123', createGroupBuyDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when minParticipants >= maxParticipants', async () => {
      prismaService.offer.findUnique.mockResolvedValue(mockOffer);

      await expect(
        service.createGroupBuy('user-123', {
          ...createGroupBuyDto,
          minParticipants: 20,
          maxParticipants: 10,
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when deadline is in the past', async () => {
      prismaService.offer.findUnique.mockResolvedValue(mockOffer);

      await expect(
        service.createGroupBuy('user-123', {
          ...createGroupBuyDto,
          deadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
        })
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when price breaks do not decrease', async () => {
      prismaService.offer.findUnique.mockResolvedValue(mockOffer);

      await expect(
        service.createGroupBuy('user-123', {
          ...createGroupBuyDto,
          priceBreaks: [
            { minQuantity: 10, pricePerUnit: 2.0, savings: 0 },
            { minQuantity: 20, pricePerUnit: 2.5, savings: 0 }, // Price increases!
          ],
        })
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getActiveGroupBuys', () => {
    it('should return active group buys', async () => {
      const groupBuys = [mockGroupBuy];
      prismaService.groupBuy.findMany.mockResolvedValue(groupBuys);
      prismaService.groupBuy.count.mockResolvedValue(1);

      const result = await service.getActiveGroupBuys();

      expect(prismaService.groupBuy.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            deadline: { gte: expect.any(Date) },
          }),
        })
      );
      expect(result.groupBuys).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should filter by category', async () => {
      prismaService.groupBuy.findMany.mockResolvedValue([]);
      prismaService.groupBuy.count.mockResolvedValue(0);

      await service.getActiveGroupBuys({ category: 'FOOD' });

      const whereClause = prismaService.groupBuy.findMany.mock.calls[0][0].where;
      expect(whereClause.offer.category).toBe('FOOD');
    });

    it('should support pagination', async () => {
      prismaService.groupBuy.findMany.mockResolvedValue([]);
      prismaService.groupBuy.count.mockResolvedValue(0);

      await service.getActiveGroupBuys({ limit: 10, offset: 20 });

      const findOptions = prismaService.groupBuy.findMany.mock.calls[0][0];
      expect(findOptions.take).toBe(10);
      expect(findOptions.skip).toBe(20);
    });

    it('should use location-based query when coordinates provided', async () => {
      const mockResults = [{ ...mockGroupBuy, distance_km: 2.5 }];
      prismaService.$queryRaw.mockResolvedValue(mockResults);
      prismaService.groupBuy.count.mockResolvedValue(1);

      const result = await service.getActiveGroupBuys({
        nearLat: 40.7128,
        nearLng: -74.0060,
        maxDistance: 5,
      });

      expect(prismaService.$queryRaw).toHaveBeenCalled();
      expect(result.groupBuys).toHaveLength(1);
    });

    it('should calculate progress and tiers correctly', async () => {
      const groupBuyWithParticipants = {
        ...mockGroupBuy,
        participants: [
          { quantity: 5 },
          { quantity: 7 },
        ],
      };

      prismaService.groupBuy.findMany.mockResolvedValue([groupBuyWithParticipants]);
      prismaService.groupBuy.count.mockResolvedValue(1);

      const result = await service.getActiveGroupBuys();

      expect(result.groupBuys[0].totalQuantity).toBe(12);
      expect(result.groupBuys[0]).toHaveProperty('currentTier');
      expect(result.groupBuys[0]).toHaveProperty('nextTier');
      expect(result.groupBuys[0]).toHaveProperty('progress');
    });
  });

  describe('getGroupBuy', () => {
    it('should return group buy with enriched data', async () => {
      const groupBuyWithParticipants = {
        ...mockGroupBuy,
        participants: [mockParticipant],
      };

      prismaService.groupBuy.findUnique.mockResolvedValue(groupBuyWithParticipants);

      const result = await service.getGroupBuy('groupbuy-123');

      expect(prismaService.groupBuy.findUnique).toHaveBeenCalledWith({
        where: { id: 'groupbuy-123' },
        include: expect.any(Object),
      });
      expect(result).toHaveProperty('totalQuantity');
      expect(result).toHaveProperty('currentTier');
      expect(result).toHaveProperty('progress');
    });

    it('should throw NotFoundException when group buy not found', async () => {
      prismaService.groupBuy.findUnique.mockResolvedValue(null);

      await expect(service.getGroupBuy('non-existent')).rejects.toThrow(
        NotFoundException
      );
    });
  });

  describe('joinGroupBuy', () => {
    const joinDto = { quantity: 5 };

    it('should join group buy successfully', async () => {
      prismaService.groupBuy.findUnique.mockResolvedValue(mockGroupBuy);
      prismaService.groupBuyParticipant.create.mockResolvedValue(mockParticipant);
      prismaService.groupBuy.update.mockResolvedValue({ ...mockGroupBuy, currentParticipants: 4 });
      emailService.sendGroupBuyParticipation.mockResolvedValue(true);

      const result = await service.joinGroupBuy('groupbuy-123', 'user-456', joinDto);

      expect(prismaService.groupBuyParticipant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            groupBuyId: 'groupbuy-123',
            userId: 'user-456',
            quantity: 5,
          }),
        })
      );
      expect(result).toEqual(mockParticipant);
    });

    it('should send email to organizer on new participation', async () => {
      prismaService.groupBuy.findUnique
        .mockResolvedValueOnce(mockGroupBuy)
        .mockResolvedValueOnce({ ...mockGroupBuy, currentParticipants: 4 });
      prismaService.groupBuyParticipant.create.mockResolvedValue(mockParticipant);
      prismaService.groupBuy.update.mockResolvedValue(mockGroupBuy);
      emailService.sendGroupBuyParticipation.mockResolvedValue(true);

      await service.joinGroupBuy('groupbuy-123', 'user-456', joinDto);

      expect(emailService.sendGroupBuyParticipation).toHaveBeenCalledWith(
        'organizer@test.com',
        'Participant',
        'Bulk Rice',
        4,
        5
      );
    });

    it('should notify all participants when minimum reached', async () => {
      const groupBuyAtMinimum = {
        ...mockGroupBuy,
        currentParticipants: 4,
        minParticipants: 5,
      };

      const updatedGroupBuy = {
        ...groupBuyAtMinimum,
        currentParticipants: 5,
        participants: [mockParticipant, { ...mockParticipant, id: 'p2', email: 'user2@test.com' }],
      };

      prismaService.groupBuy.findUnique
        .mockResolvedValueOnce(groupBuyAtMinimum)
        .mockResolvedValueOnce(updatedGroupBuy);
      prismaService.groupBuyParticipant.create.mockResolvedValue(mockParticipant);
      prismaService.groupBuy.update.mockResolvedValue(updatedGroupBuy);
      emailService.sendGroupBuyParticipation.mockResolvedValue(true);

      await service.joinGroupBuy('groupbuy-123', 'user-456', joinDto);

      expect(emailService.sendGroupBuyParticipation).toHaveBeenCalled();
    });

    it('should throw NotFoundException when group buy not found', async () => {
      prismaService.groupBuy.findUnique.mockResolvedValue(null);

      await expect(
        service.joinGroupBuy('non-existent', 'user-456', joinDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when deadline passed', async () => {
      const pastGroupBuy = {
        ...mockGroupBuy,
        deadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };

      prismaService.groupBuy.findUnique.mockResolvedValue(pastGroupBuy);

      await expect(
        service.joinGroupBuy('groupbuy-123', 'user-456', joinDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when group buy is full', async () => {
      const fullGroupBuy = {
        ...mockGroupBuy,
        currentParticipants: 20,
        maxParticipants: 20,
      };

      prismaService.groupBuy.findUnique.mockResolvedValue(fullGroupBuy);

      await expect(
        service.joinGroupBuy('groupbuy-123', 'user-456', joinDto)
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when already joined', async () => {
      const groupBuyWithUser = {
        ...mockGroupBuy,
        participants: [{ userId: 'user-456', quantity: 3 }],
      };

      prismaService.groupBuy.findUnique.mockResolvedValue(groupBuyWithUser);

      await expect(
        service.joinGroupBuy('groupbuy-123', 'user-456', joinDto)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateParticipation', () => {
    const updateDto = { quantity: 10 };

    it('should update participation successfully', async () => {
      const updatedParticipant = { ...mockParticipant, quantity: 10 };

      prismaService.groupBuyParticipant.findUnique.mockResolvedValue(mockParticipant);
      prismaService.groupBuy.findUnique.mockResolvedValue(mockGroupBuy);
      prismaService.groupBuyParticipant.update.mockResolvedValue(updatedParticipant);

      const result = await service.updateParticipation('groupbuy-123', 'user-456', updateDto);

      expect(prismaService.groupBuyParticipant.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            groupBuyId_userId: { groupBuyId: 'groupbuy-123', userId: 'user-456' },
          },
          data: updateDto,
        })
      );
      expect(result.quantity).toBe(10);
    });

    it('should throw NotFoundException when participation not found', async () => {
      prismaService.groupBuyParticipant.findUnique.mockResolvedValue(null);

      await expect(
        service.updateParticipation('groupbuy-123', 'user-456', updateDto)
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when updating after deadline', async () => {
      const pastGroupBuy = {
        ...mockGroupBuy,
        deadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };

      prismaService.groupBuyParticipant.findUnique.mockResolvedValue(mockParticipant);
      prismaService.groupBuy.findUnique.mockResolvedValue(pastGroupBuy);

      await expect(
        service.updateParticipation('groupbuy-123', 'user-456', updateDto)
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('leaveGroupBuy', () => {
    it('should leave group buy successfully', async () => {
      prismaService.groupBuyParticipant.findUnique.mockResolvedValue(mockParticipant);
      prismaService.groupBuy.findUnique.mockResolvedValue(mockGroupBuy);
      prismaService.groupBuyParticipant.delete.mockResolvedValue(mockParticipant);
      prismaService.groupBuy.update.mockResolvedValue(mockGroupBuy);

      const result = await service.leaveGroupBuy('groupbuy-123', 'user-456');

      expect(prismaService.groupBuyParticipant.delete).toHaveBeenCalledWith({
        where: {
          groupBuyId_userId: { groupBuyId: 'groupbuy-123', userId: 'user-456' },
        },
      });
      expect(prismaService.groupBuy.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { currentParticipants: { decrement: 1 } },
        })
      );
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException when participation not found', async () => {
      prismaService.groupBuyParticipant.findUnique.mockResolvedValue(null);

      await expect(
        service.leaveGroupBuy('groupbuy-123', 'user-456')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when leaving after deadline', async () => {
      const pastGroupBuy = {
        ...mockGroupBuy,
        deadline: new Date(Date.now() - 24 * 60 * 60 * 1000),
      };

      prismaService.groupBuyParticipant.findUnique.mockResolvedValue(mockParticipant);
      prismaService.groupBuy.findUnique.mockResolvedValue(pastGroupBuy);

      await expect(
        service.leaveGroupBuy('groupbuy-123', 'user-456')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when leaving after committing', async () => {
      const committedParticipant = {
        ...mockParticipant,
        committed: true,
      };

      prismaService.groupBuyParticipant.findUnique.mockResolvedValue(committedParticipant);
      prismaService.groupBuy.findUnique.mockResolvedValue(mockGroupBuy);

      await expect(
        service.leaveGroupBuy('groupbuy-123', 'user-456')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('closeGroupBuy', () => {
    const committedParticipants = [
      { ...mockParticipant, committed: true, quantity: 10 },
      { ...mockParticipant, id: 'p2', userId: 'user-789', committed: true, quantity: 15 },
    ];

    const groupBuyReadyToClose = {
      ...mockGroupBuy,
      currentParticipants: 6,
      participants: committedParticipants,
      priceBreaks: [
        { minQuantity: 20, pricePerUnit: 1.5, savings: 1.0 },
        { minQuantity: 10, pricePerUnit: 2.0, savings: 0.5 },
      ], // Sorted in descending order as returned by Prisma
    };

    it('should close group buy and create orders', async () => {
      prismaService.groupBuy.findUnique.mockResolvedValue(groupBuyReadyToClose);
      prismaService.offer.update.mockResolvedValue({ ...mockOffer, status: 'COMPLETED' });
      prismaService.groupBuyOrder.create.mockResolvedValue({});
      emailService.sendGroupBuyClosed.mockResolvedValue(true);

      const result = await service.closeGroupBuy('groupbuy-123', 'user-123');

      expect(prismaService.offer.update).toHaveBeenCalledWith({
        where: { id: 'offer-123' },
        data: { status: 'COMPLETED' },
      });
      expect(prismaService.groupBuyOrder.create).toHaveBeenCalledTimes(2);
      expect(emailService.sendGroupBuyClosed).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.ordersCreated).toBe(2);
    });

    it('should calculate correct pricing with price breaks', async () => {
      prismaService.groupBuy.findUnique.mockResolvedValue(groupBuyReadyToClose);
      prismaService.offer.update.mockResolvedValue(mockOffer);
      prismaService.groupBuyOrder.create.mockResolvedValue({});
      emailService.sendGroupBuyClosed.mockResolvedValue(true);

      await service.closeGroupBuy('groupbuy-123', 'user-123');

      const firstOrderCall = prismaService.groupBuyOrder.create.mock.calls[0][0];
      const secondOrderCall = prismaService.groupBuyOrder.create.mock.calls[1][0];

      // Total quantity is 25, so should use second price break (20+ = 1.5 per unit)
      expect(firstOrderCall.data.pricePerUnit).toBe(1.5);
      expect(firstOrderCall.data.quantity).toBe(10);
      expect(firstOrderCall.data.totalAmount).toBe(15); // 10 * 1.5

      expect(secondOrderCall.data.pricePerUnit).toBe(1.5);
      expect(secondOrderCall.data.quantity).toBe(15);
      expect(secondOrderCall.data.totalAmount).toBe(22.5); // 15 * 1.5
    });

    it('should throw NotFoundException when group buy not found', async () => {
      prismaService.groupBuy.findUnique.mockResolvedValue(null);

      await expect(
        service.closeGroupBuy('non-existent', 'user-123')
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when not organizer', async () => {
      prismaService.groupBuy.findUnique.mockResolvedValue(groupBuyReadyToClose);

      await expect(
        service.closeGroupBuy('groupbuy-123', 'other-user')
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when minimum not reached', async () => {
      const groupBuyBelowMinimum = {
        ...mockGroupBuy,
        currentParticipants: 3,
        minParticipants: 5,
      };

      prismaService.groupBuy.findUnique.mockResolvedValue(groupBuyBelowMinimum);

      await expect(
        service.closeGroupBuy('groupbuy-123', 'user-123')
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when not all participants committed', async () => {
      const groupBuyWithUncommitted = {
        ...groupBuyReadyToClose,
        participants: [
          { ...mockParticipant, committed: true },
          { ...mockParticipant, id: 'p2', userId: 'user-789', committed: false },
        ],
      };

      prismaService.groupBuy.findUnique.mockResolvedValue(groupBuyWithUncommitted);

      await expect(
        service.closeGroupBuy('groupbuy-123', 'user-123')
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserParticipations', () => {
    it('should return user participations with enriched data', async () => {
      const participations = [
        {
          ...mockParticipant,
          groupBuy: {
            ...mockGroupBuy,
            participants: [mockParticipant],
          },
        },
      ];

      prismaService.groupBuyParticipant.findMany.mockResolvedValue(participations);

      const result = await service.getUserParticipations('user-456');

      expect(prismaService.groupBuyParticipant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-456' },
        })
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('totalQuantity');
      expect(result[0]).toHaveProperty('currentTier');
      expect(result[0]).toHaveProperty('userTotal');
    });
  });

  describe('helper methods', () => {
    it('should get current price tier correctly', () => {
      const priceBreaks = [
        { minQuantity: 10, pricePerUnit: 2.0 },
        { minQuantity: 20, pricePerUnit: 1.5 },
        { minQuantity: 50, pricePerUnit: 1.0 },
      ];

      // @ts-ignore - accessing private method for testing
      let tier = service['getCurrentPriceTier'](priceBreaks, 5);
      expect(tier.pricePerUnit).toBe(2.0);

      // @ts-ignore
      tier = service['getCurrentPriceTier'](priceBreaks, 25);
      expect(tier.pricePerUnit).toBe(1.5);

      // @ts-ignore
      tier = service['getCurrentPriceTier'](priceBreaks, 60);
      expect(tier.pricePerUnit).toBe(1.0);
    });

    it('should get next price tier correctly', () => {
      const priceBreaks = [
        { minQuantity: 10, pricePerUnit: 2.0 },
        { minQuantity: 20, pricePerUnit: 1.5 },
        { minQuantity: 50, pricePerUnit: 1.0 },
      ];

      // @ts-ignore - accessing private method for testing
      let tier = service['getNextPriceTier'](priceBreaks, 5);
      expect(tier.minQuantity).toBe(10);

      // @ts-ignore
      tier = service['getNextPriceTier'](priceBreaks, 15);
      expect(tier.minQuantity).toBe(20);

      // @ts-ignore
      tier = service['getNextPriceTier'](priceBreaks, 60);
      expect(tier).toBeNull(); // Already at highest tier
    });

    it('should return null for empty price breaks', () => {
      // @ts-ignore
      const currentTier = service['getCurrentPriceTier']([], 10);
      expect(currentTier).toBeNull();

      // @ts-ignore
      const nextTier = service['getNextPriceTier']([], 10);
      expect(nextTier).toBeNull();
    });
  });
});
