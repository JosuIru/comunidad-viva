import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  SpaceType,
  HousingType,
  AccommodationType,
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
} from '@prisma/client';

@Injectable()
export class HousingService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // SPACE BANK - Banco de Espacios
  // ============================================

  async createSpace(userId: string, data: any) {
    const space = await this.prisma.spaceBank.create({
      data: {
        ownerId: userId,
        communityId: data.communityId,
        type: data.type as SpaceType,
        title: data.title,
        description: data.description,
        images: data.images || [],
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        accessInstructions: data.accessInstructions,
        capacity: data.capacity,
        squareMeters: data.squareMeters,
        features: data.features || [],
        equipment: data.equipment || [],
        availableDays: data.availableDays || [],
        availableHours: data.availableHours || {},
        minBookingHours: data.minBookingHours || 1,
        maxBookingHours: data.maxBookingHours,
        exchangeType: data.exchangeType as ExchangeType,
        pricePerHour: data.pricePerHour,
        creditsPerHour: data.creditsPerHour,
        hoursPerHour: data.hoursPerHour,
        isFree: data.isFree || false,
        minReputation: data.minReputation || 0,
        requiresApproval: data.requiresApproval || false,
        rules: data.rules || [],
        status: SpaceStatus.ACTIVE,
      },
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

    return space;
  }

  async findSpaces(filters?: any) {
    const where: any = {
      status: SpaceStatus.ACTIVE,
    };

    if (filters?.type) {
      where.type = filters.type as SpaceType;
    }

    if (filters?.communityId) {
      where.communityId = filters.communityId;
    }

    if (filters?.isFree !== undefined) {
      where.isFree = filters.isFree === 'true';
    }

    if (filters?.exchangeType) {
      where.exchangeType = filters.exchangeType as ExchangeType;
    }

    let spaces = await this.prisma.spaceBank.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply proximity filter using Haversine formula
    if (filters?.nearLat && filters?.nearLng && filters?.maxDistance && filters.maxDistance > 0) {
      spaces = spaces.filter((space) => {
        if (!space.lat || !space.lng) return false;
        const distance = this.calculateDistance(filters.nearLat, filters.nearLng, space.lat, space.lng);
        return distance <= filters.maxDistance;
      });
    }

    return spaces;
  }

  async findSpaceById(spaceId: string) {
    const space = await this.prisma.spaceBank.findUnique({
      where: { id: spaceId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
            level: true,
          },
        },
        bookings: {
          where: {
            status: {
              in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN],
            },
          },
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    return space;
  }

  async bookSpace(userId: string, spaceId: string, data: any) {
    const space = await this.findSpaceById(spaceId);

    // Check reputation requirement
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { generosityScore: true, credits: true },
    });

    if (user.generosityScore < space.minReputation) {
      throw new ForbiddenException(
        `Necesitas reputación mínima de ${space.minReputation}`,
      );
    }

    // Calculate hours
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);

    if (hours < space.minBookingHours) {
      throw new BadRequestException(
        `Reserva mínima: ${space.minBookingHours} horas`,
      );
    }

    if (space.maxBookingHours && hours > space.maxBookingHours) {
      throw new BadRequestException(
        `Reserva máxima: ${space.maxBookingHours} horas`,
      );
    }

    // Calculate payment
    let paidEur, paidCredits, paidHours;

    switch (space.exchangeType) {
      case ExchangeType.EUR:
        paidEur = (space.pricePerHour || 0) * hours;
        break;
      case ExchangeType.CREDITS:
        paidCredits = (space.creditsPerHour || 0) * hours;
        if (user.credits < paidCredits) {
          throw new BadRequestException('Créditos insuficientes');
        }
        break;
      case ExchangeType.TIME_HOURS:
        paidHours = (space.hoursPerHour || 1) * hours;
        break;
      case ExchangeType.FREE:
        // No payment needed
        break;
    }

    const booking = await this.prisma.spaceBooking.create({
      data: {
        spaceId,
        bookerId: userId,
        startTime,
        endTime,
        hours,
        paidEur,
        paidCredits,
        paidHours,
        status: space.requiresApproval
          ? BookingStatus.PENDING
          : BookingStatus.CONFIRMED,
      },
      include: {
        space: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        booker: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Deduct credits if needed
    if (paidCredits && booking.status === BookingStatus.CONFIRMED) {
      await this.prisma.User.update({
        where: { id: userId },
        data: {
          credits: {
            decrement: paidCredits,
          },
        },
      });

      // Credit to owner
      await this.prisma.User.update({
        where: { id: space.ownerId },
        data: {
          credits: {
            increment: paidCredits,
          },
        },
      });
    }

    return booking;
  }

  async approveSpaceBooking(ownerId: string, bookingId: string) {
    const booking = await this.prisma.spaceBooking.findUnique({
      where: { id: bookingId },
      include: { space: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.space.ownerId !== ownerId) {
      throw new ForbiddenException('Not the space owner');
    }

    const updated = await this.prisma.spaceBooking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.APPROVED },
      include: {
        booker: true,
        space: true,
      },
    });

    // Process payment if needed
    if (updated.paidCredits) {
      await this.prisma.User.update({
        where: { id: updated.bookerId },
        data: {
          credits: {
            decrement: updated.paidCredits,
          },
        },
      });

      await this.prisma.User.update({
        where: { id: ownerId },
        data: {
          credits: {
            increment: updated.paidCredits,
          },
        },
      });
    }

    return updated;
  }

  async completeSpaceBooking(userId: string, bookingId: string, review?: any) {
    const booking = await this.prisma.spaceBooking.findUnique({
      where: { id: bookingId },
      include: { space: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.bookerId !== userId) {
      throw new ForbiddenException('Not the booker');
    }

    return await this.prisma.spaceBooking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.COMPLETED,
        rating: review?.rating,
        review: review?.review,
      },
    });
  }

  // ============================================
  // TEMPORARY HOUSING - Hospedaje Temporal
  // ============================================

  async createHousing(userId: string, data: any) {
    const housing = await this.prisma.temporaryHousing.create({
      data: {
        hostId: userId,
        communityId: data.communityId,
        type: data.type as HousingType,
        title: data.title,
        description: data.description,
        images: data.images || [],
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        accessInstructions: data.accessInstructions,
        accommodationType: data.accommodationType as AccommodationType,
        beds: data.beds || 1,
        bathrooms: data.bathrooms || 1,
        squareMeters: data.squareMeters,
        amenities: data.amenities || [],
        houseRules: data.houseRules || [],
        availableFrom: new Date(data.availableFrom),
        availableTo: new Date(data.availableTo),
        minNights: data.minNights || 1,
        maxNights: data.maxNights,
        exchangeType: data.exchangeType as ExchangeType,
        pricePerNight: data.pricePerNight,
        creditsPerNight: data.creditsPerNight,
        hoursPerNight: data.hoursPerNight,
        isFree: data.isFree || false,
        minReputation: data.minReputation || 10,
        requiresApproval: data.requiresApproval !== false,
        maxGuests: data.maxGuests || 1,
        communityInsured: data.communityInsured !== false,
        emergencyContact: data.emergencyContact,
        status: HousingStatus.ACTIVE,
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return housing;
  }

  async updateHousing(housingId: string, userId: string, data: any) {
    const housing = await this.prisma.temporaryHousing.findUnique({
      where: { id: housingId },
    });

    if (!housing) {
      throw new NotFoundException('Alojamiento no encontrado');
    }

    if (housing.hostId !== userId) {
      throw new ForbiddenException('No tienes permisos para modificar este alojamiento');
    }

    const updated = await this.prisma.temporaryHousing.update({
      where: { id: housingId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.images && { images: data.images }),
        ...(data.address && { address: data.address }),
        ...(data.lat && { lat: data.lat }),
        ...(data.lng && { lng: data.lng }),
        ...(data.accessInstructions && { accessInstructions: data.accessInstructions }),
        ...(data.beds && { beds: data.beds }),
        ...(data.bathrooms && { bathrooms: data.bathrooms }),
        ...(data.squareMeters && { squareMeters: data.squareMeters }),
        ...(data.amenities && { amenities: data.amenities }),
        ...(data.houseRules && { houseRules: data.houseRules }),
        ...(data.availableFrom && { availableFrom: new Date(data.availableFrom) }),
        ...(data.availableTo && { availableTo: new Date(data.availableTo) }),
        ...(data.minNights && { minNights: data.minNights }),
        ...(data.maxNights && { maxNights: data.maxNights }),
        ...(data.pricePerNight !== undefined && { pricePerNight: data.pricePerNight }),
        ...(data.creditsPerNight !== undefined && { creditsPerNight: data.creditsPerNight }),
        ...(data.hoursPerNight !== undefined && { hoursPerNight: data.hoursPerNight }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
        ...(data.minReputation && { minReputation: data.minReputation }),
        ...(data.requiresApproval !== undefined && { requiresApproval: data.requiresApproval }),
        ...(data.maxGuests && { maxGuests: data.maxGuests }),
        ...(data.status && { status: data.status }),
      },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return updated;
  }

  async deleteHousing(housingId: string, userId: string) {
    const housing = await this.prisma.temporaryHousing.findUnique({
      where: { id: housingId },
    });

    if (!housing) {
      throw new NotFoundException('Alojamiento no encontrado');
    }

    if (housing.hostId !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este alojamiento');
    }

    // Verificar que no tenga reservas activas
    const activeBookings = await this.prisma.housingBooking.count({
      where: {
        housingId,
        status: {
          in: ['PENDING', 'APPROVED', 'CONFIRMED', 'CHECKED_IN'],
        },
      },
    });

    if (activeBookings > 0) {
      throw new BadRequestException('No se puede eliminar un alojamiento con reservas activas');
    }

    await this.prisma.temporaryHousing.delete({
      where: { id: housingId },
    });

    return { message: 'Alojamiento eliminado exitosamente' };
  }

  async findHousing(filters?: any) {
    const where: any = {
      status: HousingStatus.ACTIVE,
    };

    if (filters?.type) {
      where.type = filters.type as HousingType;
    }

    if (filters?.communityId) {
      where.communityId = filters.communityId;
    }

    if (filters?.accommodationType) {
      where.accommodationType = filters.accommodationType as AccommodationType;
    }

    if (filters?.minBeds) {
      where.beds = { gte: parseInt(filters.minBeds) };
    }

    if (filters?.checkIn && filters?.checkOut) {
      // Find housing available during the period
      where.availableFrom = { lte: new Date(filters.checkIn) };
      where.availableTo = { gte: new Date(filters.checkOut) };
    }

    if (filters?.isFree !== undefined) {
      where.isFree = filters.isFree === 'true';
    }

    let housing = await this.prisma.temporaryHousing.findMany({
      where,
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
            generosityScore: true,
          },
        },
        _count: {
          select: {
            bookings: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Apply proximity filter using Haversine formula
    if (filters?.nearLat && filters?.nearLng && filters?.maxDistance && filters.maxDistance > 0) {
      housing = housing.filter((house) => {
        if (!house.lat || !house.lng) return false;
        const distance = this.calculateDistance(filters.nearLat, filters.nearLng, house.lat, house.lng);
        return distance <= filters.maxDistance;
      });
    }

    return housing;
  }

  async findHousingById(housingId: string) {
    const housing = await this.prisma.temporaryHousing.findUnique({
      where: { id: housingId },
      include: {
        host: {
          select: {
            id: true,
            name: true,
            avatar: true,
            level: true,
            generosityScore: true,
          },
        },
        bookings: {
          where: {
            status: {
              in: [BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN],
            },
          },
          select: {
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    if (!housing) {
      throw new NotFoundException('Housing not found');
    }

    return housing;
  }

  async bookHousing(userId: string, housingId: string, data: any) {
    const housing = await this.findHousingById(housingId);

    // Check reputation
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { generosityScore: true, credits: true },
    });

    if (user.generosityScore < housing.minReputation) {
      throw new ForbiddenException(
        `Necesitas reputación mínima de ${housing.minReputation}`,
      );
    }

    const checkIn = new Date(data.checkIn);
    const checkOut = new Date(data.checkOut);
    const nights = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (nights < housing.minNights) {
      throw new BadRequestException(
        `Estancia mínima: ${housing.minNights} noches`,
      );
    }

    if (housing.maxNights && nights > housing.maxNights) {
      throw new BadRequestException(
        `Estancia máxima: ${housing.maxNights} noches`,
      );
    }

    if (data.guests > housing.maxGuests) {
      throw new BadRequestException(
        `Máximo ${housing.maxGuests} huéspedes`,
      );
    }

    // Calculate payment
    let paidEur, paidCredits, paidHours;

    switch (housing.exchangeType) {
      case ExchangeType.EUR:
        paidEur = (housing.pricePerNight || 0) * nights;
        break;
      case ExchangeType.CREDITS:
        paidCredits = (housing.creditsPerNight || 0) * nights;
        if (user.credits < paidCredits) {
          throw new BadRequestException('Créditos insuficientes');
        }
        break;
      case ExchangeType.TIME_HOURS:
        paidHours = (housing.hoursPerNight || 1) * nights;
        break;
      case ExchangeType.FREE:
        // No payment
        break;
    }

    const booking = await this.prisma.housingBooking.create({
      data: {
        housingId,
        guestId: userId,
        checkIn,
        checkOut,
        nights,
        guests: data.guests || 1,
        guestMessage: data.message,
        paidEur,
        paidCredits,
        paidHours,
        status: housing.requiresApproval
          ? BookingStatus.PENDING
          : BookingStatus.CONFIRMED,
      },
      include: {
        housing: {
          include: {
            host: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        guest: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return booking;
  }

  async approveHousingBooking(
    hostId: string,
    bookingId: string,
    response?: string,
  ) {
    const booking = await this.prisma.housingBooking.findUnique({
      where: { id: bookingId },
      include: { housing: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.housing.hostId !== hostId) {
      throw new ForbiddenException('Not the host');
    }

    const updated = await this.prisma.housingBooking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.APPROVED,
        hostResponse: response,
      },
      include: {
        guest: true,
        housing: true,
      },
    });

    // Process payment
    if (updated.paidCredits) {
      await this.prisma.User.update({
        where: { id: updated.guestId },
        data: {
          credits: {
            decrement: updated.paidCredits,
          },
        },
      });

      await this.prisma.User.update({
        where: { id: hostId },
        data: {
          credits: {
            increment: updated.paidCredits,
          },
        },
      });
    }

    return updated;
  }

  async checkInHousing(userId: string, bookingId: string) {
    const booking = await this.prisma.housingBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.guestId !== userId) {
      throw new ForbiddenException('Not the guest');
    }

    if (booking.status !== BookingStatus.APPROVED) {
      throw new BadRequestException('Booking not approved');
    }

    return await this.prisma.housingBooking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CHECKED_IN },
    });
  }

  async completeHousingStay(
    userId: string,
    bookingId: string,
    reviews: { guestRating?: number; guestReview?: string },
  ) {
    const booking = await this.prisma.housingBooking.findUnique({
      where: { id: bookingId },
      include: { housing: true },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Both host and guest can complete
    const isHost = booking.housing.hostId === userId;
    const isGuest = booking.guestId === userId;

    if (!isHost && !isGuest) {
      throw new ForbiddenException('Not authorized');
    }

    const updateData: any = {};

    if (isGuest) {
      updateData.status = BookingStatus.COMPLETED;
      updateData.hostRating = reviews.guestRating;
      updateData.hostReview = reviews.guestReview;
    } else {
      updateData.guestRating = reviews.guestRating;
      updateData.guestReview = reviews.guestReview;
    }

    return await this.prisma.housingBooking.update({
      where: { id: bookingId },
      data: updateData,
    });
  }

  // ============================================
  // HOUSING COOPERATIVES - Cooperativas
  // ============================================

  async createCoop(userId: string, data: any) {
    const coop = await this.prisma.housingCoop.create({
      data: {
        communityId: data.communityId,
        name: data.name,
        description: data.description,
        vision: data.vision,
        images: data.images || [],
        type: data.type as CoopType,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        locationConfirmed: data.locationConfirmed || false,
        minMembers: data.minMembers || 5,
        maxMembers: data.maxMembers,
        totalBudget: data.totalBudget,
        monthlyContribution: data.monthlyContribution,
        governance: data.governance as GovernanceType,
        decisionThreshold: data.decisionThreshold || 0.66,
        sharedSpaces: data.sharedSpaces || [],
        privateSpaces: data.privateSpaces || [],
        communityRules: data.communityRules || [],
        entryCriteria: data.entryCriteria || {},
        phase: CoopPhase.FORMING,
        targetMoveIn: data.targetMoveIn ? new Date(data.targetMoveIn) : null,
        status: CoopStatus.OPEN,
      },
    });

    // Add creator as founder
    await this.prisma.housingCoopMember.create({
      data: {
        coopId: coop.id,
        userId,
        role: CoopMemberRole.FOUNDER,
        status: MemberStatus.ACTIVE,
        joinedAt: new Date(),
      },
    });

    // Update member count
    await this.prisma.housingCoop.update({
      where: { id: coop.id },
      data: { currentMembers: 1 },
    });

    return coop;
  }

  async findCoops(filters?: any) {
    const where: any = {
      status: { not: CoopStatus.ARCHIVED },
    };

    if (filters?.type) {
      where.type = filters.type as CoopType;
    }

    if (filters?.phase) {
      where.phase = filters.phase as CoopPhase;
    }

    if (filters?.openToMembers === 'true') {
      where.status = CoopStatus.OPEN;
      where.currentMembers = { lt: where.maxMembers };
    }

    const coops = await this.prisma.housingCoop.findMany({
      where,
      include: {
        members: {
          where: { status: MemberStatus.ACTIVE },
          include: {
            member: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            members: true,
            proposals: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return coops;
  }

  async findCoopById(coopId: string) {
    const coop = await this.prisma.housingCoop.findUnique({
      where: { id: coopId },
      include: {
        members: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                avatar: true,
                generosityScore: true,
              },
            },
          },
        },
        proposals: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!coop) {
      throw new NotFoundException('Coop not found');
    }

    return coop;
  }

  async joinCoop(userId: string, coopId: string, application: any) {
    const coop = await this.findCoopById(coopId);

    if (coop.status !== CoopStatus.OPEN) {
      throw new BadRequestException('Coop not open to new members');
    }

    if (coop.currentMembers >= coop.maxMembers) {
      throw new BadRequestException('Coop is full');
    }

    // Check if already member
    const existing = await this.prisma.housingCoopMember.findUnique({
      where: {
        coopId_userId: { coopId, userId },
      },
    });

    if (existing) {
      throw new BadRequestException('Already a member or pending');
    }

    const membership = await this.prisma.housingCoopMember.create({
      data: {
        coopId,
        userId,
        role: CoopMemberRole.CANDIDATE,
        status: MemberStatus.PENDING,
        applicationMessage: application.message,
        skills: application.skills || [],
        commitmentLevel: application.commitmentLevel,
        availability: application.availability,
      },
      include: {
        member: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Create proposal for member approval if required
    if (coop.governance !== GovernanceType.ROTATING_ADMIN) {
      await this.prisma.housingCoopProposal.create({
        data: {
          coopId,
          creatorId: userId,
          type: CoopProposalType.MEMBER_APPLICATION,
          title: `Solicitud de ${application.message ? 'ingreso' : 'membresía'}`,
          description: application.message || 'Nueva solicitud de ingreso',
          applicantId: userId,
          requiredVotes: Math.ceil(
            coop.currentMembers * coop.decisionThreshold,
          ),
        },
      });
    }

    return membership;
  }

  async voteCoopProposal(
    userId: string,
    proposalId: string,
    vote: { points: number; decision: VoteDecision; reason?: string },
  ) {
    const proposal = await this.prisma.housingCoopProposal.findUnique({
      where: { id: proposalId },
      include: { coop: true },
    });

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    // Check if user is active member
    const membership = await this.prisma.housingCoopMember.findUnique({
      where: {
        coopId_userId: { coopId: proposal.coopId, userId },
      },
    });

    if (!membership || membership.status !== MemberStatus.ACTIVE) {
      throw new ForbiddenException('Must be active member to vote');
    }

    // Check if already voted
    const existingVote = await this.prisma.housingCoopVote.findUnique({
      where: {
        proposalId_voterId: { proposalId, voterId: userId },
      },
    });

    if (existingVote) {
      throw new BadRequestException('Already voted');
    }

    const coopVote = await this.prisma.housingCoopVote.create({
      data: {
        proposalId,
        voterId: userId,
        points: vote.points,
        decision: vote.decision,
        reason: vote.reason,
      },
    });

    // Update proposal vote count
    if (vote.decision === VoteDecision.APPROVE) {
      await this.prisma.housingCoopProposal.update({
        where: { id: proposalId },
        data: {
          currentVotes: { increment: vote.points },
        },
      });

      // Check if proposal passes
      const updated = await this.prisma.housingCoopProposal.findUnique({
        where: { id: proposalId },
      });

      if (updated.currentVotes >= updated.requiredVotes) {
        // Approve proposal
        await this.approveCoopProposal(proposalId);
      }
    }

    return coopVote;
  }

  private async approveCoopProposal(proposalId: string) {
    const proposal = await this.prisma.housingCoopProposal.findUnique({
      where: { id: proposalId },
    });

    await this.prisma.housingCoopProposal.update({
      where: { id: proposalId },
      data: { approvedAt: new Date() },
    });

    // Execute proposal action
    if (
      proposal.type === CoopProposalType.MEMBER_APPLICATION &&
      proposal.applicantId
    ) {
      // Approve member
      await this.prisma.housingCoopMember.update({
        where: {
          coopId_userId: {
            coopId: proposal.coopId,
            userId: proposal.applicantId,
          },
        },
        data: {
          status: MemberStatus.APPROVED,
          role: CoopMemberRole.MEMBER,
          joinedAt: new Date(),
        },
      });

      // Update member count
      await this.prisma.housingCoop.update({
        where: { id: proposal.coopId },
        data: {
          currentMembers: { increment: 1 },
        },
      });
    }
  }

  // ============================================
  // COMMUNITY GUARANTEE - Garantía Comunitaria
  // ============================================

  async requestGuarantee(userId: string, data: any) {
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { generosityScore: true },
    });

    if (user.generosityScore < 50) {
      throw new ForbiddenException(
        'Necesitas reputación mínima de 50 para solicitar garantía',
      );
    }

    const guarantee = await this.prisma.communityGuarantee.create({
      data: {
        userId,
        communityId: data.communityId,
        landlordName: data.landlordName,
        landlordEmail: data.landlordEmail,
        landlordPhone: data.landlordPhone,
        propertyAddress: data.propertyAddress,
        monthlyRent: data.monthlyRent,
        coverageMonths: data.coverageMonths || 3,
        maxCoverage: data.monthlyRent * (data.coverageMonths || 3),
        reputation: user.generosityScore,
        status: GuaranteeStatus.PENDING,
      },
    });

    return guarantee;
  }

  async supportGuarantee(
    supporterId: string,
    guaranteeId: string,
    commitment: { months: number; amount: number },
  ) {
    const guarantee = await this.prisma.communityGuarantee.findUnique({
      where: { id: guaranteeId },
    });

    if (!guarantee) {
      throw new NotFoundException('Guarantee not found');
    }

    if (guarantee.status !== GuaranteeStatus.PENDING) {
      throw new BadRequestException('Guarantee not pending');
    }

    const support = await this.prisma.guaranteeSupporter.create({
      data: {
        guaranteeId,
        supporterId,
        monthsCommitted: commitment.months,
        amountCommitted: commitment.amount,
        status: SupportStatus.ACTIVE,
      },
    });

    // Check if guarantee is fully supported
    const totalSupport = await this.prisma.guaranteeSupporter.aggregate({
      where: { guaranteeId, status: SupportStatus.ACTIVE },
      _sum: { amountCommitted: true },
    });

    if (totalSupport._sum.amountCommitted >= guarantee.maxCoverage) {
      await this.prisma.communityGuarantee.update({
        where: { id: guaranteeId },
        data: {
          status: GuaranteeStatus.ACTIVE,
          fundAllocated: totalSupport._sum.amountCommitted,
          activatedAt: new Date(),
          expiresAt: new Date(
            Date.now() + guarantee.coverageMonths * 30 * 24 * 60 * 60 * 1000,
          ),
        },
      });
    }

    return support;
  }

  async getMyBookings(userId: string) {
    const spaceBookings = await this.prisma.spaceBooking.findMany({
      where: { bookerId: userId },
      include: {
        space: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const housingBookings = await this.prisma.housingBooking.findMany({
      where: { guestId: userId },
      include: {
        housing: {
          include: {
            host: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      spaces: spaceBookings,
      housing: housingBookings,
    };
  }

  async getMyOfferings(userId: string) {
    const spaces = await this.prisma.spaceBank.findMany({
      where: { ownerId: userId },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    const housing = await this.prisma.temporaryHousing.findMany({
      where: { hostId: userId },
      include: {
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    return { spaces, housing };
  }

  // ============================================
  // UNIFIED SOLUTIONS - All housing types
  // ============================================

  async findAllSolutions(filters?: any) {
    // Extract solutionType filter separately from other filters
    const solutionType = filters?.type;

    // Create filters without the 'type' field to avoid conflicts
    const { type, ...cleanFilters } = filters || {};

    // Fetch based on solutionType filter
    let spaces = [];
    let housing = [];
    let coops = [];

    // Only fetch the specific solution type if specified
    if (!solutionType || solutionType === 'SPACE_BANK') {
      spaces = await this.findSpaces(cleanFilters);
    }

    if (!solutionType || solutionType === 'TEMPORARY_HOUSING') {
      housing = await this.findHousing(cleanFilters);
    }

    if (!solutionType || solutionType === 'HOUSING_COOP') {
      coops = await this.findCoops(cleanFilters);
    }

    // Community Guarantee doesn't have a list endpoint yet, so skip it
    // Will add when COMMUNITY_GUARANTEE listings are needed

    // Transform to unified format with type discriminator
    const solutions = [
      ...spaces.map((space) => ({
        ...space,
        solutionType: 'SPACE_BANK',
        latitude: space.lat,
        longitude: space.lng,
      })),
      ...housing.map((h) => ({
        ...h,
        solutionType: 'TEMPORARY_HOUSING',
        latitude: h.lat,
        longitude: h.lng,
      })),
      ...coops.map((coop) => ({
        ...coop,
        solutionType: 'HOUSING_COOP',
        latitude: coop.lat,
        longitude: coop.lng,
      })),
    ];

    return solutions;
  }

  async findSolutionById(id: string) {
    // Try to find in each housing type table
    // Check SpaceBank first
    try {
      const space = await this.findSpaceById(id);
      if (space) {
        return {
          ...space,
          solutionType: 'SPACE_BANK',
          latitude: space.lat,
          longitude: space.lng,
        };
      }
    } catch (error) {
      // Not found in SpaceBank, continue
    }

    // Check TemporaryHousing
    try {
      const housing = await this.findHousingById(id);
      if (housing) {
        return {
          ...housing,
          solutionType: 'TEMPORARY_HOUSING',
          latitude: housing.lat,
          longitude: housing.lng,
        };
      }
    } catch (error) {
      // Not found in TemporaryHousing, continue
    }

    // Check HousingCoop
    try {
      const coop = await this.findCoopById(id);
      if (coop) {
        return {
          ...coop,
          solutionType: 'HOUSING_COOP',
          latitude: coop.lat,
          longitude: coop.lng,
        };
      }
    } catch (error) {
      // Not found in HousingCoop
    }

    // If not found in any table, throw NotFoundException
    throw new NotFoundException('Housing solution not found');
  }

  async joinSolution(userId: string, solutionId: string, data: any) {
    // First, determine what type of solution this is
    const solution = await this.findSolutionById(solutionId);

    switch (solution.solutionType) {
      case 'SPACE_BANK':
        // For spaces, we need booking information
        if (!data.startTime || !data.endTime) {
          throw new BadRequestException(
            'Se requieren startTime y endTime para reservar un espacio',
          );
        }
        return this.bookSpace(userId, solutionId, data);

      case 'TEMPORARY_HOUSING':
        // For temporary housing, we need check-in/out dates
        if (!data.checkIn || !data.checkOut) {
          throw new BadRequestException(
            'Se requieren checkIn y checkOut para reservar alojamiento',
          );
        }
        return this.bookHousing(userId, solutionId, data);

      case 'HOUSING_COOP':
        // For coops, we need application info
        return this.joinCoop(userId, solutionId, {
          message: data.message || '',
          skills: data.skills || [],
          commitmentLevel: data.commitmentLevel,
          availability: data.availability,
        });

      default:
        throw new BadRequestException(
          `No se puede unir a soluciones de tipo ${solution.solutionType}`,
        );
    }
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
