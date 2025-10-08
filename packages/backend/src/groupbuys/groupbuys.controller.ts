import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { GroupBuysService } from './groupbuys.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateGroupBuyDto } from './dto/create-groupbuy.dto';
import { JoinGroupBuyDto } from './dto/join-groupbuy.dto';
import { UpdateParticipationDto } from './dto/update-participation.dto';

@ApiTags('groupbuys')
@Controller('groupbuys')
export class GroupBuysController {
  constructor(private groupBuysService: GroupBuysService) {}

  @ApiOperation({ summary: 'Get active group buys' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'nearLat', required: false, type: Number })
  @ApiQuery({ name: 'nearLng', required: false, type: Number })
  @ApiQuery({ name: 'maxDistance', required: false, type: Number })
  @Get()
  async getActiveGroupBuys(
    @Query('category') category?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('nearLat') nearLat?: number,
    @Query('nearLng') nearLng?: number,
    @Query('maxDistance') maxDistance?: number,
  ) {
    return this.groupBuysService.getActiveGroupBuys({
      category,
      limit,
      offset,
      nearLat,
      nearLng,
      maxDistance,
    });
  }

  @ApiOperation({ summary: 'Get single group buy by ID' })
  @Get(':id')
  async getGroupBuy(@Param('id') id: string) {
    return this.groupBuysService.getGroupBuy(id);
  }

  @ApiOperation({ summary: 'Create a new group buy' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async createGroupBuy(@Request() req, @Body() createGroupBuyDto: CreateGroupBuyDto) {
    return this.groupBuysService.createGroupBuy(req.user.userId, createGroupBuyDto);
  }

  @ApiOperation({ summary: 'Join a group buy' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/join')
  async joinGroupBuy(
    @Param('id') id: string,
    @Request() req,
    @Body() joinGroupBuyDto: JoinGroupBuyDto,
  ) {
    return this.groupBuysService.joinGroupBuy(id, req.user.userId, joinGroupBuyDto);
  }

  @ApiOperation({ summary: 'Update participation (quantity or commitment)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id/participation')
  async updateParticipation(
    @Param('id') id: string,
    @Request() req,
    @Body() updateParticipationDto: UpdateParticipationDto,
  ) {
    return this.groupBuysService.updateParticipation(id, req.user.userId, updateParticipationDto);
  }

  @ApiOperation({ summary: 'Leave a group buy' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id/participation')
  async leaveGroupBuy(@Param('id') id: string, @Request() req) {
    return this.groupBuysService.leaveGroupBuy(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Close a group buy (organizer only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/close')
  async closeGroupBuy(@Param('id') id: string, @Request() req) {
    return this.groupBuysService.closeGroupBuy(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Get user participations in group buys' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/participations')
  async getUserParticipations(@Request() req) {
    return this.groupBuysService.getUserParticipations(req.user.userId);
  }
}
