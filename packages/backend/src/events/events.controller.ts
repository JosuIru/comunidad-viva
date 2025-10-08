import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CheckInEventDto } from './dto/checkin-event.dto';

@ApiTags('events')
@Controller('events')
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @ApiOperation({ summary: 'Get all events' })
  @ApiQuery({ name: 'upcoming', required: false, type: Boolean })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @Get()
  async findAll(
    @Query('upcoming') upcoming?: boolean,
    @Query('category') category?: string,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const offset = offsetStr ? parseInt(offsetStr, 10) : undefined;
    return this.eventsService.findAll({ upcoming, category, limit, offset });
  }

  @ApiOperation({ summary: 'Get user event registrations' })
  @ApiQuery({ name: 'upcoming', required: false, type: Boolean })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/registrations')
  async getUserEvents(@Request() req, @Query('upcoming') upcoming?: boolean) {
    return this.eventsService.getUserEvents(req.user.userId, { upcoming });
  }

  @ApiOperation({ summary: 'Get events created by current user (as organizer)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/my-events')
  async getUserCreatedEvents(@Request() req) {
    return this.eventsService.getUserCreatedEvents(req.user.userId);
  }

  @ApiOperation({ summary: 'Get event by ID' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @ApiOperation({ summary: 'Create new event' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() data: any) {
    return this.eventsService.create(req.user.userId, data);
  }

  @ApiOperation({ summary: 'Update event (organizer only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Request() req, @Body() data: any) {
    return this.eventsService.update(id, req.user.userId, data);
  }

  @ApiOperation({ summary: 'Delete event (organizer only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req) {
    return this.eventsService.remove(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Register for event' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/register')
  async register(@Param('id') id: string, @Request() req) {
    return this.eventsService.register(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Cancel registration for event' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/register')
  async cancelRegistration(@Param('id') id: string, @Request() req) {
    return this.eventsService.cancelRegistration(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Get event QR code (organizer only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/qr')
  async getQRCode(@Param('id') id: string, @Request() req) {
    return this.eventsService.getEventQRCode(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Check in to event using QR code' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('checkin')
  async checkIn(@Request() req, @Body() checkInDto: CheckInEventDto) {
    return this.eventsService.checkIn(checkInDto.qrToken, req.user.userId);
  }

  @ApiOperation({ summary: 'Get event attendees (organizer only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/attendees')
  async getAttendees(@Param('id') id: string, @Request() req) {
    return this.eventsService.getAttendees(id, req.user.userId);
  }
}
