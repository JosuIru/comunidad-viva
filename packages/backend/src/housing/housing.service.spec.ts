import { Test, TestingModule } from '@nestjs/testing';
import { HousingService } from './housing.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  SpaceType,
  ExchangeType,
  SpaceStatus,
  HousingStatus,
  BookingStatus,
  CoopType,
  GovernanceType,
  CoopPhase,
  CoopStatus,
  CoopMemberRole,
  MemberStatus,
  CoopProposalType,
  GuaranteeStatus,
  SupportStatus,
  VoteDecision,
  HousingType,
  AccommodationType,
} from '@prisma/client';
import {
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

describe('HousingService', () => {
  let service: HousingService;
  let prisma: PrismaService;

  const mockPrismaService = {
    spaceBank: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    spaceBooking: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    temporaryHousing: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    housingBooking: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    housingCoop: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    housingCoopMember: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    housingCoopProposal: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    housingCoopVote: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    communityGuarantee: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    guaranteeSupporter: {
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HousingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<HousingService>(HousingService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // SPACE BANK TESTS
  // ============================================

  describe('createSpace', () => {
    it('should create a space with all fields', async () => {
      const userId = 'user-id';
      const spaceData = {
        communityId: 'community-id',
        type: SpaceType.OFFICE,
        title: 'Test Space',
        description: 'Test Description',
        address: '123 Test St',
        lat: 40.4168,
        lng: -3.7038,
        capacity: 10,
        squareMeters: 50,
        exchangeType: ExchangeType.CREDITS,
        creditsPerHour: 5,
      };

      const mockSpace = {
        id: 'space-id',
        ownerId: userId,
        ...spaceData,
        status: SpaceStatus.ACTIVE,
        owner: { id: userId, name: 'Test User', avatar: null },
      };

      mockPrismaService.spaceBank.create.mockResolvedValue(mockSpace);

      const result = await service.createSpace(userId, spaceData);

      expect(result).toEqual(mockSpace);
      expect(mockPrismaService.spaceBank.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ownerId: userId,
          status: SpaceStatus.ACTIVE,
        }),
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });
    });
  });

  describe('findSpaces', () => {
    it('should return all active spaces', async () => {
      const mockSpaces = [
        {
          id: 'space-1',
          type: SpaceType.OFFICE,
          status: SpaceStatus.ACTIVE,
        },
      ];

      mockPrismaService.spaceBank.findMany.mockResolvedValue(mockSpaces);

      const result = await service.findSpaces();

      expect(result).toEqual(mockSpaces);
      expect(mockPrismaService.spaceBank.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: SpaceStatus.ACTIVE },
        }),
      );
    });

    it('should filter spaces by type', async () => {
      mockPrismaService.spaceBank.findMany.mockResolvedValue([]);

      await service.findSpaces({ type: SpaceType.STORAGE });

      expect(mockPrismaService.spaceBank.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: SpaceType.STORAGE,
          }),
        }),
      );
    });

    it('should filter spaces by geographic location', async () => {
      mockPrismaService.spaceBank.findMany.mockResolvedValue([]);

      await service.findSpaces({
        lat: '40.4168',
        lng: '-3.7038',
        radiusKm: '5',
      });

      expect(mockPrismaService.spaceBank.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            lat: expect.any(Object),
            lng: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('findSpaceById', () => {
    it('should return space by id', async () => {
      const mockSpace = {
        id: 'space-id',
        title: 'Test Space',
        owner: { id: 'owner-id', name: 'Owner' },
        bookings: [],
      };

      mockPrismaService.spaceBank.findUnique.mockResolvedValue(mockSpace);

      const result = await service.findSpaceById('space-id');

      expect(result).toEqual(mockSpace);
    });

    it('should throw NotFoundException if space not found', async () => {
      mockPrismaService.spaceBank.findUnique.mockResolvedValue(null);

      await expect(service.findSpaceById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('bookSpace', () => {
    it('should create a space booking', async () => {
      const userId = 'user-id';
      const spaceId = 'space-id';

      const mockSpace = {
        id: spaceId,
        ownerId: 'owner-id',
        minReputation: 0,
        minBookingHours: 1,
        maxBookingHours: 8,
        exchangeType: ExchangeType.CREDITS,
        creditsPerHour: 5,
        requiresApproval: false,
      };

      const mockUser = {
        id: userId,
        generosityScore: 50,
        credits: 100,
      };

      const mockBooking = {
        id: 'booking-id',
        spaceId,
        bookerId: userId,
        status: BookingStatus.CONFIRMED,
      };

      mockPrismaService.spaceBank.findUnique.mockResolvedValue(mockSpace);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.spaceBooking.create.mockResolvedValue(mockBooking);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.bookSpace(userId, spaceId, {
        startTime: new Date('2024-01-01T10:00:00'),
        endTime: new Date('2024-01-01T14:00:00'),
      });

      expect(result).toBeDefined();
      expect(mockPrismaService.spaceBooking.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if user reputation is too low', async () => {
      const mockSpace = {
        id: 'space-id',
        minReputation: 100,
      };

      const mockUser = {
        generosityScore: 50,
        credits: 100,
      };

      mockPrismaService.spaceBank.findUnique.mockResolvedValue(mockSpace);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.bookSpace('user-id', 'space-id', {
          startTime: new Date(),
          endTime: new Date(),
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if booking is below minimum hours', async () => {
      const mockSpace = {
        id: 'space-id',
        minReputation: 0,
        minBookingHours: 4,
      };

      const mockUser = {
        generosityScore: 50,
        credits: 100,
      };

      mockPrismaService.spaceBank.findUnique.mockResolvedValue(mockSpace);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.bookSpace('user-id', 'space-id', {
          startTime: new Date('2024-01-01T10:00:00'),
          endTime: new Date('2024-01-01T11:00:00'), // Only 1 hour
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if insufficient credits', async () => {
      const mockSpace = {
        id: 'space-id',
        minReputation: 0,
        minBookingHours: 1,
        exchangeType: ExchangeType.CREDITS,
        creditsPerHour: 50,
      };

      const mockUser = {
        generosityScore: 50,
        credits: 10, // Not enough
      };

      mockPrismaService.spaceBank.findUnique.mockResolvedValue(mockSpace);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.bookSpace('user-id', 'space-id', {
          startTime: new Date('2024-01-01T10:00:00'),
          endTime: new Date('2024-01-01T14:00:00'), // 4 hours = 200 credits
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('approveSpaceBooking', () => {
    it('should approve a space booking', async () => {
      const ownerId = 'owner-id';
      const bookingId = 'booking-id';

      const mockBooking = {
        id: bookingId,
        space: { ownerId },
        bookerId: 'booker-id',
        paidCredits: 20,
      };

      mockPrismaService.spaceBooking.findUnique.mockResolvedValue(mockBooking);
      mockPrismaService.spaceBooking.update.mockResolvedValue(mockBooking);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.approveSpaceBooking(ownerId, bookingId);

      expect(result).toBeDefined();
      expect(mockPrismaService.spaceBooking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: { status: BookingStatus.APPROVED },
        include: expect.any(Object),
      });
    });

    it('should throw ForbiddenException if not the owner', async () => {
      const mockBooking = {
        id: 'booking-id',
        space: { ownerId: 'different-owner' },
      };

      mockPrismaService.spaceBooking.findUnique.mockResolvedValue(mockBooking);

      await expect(
        service.approveSpaceBooking('wrong-owner', 'booking-id'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  // ============================================
  // TEMPORARY HOUSING TESTS
  // ============================================

  describe('createHousing', () => {
    it('should create a temporary housing listing', async () => {
      const userId = 'user-id';
      const housingData = {
        communityId: 'community-id',
        type: HousingType.GUEST,
        title: 'Test Housing',
        description: 'Test Description',
        address: '123 Test St',
        lat: 40.4168,
        lng: -3.7038,
        accommodationType: AccommodationType.PRIVATE_ROOM,
        beds: 2,
        bathrooms: 1,
        availableFrom: '2024-01-01',
        availableTo: '2024-12-31',
        exchangeType: ExchangeType.CREDITS,
        creditsPerNight: 10,
      };

      const mockHousing = {
        id: 'housing-id',
        hostId: userId,
        ...housingData,
        status: HousingStatus.ACTIVE,
      };

      mockPrismaService.temporaryHousing.create.mockResolvedValue(mockHousing);

      const result = await service.createHousing(userId, housingData);

      expect(result).toEqual(mockHousing);
      expect(mockPrismaService.temporaryHousing.create).toHaveBeenCalled();
    });
  });

  describe('updateHousing', () => {
    it('should update housing listing', async () => {
      const housingId = 'housing-id';
      const userId = 'user-id';

      const mockHousing = {
        id: housingId,
        hostId: userId,
        title: 'Old Title',
      };

      const updateData = {
        title: 'New Title',
        description: 'New Description',
      };

      mockPrismaService.temporaryHousing.findUnique.mockResolvedValue(
        mockHousing,
      );
      mockPrismaService.temporaryHousing.update.mockResolvedValue({
        ...mockHousing,
        ...updateData,
      });

      const result = await service.updateHousing(housingId, userId, updateData);

      expect(result.title).toBe('New Title');
    });

    it('should throw ForbiddenException if not the host', async () => {
      const mockHousing = {
        id: 'housing-id',
        hostId: 'different-user',
      };

      mockPrismaService.temporaryHousing.findUnique.mockResolvedValue(
        mockHousing,
      );

      await expect(
        service.updateHousing('housing-id', 'wrong-user', {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteHousing', () => {
    it('should delete housing if no active bookings', async () => {
      const housingId = 'housing-id';
      const userId = 'user-id';

      const mockHousing = {
        id: housingId,
        hostId: userId,
      };

      mockPrismaService.temporaryHousing.findUnique.mockResolvedValue(
        mockHousing,
      );
      mockPrismaService.housingBooking.count.mockResolvedValue(0);
      mockPrismaService.temporaryHousing.delete.mockResolvedValue({});

      const result = await service.deleteHousing(housingId, userId);

      expect(result.message).toBe('Alojamiento eliminado exitosamente');
      expect(mockPrismaService.temporaryHousing.delete).toHaveBeenCalledWith({
        where: { id: housingId },
      });
    });

    it('should throw BadRequestException if there are active bookings', async () => {
      const mockHousing = {
        id: 'housing-id',
        hostId: 'user-id',
      };

      mockPrismaService.temporaryHousing.findUnique.mockResolvedValue(
        mockHousing,
      );
      mockPrismaService.housingBooking.count.mockResolvedValue(2); // Active bookings

      await expect(
        service.deleteHousing('housing-id', 'user-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findHousing', () => {
    it('should return all active housing listings', async () => {
      const mockHousing = [
        {
          id: 'housing-1',
          type: HousingType.GUEST,
          status: HousingStatus.ACTIVE,
        },
      ];

      mockPrismaService.temporaryHousing.findMany.mockResolvedValue(
        mockHousing,
      );

      const result = await service.findHousing();

      expect(result).toEqual(mockHousing);
    });

    it('should filter housing by type and accommodation', async () => {
      mockPrismaService.temporaryHousing.findMany.mockResolvedValue([]);

      await service.findHousing({
        type: HousingType.NOMAD,
        accommodationType: AccommodationType.ENTIRE_PLACE,
      });

      expect(
        mockPrismaService.temporaryHousing.findMany,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: HousingType.NOMAD,
            accommodationType: AccommodationType.ENTIRE_PLACE,
          }),
        }),
      );
    });
  });

  describe('bookHousing', () => {
    it('should create a housing booking', async () => {
      const userId = 'user-id';
      const housingId = 'housing-id';

      const mockHousing = {
        id: housingId,
        hostId: 'host-id',
        minReputation: 10,
        minNights: 1,
        maxNights: 30,
        maxGuests: 4,
        exchangeType: ExchangeType.CREDITS,
        creditsPerNight: 10,
        requiresApproval: false,
      };

      const mockUser = {
        generosityScore: 50,
        credits: 100,
      };

      const mockBooking = {
        id: 'booking-id',
        housingId,
        guestId: userId,
        status: BookingStatus.CONFIRMED,
      };

      mockPrismaService.temporaryHousing.findUnique.mockResolvedValue(
        mockHousing,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.housingBooking.create.mockResolvedValue(mockBooking);

      const result = await service.bookHousing(userId, housingId, {
        checkIn: '2024-01-01',
        checkOut: '2024-01-05',
        guests: 2,
      });

      expect(result).toBeDefined();
      expect(mockPrismaService.housingBooking.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if too many guests', async () => {
      const mockHousing = {
        id: 'housing-id',
        minReputation: 0,
        maxGuests: 2,
      };

      const mockUser = {
        generosityScore: 50,
        credits: 100,
      };

      mockPrismaService.temporaryHousing.findUnique.mockResolvedValue(
        mockHousing,
      );
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.bookHousing('user-id', 'housing-id', {
          checkIn: '2024-01-01',
          checkOut: '2024-01-05',
          guests: 5, // Too many
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // HOUSING COOPERATIVES TESTS
  // ============================================

  describe('createCoop', () => {
    it('should create a housing cooperative and add founder', async () => {
      const userId = 'user-id';
      const coopData = {
        communityId: 'community-id',
        name: 'Test Coop',
        description: 'Test Description',
        vision: 'Test Vision',
        type: CoopType.COHOUSING,
        address: '123 Test St',
        lat: 40.4168,
        lng: -3.7038,
        governance: GovernanceType.CONSENSUS,
        minMembers: 5,
        maxMembers: 20,
      };

      const mockCoop = {
        id: 'coop-id',
        ...coopData,
        phase: CoopPhase.FORMING,
        status: CoopStatus.OPEN,
      };

      mockPrismaService.housingCoop.create.mockResolvedValue(mockCoop);
      mockPrismaService.housingCoopMember.create.mockResolvedValue({});
      mockPrismaService.housingCoop.update.mockResolvedValue(mockCoop);

      const result = await service.createCoop(userId, coopData);

      expect(result).toEqual(mockCoop);
      expect(mockPrismaService.housingCoopMember.create).toHaveBeenCalledWith({
        data: {
          coopId: mockCoop.id,
          userId,
          role: CoopMemberRole.FOUNDER,
          status: MemberStatus.ACTIVE,
          joinedAt: expect.any(Date),
        },
      });
    });
  });

  describe('joinCoop', () => {
    it('should create membership application', async () => {
      const userId = 'user-id';
      const coopId = 'coop-id';

      const mockCoop = {
        id: coopId,
        status: CoopStatus.OPEN,
        currentMembers: 5,
        maxMembers: 20,
        governance: GovernanceType.CONSENSUS,
        decisionThreshold: 0.66,
      };

      const mockMembership = {
        id: 'membership-id',
        coopId,
        userId,
        role: CoopMemberRole.CANDIDATE,
        status: MemberStatus.PENDING,
      };

      mockPrismaService.housingCoop.findUnique.mockResolvedValue(mockCoop);
      mockPrismaService.housingCoopMember.findUnique.mockResolvedValue(null);
      mockPrismaService.housingCoopMember.create.mockResolvedValue(
        mockMembership,
      );
      mockPrismaService.housingCoopProposal.create.mockResolvedValue({});

      const result = await service.joinCoop(userId, coopId, {
        message: 'I want to join',
        skills: ['cooking', 'gardening'],
        commitmentLevel: 'HIGH',
      });

      expect(result).toBeDefined();
      expect(mockPrismaService.housingCoopMember.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if coop is full', async () => {
      const mockCoop = {
        id: 'coop-id',
        status: CoopStatus.OPEN,
        currentMembers: 20,
        maxMembers: 20, // Full
      };

      mockPrismaService.housingCoop.findUnique.mockResolvedValue(mockCoop);

      await expect(service.joinCoop('user-id', 'coop-id', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if already a member', async () => {
      const mockCoop = {
        id: 'coop-id',
        status: CoopStatus.OPEN,
        currentMembers: 5,
        maxMembers: 20,
      };

      const mockExistingMembership = {
        id: 'membership-id',
        userId: 'user-id',
        coopId: 'coop-id',
      };

      mockPrismaService.housingCoop.findUnique.mockResolvedValue(mockCoop);
      mockPrismaService.housingCoopMember.findUnique.mockResolvedValue(
        mockExistingMembership,
      );

      await expect(service.joinCoop('user-id', 'coop-id', {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('voteCoopProposal', () => {
    it('should create a vote on a proposal', async () => {
      const userId = 'user-id';
      const proposalId = 'proposal-id';

      const mockProposal = {
        id: proposalId,
        coopId: 'coop-id',
        requiredVotes: 5,
        currentVotes: 2,
      };

      const mockMembership = {
        coopId: 'coop-id',
        userId,
        status: MemberStatus.ACTIVE,
      };

      const mockVote = {
        id: 'vote-id',
        proposalId,
        voterId: userId,
        points: 1,
        decision: VoteDecision.APPROVE,
      };

      mockPrismaService.housingCoopProposal.findUnique.mockResolvedValue(
        mockProposal,
      );
      mockPrismaService.housingCoopMember.findUnique.mockResolvedValue(
        mockMembership,
      );
      mockPrismaService.housingCoopVote.findUnique.mockResolvedValue(null);
      mockPrismaService.housingCoopVote.create.mockResolvedValue(mockVote);
      mockPrismaService.housingCoopProposal.update.mockResolvedValue({});

      const result = await service.voteCoopProposal(userId, proposalId, {
        points: 1,
        decision: VoteDecision.APPROVE,
      });

      expect(result).toEqual(mockVote);
      expect(mockPrismaService.housingCoopVote.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not an active member', async () => {
      const mockProposal = {
        id: 'proposal-id',
        coopId: 'coop-id',
      };

      const mockMembership = {
        coopId: 'coop-id',
        userId: 'user-id',
        status: MemberStatus.PENDING, // Not active
      };

      mockPrismaService.housingCoopProposal.findUnique.mockResolvedValue(
        mockProposal,
      );
      mockPrismaService.housingCoopMember.findUnique.mockResolvedValue(
        mockMembership,
      );

      await expect(
        service.voteCoopProposal('user-id', 'proposal-id', {
          points: 1,
          decision: VoteDecision.APPROVE,
        }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if already voted', async () => {
      const mockProposal = {
        id: 'proposal-id',
        coopId: 'coop-id',
      };

      const mockMembership = {
        status: MemberStatus.ACTIVE,
      };

      const mockExistingVote = {
        id: 'existing-vote',
      };

      mockPrismaService.housingCoopProposal.findUnique.mockResolvedValue(
        mockProposal,
      );
      mockPrismaService.housingCoopMember.findUnique.mockResolvedValue(
        mockMembership,
      );
      mockPrismaService.housingCoopVote.findUnique.mockResolvedValue(
        mockExistingVote,
      );

      await expect(
        service.voteCoopProposal('user-id', 'proposal-id', {
          points: 1,
          decision: VoteDecision.APPROVE,
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // COMMUNITY GUARANTEE TESTS
  // ============================================

  describe('requestGuarantee', () => {
    it('should create a community guarantee request', async () => {
      const userId = 'user-id';
      const guaranteeData = {
        communityId: 'community-id',
        landlordName: 'Test Landlord',
        landlordEmail: 'landlord@test.com',
        landlordPhone: '+34123456789',
        propertyAddress: '123 Test St',
        monthlyRent: 1000,
        coverageMonths: 3,
      };

      const mockUser = {
        generosityScore: 75,
      };

      const mockGuarantee = {
        id: 'guarantee-id',
        userId,
        ...guaranteeData,
        status: GuaranteeStatus.PENDING,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.communityGuarantee.create.mockResolvedValue(
        mockGuarantee,
      );

      const result = await service.requestGuarantee(userId, guaranteeData);

      expect(result).toEqual(mockGuarantee);
      expect(mockPrismaService.communityGuarantee.create).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if reputation is too low', async () => {
      const mockUser = {
        generosityScore: 30, // Below 50
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.requestGuarantee('user-id', {})).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('supportGuarantee', () => {
    it('should add supporter to guarantee', async () => {
      const guaranteeId = 'guarantee-id';
      const supporterId = 'supporter-id';

      const mockGuarantee = {
        id: guaranteeId,
        status: GuaranteeStatus.PENDING,
        maxCoverage: 3000,
      };

      const mockSupport = {
        id: 'support-id',
        guaranteeId,
        supporterId,
        amountCommitted: 500,
        status: SupportStatus.ACTIVE,
      };

      mockPrismaService.communityGuarantee.findUnique.mockResolvedValue(
        mockGuarantee,
      );
      mockPrismaService.guaranteeSupporter.create.mockResolvedValue(
        mockSupport,
      );
      mockPrismaService.guaranteeSupporter.aggregate.mockResolvedValue({
        _sum: { amountCommitted: 2000 },
      });

      const result = await service.supportGuarantee(
        supporterId,
        guaranteeId,
        {
          months: 3,
          amount: 500,
        },
      );

      expect(result).toEqual(mockSupport);
      expect(mockPrismaService.guaranteeSupporter.create).toHaveBeenCalled();
    });

    it('should activate guarantee when fully funded', async () => {
      const mockGuarantee = {
        id: 'guarantee-id',
        status: GuaranteeStatus.PENDING,
        maxCoverage: 3000,
        coverageMonths: 3,
      };

      mockPrismaService.communityGuarantee.findUnique.mockResolvedValue(
        mockGuarantee,
      );
      mockPrismaService.guaranteeSupporter.create.mockResolvedValue({});
      mockPrismaService.guaranteeSupporter.aggregate.mockResolvedValue({
        _sum: { amountCommitted: 3000 }, // Fully funded
      });
      mockPrismaService.communityGuarantee.update.mockResolvedValue({});

      await service.supportGuarantee('supporter-id', 'guarantee-id', {
        months: 3,
        amount: 1000,
      });

      expect(mockPrismaService.communityGuarantee.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'guarantee-id' },
          data: expect.objectContaining({
            status: GuaranteeStatus.ACTIVE,
          }),
        }),
      );
    });
  });

  // ============================================
  // USER BOOKINGS TESTS
  // ============================================

  describe('getMyBookings', () => {
    it('should return all user bookings', async () => {
      const userId = 'user-id';

      const mockSpaceBookings = [
        { id: 'space-booking-1', bookerId: userId },
      ];
      const mockHousingBookings = [
        { id: 'housing-booking-1', guestId: userId },
      ];

      mockPrismaService.spaceBooking.findMany.mockResolvedValue(
        mockSpaceBookings,
      );
      mockPrismaService.housingBooking.findMany.mockResolvedValue(
        mockHousingBookings,
      );

      const result = await service.getMyBookings(userId);

      expect(result.spaces).toEqual(mockSpaceBookings);
      expect(result.housing).toEqual(mockHousingBookings);
    });
  });

  describe('getMyOfferings', () => {
    it('should return all user offerings', async () => {
      const userId = 'user-id';

      const mockSpaces = [{ id: 'space-1', ownerId: userId }];
      const mockHousing = [{ id: 'housing-1', hostId: userId }];

      mockPrismaService.spaceBank.findMany.mockResolvedValue(mockSpaces);
      mockPrismaService.temporaryHousing.findMany.mockResolvedValue(
        mockHousing,
      );

      const result = await service.getMyOfferings(userId);

      expect(result.spaces).toEqual(mockSpaces);
      expect(result.housing).toEqual(mockHousing);
    });
  });
});
