import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { EmailService } from '../notifications/email.service';
import { CreditReason } from '@prisma/client';

describe('EventsService', () => {
  let service: EventsService;
  let prismaService: any;
  let creditsService: any;
  let emailService: any;

  const mockEvent = {
    id: 'event-123',
    organizerId: 'user-123',
    title: 'Test Event',
    description: 'Test Description',
    startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    endsAt: new Date(Date.now() + 25 * 60 * 60 * 1000),
    address: 'Test Address',
    lat: 40.7128,
    lng: -74.0060,
    category: 'WORKSHOP',
    type: 'PRESENTIAL',
    capacity: 10,
    qrCode: 'event-123-qrcode',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrganizer = {
    id: 'user-123',
    name: 'Test Organizer',
    email: 'organizer@test.com',
    avatar: null,
  };

  const mockAttendee = {
    id: 'attendee-123',
    eventId: 'event-123',
    userId: 'user-456',
    registeredAt: new Date(),
    checkedInAt: null,
    user: {
      id: 'user-456',
      name: 'Test Attendee',
      email: 'attendee@test.com',
      avatar: null,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: {
            event: {
              create: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            eventAttendee: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
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
            sendEventRegistrationConfirmation: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
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

  describe('create', () => {
    it('should create an event with QR code', async () => {
      const createEventDto = {
        title: 'New Event',
        description: 'Description',
        startsAt: new Date(),
        address: 'Address',
        category: 'WORKSHOP',
      };

      const createdEvent = {
        ...mockEvent,
        ...createEventDto,
        organizer: mockOrganizer,
      };

      prismaService.event.create.mockResolvedValue(createdEvent);

      const result = await service.create('user-123', createEventDto);

      expect(prismaService.event.create).toHaveBeenCalled();
      expect(result.qrCode).toBeDefined();
      expect(result.organizerId).toBe('user-123');
    });

    it('should generate unique QR codes', async () => {
      const createEventDto = {
        title: 'Event',
        startsAt: new Date(),
        address: 'Address',
      };

      prismaService.event.create.mockResolvedValue({ ...mockEvent });

      await service.create('user-123', createEventDto);
      await service.create('user-123', createEventDto);

      const firstQR = prismaService.event.create.mock.calls[0][0].data.qrCode;
      const secondQR = prismaService.event.create.mock.calls[1][0].data.qrCode;

      expect(firstQR).not.toBe(secondQR);
    });
  });

  describe('findAll', () => {
    it('should return all upcoming events by default', async () => {
      const events = [mockEvent];
      prismaService.event.findMany.mockResolvedValue(events);
      prismaService.event.count.mockResolvedValue(1);

      const result = await service.findAll();

      expect(prismaService.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startsAt: { gte: expect.any(Date) },
          }),
        }),
      );
      expect(result.events).toEqual(events);
      expect(result.total).toBe(1);
    });

    it('should filter by category', async () => {
      prismaService.event.findMany.mockResolvedValue([]);
      prismaService.event.count.mockResolvedValue(0);

      await service.findAll({ category: 'WORKSHOP' });

      expect(prismaService.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'WORKSHOP',
          }),
        }),
      );
    });

    it('should support pagination', async () => {
      prismaService.event.findMany.mockResolvedValue([]);
      prismaService.event.count.mockResolvedValue(0);

      await service.findAll({ limit: 5, offset: 10 });

      expect(prismaService.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 5,
          skip: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return event details', async () => {
      const eventWithDetails = {
        ...mockEvent,
        organizer: mockOrganizer,
        attendees: [mockAttendee],
        _count: { attendees: 1 },
      };

      prismaService.event.findUnique.mockResolvedValue(eventWithDetails);

      const result = await service.findOne('event-123');

      expect(prismaService.event.findUnique).toHaveBeenCalledWith({
        where: { id: 'event-123' },
        include: expect.any(Object),
      });
      expect(result).toEqual(eventWithDetails);
    });

    it('should throw NotFoundException if event not found', async () => {
      prismaService.event.findUnique.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('register', () => {
    it('should register user for event', async () => {
      const eventWithCount = {
        ...mockEvent,
        _count: { attendees: 5 },
      };

      prismaService.event.findUnique.mockResolvedValue(eventWithCount);
      prismaService.eventAttendee.findUnique.mockResolvedValue(null);
      prismaService.eventAttendee.create.mockResolvedValue(mockAttendee);
      emailService.sendEventRegistrationConfirmation.mockResolvedValue(true);

      const result = await service.register('event-123', 'user-456');

      expect(prismaService.eventAttendee.create).toHaveBeenCalled();
      expect(emailService.sendEventRegistrationConfirmation).toHaveBeenCalledWith(
        'attendee@test.com',
        mockEvent.title,
        mockEvent.startsAt,
        mockEvent.address,
      );
      expect(result).toEqual(mockAttendee);
    });

    it('should throw BadRequestException if event is full', async () => {
      const fullEvent = {
        ...mockEvent,
        capacity: 10,
        _count: { attendees: 10 },
      };

      prismaService.event.findUnique.mockResolvedValue(fullEvent);

      await expect(service.register('event-123', 'user-456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if event already started', async () => {
      const pastEvent = {
        ...mockEvent,
        startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        _count: { attendees: 5 },
      };

      prismaService.event.findUnique.mockResolvedValue(pastEvent);

      await expect(service.register('event-123', 'user-456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if already registered', async () => {
      const eventWithCount = {
        ...mockEvent,
        _count: { attendees: 5 },
      };

      prismaService.event.findUnique.mockResolvedValue(eventWithCount);
      prismaService.eventAttendee.findUnique.mockResolvedValue(mockAttendee);

      await expect(service.register('event-123', 'user-456')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cancelRegistration', () => {
    it('should cancel registration', async () => {
      prismaService.eventAttendee.findUnique.mockResolvedValue(mockAttendee);
      prismaService.eventAttendee.delete.mockResolvedValue(mockAttendee);

      const result = await service.cancelRegistration('event-123', 'user-456');

      expect(prismaService.eventAttendee.delete).toHaveBeenCalledWith({
        where: {
          eventId_userId: { eventId: 'event-123', userId: 'user-456' },
        },
      });
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if not registered', async () => {
      prismaService.eventAttendee.findUnique.mockResolvedValue(null);

      await expect(
        service.cancelRegistration('event-123', 'user-456'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if already checked in', async () => {
      const checkedInAttendee = {
        ...mockAttendee,
        checkedInAt: new Date(),
      };

      prismaService.eventAttendee.findUnique.mockResolvedValue(checkedInAttendee);

      await expect(
        service.cancelRegistration('event-123', 'user-456'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('checkIn', () => {
    it('should check in attendee and award credits', async () => {
      const now = new Date();
      const eventStarting = {
        ...mockEvent,
        startsAt: new Date(now.getTime() + 30 * 60 * 1000), // 30 min from now
      };

      prismaService.event.findFirst.mockResolvedValue(eventStarting);
      prismaService.eventAttendee.findUnique.mockResolvedValue(mockAttendee);
      prismaService.eventAttendee.update.mockResolvedValue({
        ...mockAttendee,
        checkedInAt: now,
        event: eventStarting,
      });
      creditsService.grantCredits.mockResolvedValue(true);

      const result = await service.checkIn('qrcode', 'user-456');

      expect(prismaService.eventAttendee.update).toHaveBeenCalled();
      expect(creditsService.grantCredits).toHaveBeenCalledWith(
        'user-456',
        3,
        CreditReason.EVENT_ATTENDANCE,
        eventStarting.id,
        expect.any(String),
      );
      expect(result.creditsAwarded).toBe(3);
    });

    it('should throw NotFoundException if QR code invalid', async () => {
      prismaService.event.findFirst.mockResolvedValue(null);

      await expect(service.checkIn('invalid-qr', 'user-456')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if not registered', async () => {
      prismaService.event.findFirst.mockResolvedValue(mockEvent);
      prismaService.eventAttendee.findUnique.mockResolvedValue(null);

      await expect(service.checkIn('qrcode', 'user-456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if already checked in', async () => {
      const checkedInAttendee = {
        ...mockAttendee,
        checkedInAt: new Date(),
      };

      prismaService.event.findFirst.mockResolvedValue(mockEvent);
      prismaService.eventAttendee.findUnique.mockResolvedValue(checkedInAttendee);

      await expect(service.checkIn('qrcode', 'user-456')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException if check-in outside time window', async () => {
      const futureEvent = {
        ...mockEvent,
        startsAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      };

      prismaService.event.findFirst.mockResolvedValue(futureEvent);
      prismaService.eventAttendee.findUnique.mockResolvedValue(mockAttendee);

      await expect(service.checkIn('qrcode', 'user-456')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getEventQRCode', () => {
    it('should return QR code for organizer', async () => {
      prismaService.event.findUnique.mockResolvedValue(mockEvent);

      const result = await service.getEventQRCode('event-123', 'user-123');

      expect(result).toEqual({
        eventId: mockEvent.id,
        qrCode: mockEvent.qrCode,
        title: mockEvent.title,
      });
    });

    it('should throw ForbiddenException if not organizer', async () => {
      prismaService.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.getEventQRCode('event-123', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update event if organizer', async () => {
      const updateData = { title: 'Updated Title' };
      const updatedEvent = {
        ...mockEvent,
        ...updateData,
        organizer: mockOrganizer,
      };

      prismaService.event.findUnique.mockResolvedValue(mockEvent);
      prismaService.event.update.mockResolvedValue(updatedEvent);

      const result = await service.update('event-123', 'user-123', updateData);

      expect(prismaService.event.update).toHaveBeenCalledWith({
        where: { id: 'event-123' },
        data: updateData,
        include: expect.any(Object),
      });
      expect(result.title).toBe('Updated Title');
    });

    it('should throw ForbiddenException if not organizer', async () => {
      prismaService.event.findUnique.mockResolvedValue(mockEvent);

      await expect(
        service.update('event-123', 'other-user', { title: 'New' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete event if no attendees', async () => {
      const eventWithoutAttendees = {
        ...mockEvent,
        _count: { attendees: 0 },
      };

      prismaService.event.findUnique.mockResolvedValue(eventWithoutAttendees);
      prismaService.event.delete.mockResolvedValue(mockEvent);

      const result = await service.remove('event-123', 'user-123');

      expect(prismaService.event.delete).toHaveBeenCalledWith({
        where: { id: 'event-123' },
      });
      expect(result).toEqual({ success: true });
    });

    it('should throw BadRequestException if has attendees', async () => {
      const eventWithAttendees = {
        ...mockEvent,
        _count: { attendees: 5 },
      };

      prismaService.event.findUnique.mockResolvedValue(eventWithAttendees);

      await expect(service.remove('event-123', 'user-123')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw ForbiddenException if not organizer', async () => {
      const eventWithoutAttendees = {
        ...mockEvent,
        _count: { attendees: 0 },
      };

      prismaService.event.findUnique.mockResolvedValue(eventWithoutAttendees);

      await expect(service.remove('event-123', 'other-user')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
