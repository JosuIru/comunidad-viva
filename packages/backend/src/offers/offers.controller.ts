import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';

@ApiTags('offers')
@Controller('offers')
export class OffersController {
  constructor(private offersService: OffersService) {}

  @ApiOperation({ summary: 'Get all offers' })
  @ApiResponse({ status: 200, description: 'Returns all offers' })
  @Get()
  async findAll(@Query() filters: any) {
    return this.offersService.findAll(filters);
  }

  @ApiOperation({ summary: 'Get current user offers' })
  @ApiResponse({ status: 200, description: 'Returns user offers' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/my-offers')
  async getUserOffers(@Request() req) {
    return this.offersService.findUserOffers(req.user.userId);
  }

  @ApiOperation({ summary: 'Get offer by ID' })
  @ApiResponse({ status: 200, description: 'Returns offer details' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.offersService.findOne(id, userId);
  }

  @ApiOperation({ summary: 'Create new offer' })
  @ApiResponse({ status: 201, description: 'Offer created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req, @Body() createOfferDto: CreateOfferDto) {
    return this.offersService.create(req.user.userId, createOfferDto);
  }

  @ApiOperation({ summary: 'Update offer' })
  @ApiResponse({ status: 200, description: 'Offer updated successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Request() req, @Body() updateOfferDto: UpdateOfferDto) {
    return this.offersService.update(id, req.user.userId, updateOfferDto);
  }

  @ApiOperation({ summary: 'Delete offer' })
  @ApiResponse({ status: 200, description: 'Offer deleted successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req) {
    return this.offersService.delete(id, req.user.userId);
  }

  @ApiOperation({ summary: 'Toggle interest in offer' })
  @ApiResponse({ status: 200, description: 'Interest toggled successfully' })
  @ApiResponse({ status: 404, description: 'Offer not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/interested')
  async toggleInterest(@Param('id') id: string, @Request() req) {
    return this.offersService.toggleInterest(id, req.user.userId);
  }
}
