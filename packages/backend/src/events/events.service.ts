import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { CreditReason } from '@prisma/client';
import { randomBytes } from 'crypto';
import { LoggerService } from '../common/logger.service';

@Injectable()
export class EventsService {
  private readonly logger = new LoggerService('EventsService');

  constructor(
    private prisma: PrismaService,
    private creditsService: CreditsService,
  ) {}

  /**
   * Generate a unique QR token for an event
   */
  private generateQRToken(eventId: string): string {
    const random = randomBytes(16).toString('hex');
    return `${eventId}-${random}`;
  }

  /**
   * Create a new event with QR code
   */
  async create(organizerId: string, data: any) {
    const event = await this.prisma.event.create({
      data: {
        ...data,
        organizerId,
        qrCode: this.generateQRToken(data.title || 'event'),
      },
      include: {
        organizer: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return event;
  }

  /**
   * Get all upcoming events
   */
  async findAll(params?: {
    upcoming?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
  }) {
    const { upcoming = true, category, limit = 20, offset = 0 } = params || {};

    const where: any = {};

    if (upcoming) {
      where.startsAt = { gte: new Date() };
    }

    if (category) {
      where.category = category;
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        include: {
          organizer: {
            select: { id: true, name: true, avatar: true },
          },
          attendees: {
            include: {
              user: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
          _count: {
            select: {
              attendees: true,
            },
          },
        },
        orderBy: { startsAt: 'asc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.event.count({ where }),
    ]);

    return { events, total, limit, offset };
  }

  /**
   * Get single event by ID
   */
  async findOne(id: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        organizer: {
          select: { id: true, name: true, avatar: true },
        },
        attendees: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
          orderBy: { registeredAt: 'asc' },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    return event;
  }

  /**
   * Register for an event
   */
  async register(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { attendees: true } } },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Check if event is full
    if (event.capacity && event._count.attendees >= event.capacity) {
      throw new BadRequestException('Event is full');
    }

    // Check if event hasn't started yet
    if (event.startsAt < new Date()) {
      throw new BadRequestException('Event has already started');
    }

    // Check if already registered
    const existing = await this.prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (existing) {
      throw new BadRequestException('Already registered for this event');
    }

    const attendee = await this.prisma.eventAttendee.create({
      data: {
        eventId,
        userId,
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // TODO: Send notification

    return attendee;
  }

  /**
   * Cancel registration for an event
   */
  async cancelRegistration(eventId: string, userId: string) {
    const attendee = await this.prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    if (!attendee) {
      throw new NotFoundException('Registration not found');
    }

    if (attendee.checkedInAt !== null) {
      throw new BadRequestException('Cannot cancel after check-in');
    }

    await this.prisma.eventAttendee.delete({
      where: {
        eventId_userId: { eventId, userId },
      },
    });

    return { success: true };
  }

  /**
   * Get QR code for an event (organizer only)
   */
  async getEventQRCode(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can access the QR code');
    }

    return {
      eventId: event.id,
      qrCode: event.qrCode,
      title: event.title,
    };
  }

  /**
   * Check in to an event using QR code
   */
  async checkIn(qrToken: string, userId: string) {
    // Find event by QR code
    const event = await this.prisma.event.findFirst({
      where: { qrCode: qrToken },
    });

    if (!event) {
      throw new NotFoundException('Invalid QR code');
    }

    // Check if user is registered
    const attendee = await this.prisma.eventAttendee.findUnique({
      where: {
        eventId_userId: { eventId: event.id, userId },
      },
    });

    if (!attendee) {
      throw new BadRequestException('You must register for this event first');
    }

    if (attendee.checkedInAt !== null) {
      throw new BadRequestException('You have already checked in');
    }

    // Check if event is happening now (within 1 hour before or 2 hours after start)
    const now = new Date();
    const eventStart = new Date(event.startsAt);
    const oneHourBefore = new Date(eventStart.getTime() - 60 * 60 * 1000);
    const twoHoursAfter = new Date(eventStart.getTime() + 2 * 60 * 60 * 1000);

    if (now < oneHourBefore || now > twoHoursAfter) {
      throw new BadRequestException('Check-in is only available 1h before to 2h after the event start');
    }

    // Update attendee check-in time
    const updated = await this.prisma.eventAttendee.update({
      where: {
        eventId_userId: { eventId: event.id, userId },
      },
      data: {
        checkedInAt: new Date(),
      },
      include: {
        user: {
          select: { id: true, name: true, avatar: true },
        },
        event: {
          select: { id: true, title: true, type: true },
        },
      },
    });

    // Award credits for event attendance (3 credits according to spec)
    try {
      await this.creditsService.grantCredits(
        userId,
        3,
        CreditReason.EVENT_ATTENDANCE,
        event.id,
        `Asistencia a evento: ${event.title}`,
      );
    } catch (error) {
      // Log but don't fail check-in if credit grant fails
      this.logger.error(
        'Error awarding event attendance credits',
        error instanceof Error ? error.stack : String(error),
      );
    }

    return {
      ...updated,
      creditsAwarded: 3,
      message: 'Check-in successful! You earned 3 credits.',
    };
  }

  /**
   * Get event attendees (organizer only or public if event allows)
   */
  async getAttendees(eventId: string, userId?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Only organizer can see full attendee list
    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can view attendees');
    }

    const attendees = await this.prisma.eventAttendee.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, name: true, avatar: true, email: true },
        },
      },
      orderBy: { registeredAt: 'asc' },
    });

    const stats = {
      total: attendees.length,
      checkedIn: attendees.filter(a => a.checkedInAt !== null).length,
      registered: attendees.filter(a => a.checkedInAt === null).length,
    };

    return { attendees, stats };
  }

  /**
   * Get user's event registrations
   */
  async getUserEvents(userId: string, params?: { upcoming?: boolean }) {
    const { upcoming = true } = params || {};

    const where: any = {
      userId,
    };

    if (upcoming) {
      where.event = {
        startsAt: { gte: new Date() },
      };
    }

    const registrations = await this.prisma.eventAttendee.findMany({
      where,
      include: {
        event: {
          include: {
            organizer: {
              select: { id: true, name: true, avatar: true },
            },
            _count: {
              select: { attendees: true },
            },
          },
        },
      },
      orderBy: { event: { startsAt: 'asc' } },
    });

    return registrations;
  }

  /**
   * Update event (organizer only)
   */
  async update(eventId: string, userId: string, data: any) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can update this event');
    }

    const updated = await this.prisma.event.update({
      where: { id: eventId },
      data,
      include: {
        organizer: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    return updated;
  }

  /**
   * Delete event (organizer only)
   */
  async remove(eventId: string, userId: string) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: { select: { attendees: true } },
      },
    });

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    if (event.organizerId !== userId) {
      throw new ForbiddenException('Only the organizer can delete this event');
    }

    if (event._count.attendees > 0) {
      throw new BadRequestException('Cannot delete event with registered attendees');
    }

    await this.prisma.event.delete({
      where: { id: eventId },
    });

    return { success: true };
  }

  /**
   * Get events created by user (as organizer)
   */
  async getUserCreatedEvents(userId: string) {
    const events = await this.prisma.event.findMany({
      where: {
        organizerId: userId,
      },
      include: {
        organizer: {
          select: { id: true, name: true, avatar: true },
        },
        _count: {
          select: {
            attendees: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true },
            },
          },
        },
      },
      orderBy: { startsAt: 'desc' },
    });

    return events;
  }
}
