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
import { CommunityVisibility } from '@prisma/client';

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
  joinCommunity(@Param('id') id: string, @Request() req) {
    return this.communitiesService.joinCommunity(id, req.user.userId);
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
}
