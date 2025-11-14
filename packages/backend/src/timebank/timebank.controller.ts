import { Controller, Get, Post, Put, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { TimeBankService } from './timebank.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CreateRequestDto } from './dto/create-request.dto';
import { ConfirmTransactionDto } from './dto/confirm-transaction.dto';
import { CompleteTransactionDto } from './dto/complete-transaction.dto';
import { TransactionStatus } from '@prisma/client';

@ApiTags('timebank')
@Controller('timebank')
export class TimeBankController {
  constructor(private timeBankService: TimeBankService) {}

  @ApiOperation({ summary: 'Get available time bank offers' })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({ name: 'experienceLevel', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @Get('offers')
  async getOffers(
    @Query('category') category?: string,
    @Query('experienceLevel') experienceLevel?: string,
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const offset = offsetStr ? parseInt(offsetStr, 10) : undefined;
    return this.timeBankService.getAvailableOffers({ category, experienceLevel, limit, offset });
  }

  @ApiOperation({ summary: 'Get user time bank offers' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('user/my-offers')
  async getUserTimeBankOffers(@Request() req) {
    return this.timeBankService.getUserTimeBankOffers(req.User.userId);
  }

  @ApiOperation({ summary: 'Get user time bank statistics' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getUserStats(@Request() req) {
    return this.timeBankService.getUserStats(req.User.userId);
  }

  @ApiOperation({ summary: 'Create a time bank request' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('requests')
  async createRequest(@Request() req, @Body() createRequestDto: CreateRequestDto) {
    return this.timeBankService.createRequest(req.User.userId, createRequestDto);
  }

  @ApiOperation({ summary: 'Get user time bank transactions' })
  @ApiQuery({ name: 'status', required: false, enum: TransactionStatus })
  @ApiQuery({ name: 'role', required: false, enum: ['requester', 'provider'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('status') status?: TransactionStatus,
    @Query('role') role?: 'requester' | 'provider',
    @Query('limit') limitStr?: string,
    @Query('offset') offsetStr?: string,
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    const offset = offsetStr ? parseInt(offsetStr, 10) : undefined;
    return this.timeBankService.getTransactions(req.User.userId, { status, role, limit, offset });
  }

  @ApiOperation({ summary: 'Get single transaction by ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string, @Request() req) {
    return this.timeBankService.getTransaction(id, req.User.userId);
  }

  @ApiOperation({ summary: 'Confirm or reject a transaction (provider only)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('transactions/:id/confirm')
  async confirmTransaction(
    @Param('id') id: string,
    @Request() req,
    @Body() confirmDto: ConfirmTransactionDto,
  ) {
    const accept = confirmDto.accept !== undefined ? confirmDto.accept : true;
    return this.timeBankService.confirmTransaction(id, req.User.userId, accept);
  }

  @ApiOperation({ summary: 'Complete transaction with rating (bilateral validation)' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('transactions/:id/complete')
  async completeTransaction(
    @Param('id') id: string,
    @Request() req,
    @Body() completeDto: CompleteTransactionDto,
  ) {
    return this.timeBankService.completeTransaction(id, req.User.userId, completeDto);
  }

  @ApiOperation({ summary: 'Cancel a transaction' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('transactions/:id/cancel')
  async cancelTransaction(@Param('id') id: string, @Request() req) {
    return this.timeBankService.cancelTransaction(id, req.User.userId);
  }
}
