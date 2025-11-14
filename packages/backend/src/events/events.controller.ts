import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { RequireEmailVerification } from '../common/decorators/require-email-verification.decorator';
import { CheckOwnership } from '../common/decorators/check-ownership.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CheckInEventDto } from './dto/checkin-event.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ name: 'upcoming', required: false, type: Boolean })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'communityId', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'nearLat', required: false, type: Number })
  @ApiQuery({ name: 'nearLng', required: false, type: Number })
  @ApiQuery({ name: 'maxDistance', required: false, type: Number })
  @Get()
  async findAll(
    @Query('upcoming') upcoming?: boolean,
    @Query('category') category?: string,
    @Query('communityId') communityId?: string,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
    @Query('nearLat') nearLatStr?: string,
    @Query('nearLng') nearLngStr?: string,
    @Query('maxDistance') maxDistanceStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const offset = offsetStr ? parseInt(offsetStr, 10) : undefined;
    const nearLat = nearLatStr ? parseFloat(nearLatStr) : undefined;
    const nearLng = nearLngStr ? parseFloat(nearLngStr) : undefined;
    const maxDistance = maxDistanceStr ? parseFloat(maxDistanceStr) : undefined;

    return this.eventsService.findAll({
      upcoming,
      category,
      communityId,
      limit,
      offset,
      nearLat,
      nearLng,
      maxDistance
    });
  }

  @ApiOperation({ summary: 'Get user event registrations' })
  @ApiQuery({ name: 'upcoming', required: false, type: Boolean })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/registrations')
  async getUserEvents(@Request() req, @Query('upcoming') upcoming?: boolean) {
    return this.eventsService.getUserEvents(req.User.userId, { upcoming });
  }

  @ApiOperation({ summary: 'Get events created by current user (as organizer)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/my-events')
  async getUserCreatedEvents(@Request() req) {
    return this.eventsService.getUserCreatedEvents(req.User.userId);
  }

  @ApiOperation({ summary: 'Get event by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new event' })
  @ApiBearerAuth()
  @RequireEmailVerification()
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Post()
  async create(@Request() req, @Body() data: CreateEventDto) {
    return this.eventsService.create(req.User.userId, data);
  }

  @ApiOperation({ summary: 'Update event (organizer only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @CheckOwnership('event')
  @Put(':id')
  async update(@Param('id') id: string, @Request() req, @Body() data: UpdateEventDto) {
    return this.eventsService.update(id, req.User.userId, data);
  }

  @ApiOperation({ summary: 'Delete event (organizer only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @CheckOwnership('event')
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.eventsService.remove(id, req.User.userId);
  }

  @ApiOperation({ summary: 'Register for event' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/register')
  async register(@Param('id') id: string, @Request() req) {
    return this.eventsService.register(id, req.User.userId);
  }

  @ApiOperation({ summary: 'Cancel registration for event' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/register')
  async cancelRegistration(@Param('id') id: string, @Request() req) {
    return this.eventsService.cancelRegistration(id, req.User.userId);
  }

  @ApiOperation({ summary: 'Get event QR code (organizer only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/qr')
  async getQRCode(@Param('id') id: string, @Request() req) {
    return this.eventsService.getEventQRCode(id, req.User.userId);
  }

  @ApiOperation({ summary: 'Check in to event using QR code' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('checkin')
  async checkIn(@Request() req, @Body() checkInDto: CheckInEventDto) {
    return this.eventsService.checkIn(checkInDto.qrToken, req.User.userId);
  }

  @ApiOperation({ summary: 'Get event attendees (organizer only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/attendees')
  async getAttendees(@Param('id') id: string, @Request() req) {
    return this.eventsService.getAttendees(id, req.User.userId);
  }
}
