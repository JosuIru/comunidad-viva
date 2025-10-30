import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CommunityVisibility, UserRole } from '@prisma/client';

@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() createCommunityDto: CreateCommunityDto) {
    return this.communitiesService.create(req.user.userId, createCommunityDto);
  }

  @Get()
  findAll(
    @Query('type') type?: string,
    @Query('visibility') visibility?: CommunityVisibility,
    @Query('search') search?: string,
  ) {
    return this.communitiesService.findAll({ type, visibility, search });
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string, @Request() req) {
    const userId = req.user?.userId;
    return this.communitiesService.findBySlug(slug, userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.communitiesService.findOne(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateCommunityDto: UpdateCommunityDto,
  ) {
    return this.communitiesService.update(id, req.user.userId, updateCommunityDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param('id') id: string, @Request() req) {
    return this.communitiesService.delete(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  joinCommunity(@Param('id') id: string, @Request() req, @Body() body?: { message?: string }) {
    return this.communitiesService.joinCommunity(id, req.user.userId, body?.message);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/leave')
  leaveCommunity(@Param('id') id: string, @Request() req) {
    return this.communitiesService.leaveCommunity(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/members')
  getMembers(@Param('id') id: string, @Request() req) {
    return this.communitiesService.getMembers(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/membership-requests')
  getMembershipRequests(@Param('id') id: string, @Request() req) {
    return this.communitiesService.getMembershipRequests(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/membership-requests/:requestId/approve')
  approveMembershipRequest(
    @Param('id') id: string,
    @Param('requestId') requestId: string,
    @Request() req,
    @Body() body?: { reviewNote?: string },
  ) {
    return this.communitiesService.approveMembershipRequest(
      id,
      requestId,
      req.user.userId,
      body?.reviewNote,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/membership-requests/:requestId/reject')
  rejectMembershipRequest(
    @Param('id') id: string,
    @Param('requestId') requestId: string,
    @Request() req,
    @Body() body?: { reviewNote?: string },
  ) {
    return this.communitiesService.rejectMembershipRequest(
      id,
      requestId,
      req.user.userId,
      body?.reviewNote,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get('audit-log')
  getAuditLog(
    @Query('userId') userId?: string,
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.communitiesService.getAuditLog({
      userId,
      entity,
      entityId,
      action,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      skip: skip ? parseInt(skip) : undefined,
      take: take ? parseInt(take) : undefined,
    });
  }

  @Get(':id/activity')
  getCommunityActivity(
    @Param('id') id: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 20;
    return this.communitiesService.getCommunityActivity(id, limitNum);
  }
}
