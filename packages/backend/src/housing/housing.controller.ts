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
import { HousingService } from './housing.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OwnershipGuard } from '../common/guards/ownership.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { CheckOwnership } from '../common/decorators/check-ownership.decorator';
import { CreateSpaceDto } from './dto/create-space.dto';
import { CreateHousingDto } from './dto/create-housing.dto';
import { UpdateSpaceDto } from './dto/update-space.dto';
import { UpdateHousingDto } from './dto/update-housing.dto';

@Controller('housing')
export class HousingController {
  constructor(private readonly housingService: HousingService) {}

  // ============================================
  // UNIFIED SOLUTIONS - All housing types
  // ============================================

  @Get('solutions/:id')
  findSolutionById(@Param('id') id: string) {
    return this.housingService.findSolutionById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('solutions/:id/join')
  joinSolution(@Request() req, @Param('id') id: string, @Body() body: any) {
    return this.housingService.joinSolution(req.user.userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('solutions')
  createSolution(@Request() req, @Body() body: any) {
    const { solutionType, ...data } = body;

    // Route to specific creation method based on solution type
    switch (solutionType) {
      case 'SPACE_BANK':
        return this.housingService.createSpace(req.user.userId, data);
      case 'TEMPORARY_HOUSING':
        return this.housingService.createHousing(req.user.userId, data);
      case 'HOUSING_COOP':
        return this.housingService.createCoop(req.user.userId, data);
      case 'COMMUNITY_GUARANTEE':
        return this.housingService.requestGuarantee(req.user.userId, data);
      default:
        throw new Error(`Unknown solution type: ${solutionType}`);
    }
  }

  @Get('solutions')
  findAllSolutions(
    @Query('type') type?: string,
    @Query('communityId') communityId?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
  ) {
    return this.housingService.findAllSolutions({
      type,
      communityId,
      lat,
      lng,
      radiusKm,
    });
  }

  // ============================================
  // SPACE BANK - Banco de Espacios
  // ============================================

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Post('spaces')
  createSpace(@Request() req, @Body() body: CreateSpaceDto) {
    return this.housingService.createSpace(req.user.userId, body);
  }

  @Get('spaces')
  findSpaces(
    @Query('type') type?: string,
    @Query('communityId') communityId?: string,
    @Query('isFree') isFree?: string,
    @Query('exchangeType') exchangeType?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
  ) {
    return this.housingService.findSpaces({
      type,
      communityId,
      isFree,
      exchangeType,
      lat,
      lng,
      radiusKm,
    });
  }

  @Get('spaces/:id')
  findSpaceById(@Param('id') id: string) {
    return this.housingService.findSpaceById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('spaces/:id/book')
  bookSpace(@Request() req, @Param('id') id: string, @Body() body) {
    return this.housingService.bookSpace(req.user.userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('spaces/bookings/:bookingId/approve')
  approveSpaceBooking(@Request() req, @Param('bookingId') bookingId: string) {
    return this.housingService.approveSpaceBooking(
      req.user.userId,
      bookingId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('spaces/bookings/:bookingId/complete')
  completeSpaceBooking(
    @Request() req,
    @Param('bookingId') bookingId: string,
    @Body() body,
  ) {
    return this.housingService.completeSpaceBooking(
      req.user.userId,
      bookingId,
      body,
    );
  }

  // ============================================
  // TEMPORARY HOUSING - Hospedaje Temporal
  // ============================================

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Post('temporary')
  createHousing(@Request() req, @Body() body: CreateHousingDto) {
    return this.housingService.createHousing(req.user.userId, body);
  }

  @Get('temporary')
  findHousing(
    @Query('type') type?: string,
    @Query('communityId') communityId?: string,
    @Query('accommodationType') accommodationType?: string,
    @Query('minBeds') minBeds?: string,
    @Query('checkIn') checkIn?: string,
    @Query('checkOut') checkOut?: string,
    @Query('isFree') isFree?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
  ) {
    return this.housingService.findHousing({
      type,
      communityId,
      accommodationType,
      minBeds,
      checkIn,
      checkOut,
      isFree,
      lat,
      lng,
      radiusKm,
    });
  }

  @Get('temporary/:id')
  findHousingById(@Param('id') id: string) {
    return this.housingService.findHousingById(id);
  }

  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @CheckOwnership('housingListing')
  @Put('temporary/:id')
  updateHousing(@Request() req, @Param('id') id: string, @Body() body: UpdateHousingDto) {
    return this.housingService.updateHousing(id, req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @CheckOwnership('housingListing')
  @Delete('temporary/:id')
  deleteHousing(@Request() req, @Param('id') id: string) {
    return this.housingService.deleteHousing(id, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('temporary/:id/book')
  bookHousing(@Request() req, @Param('id') id: string, @Body() body) {
    return this.housingService.bookHousing(req.user.userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('temporary/bookings/:bookingId/approve')
  approveHousingBooking(
    @Request() req,
    @Param('bookingId') bookingId: string,
    @Body() body,
  ) {
    return this.housingService.approveHousingBooking(
      req.user.userId,
      bookingId,
      body.response,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('temporary/bookings/:bookingId/checkin')
  checkInHousing(@Request() req, @Param('bookingId') bookingId: string) {
    return this.housingService.checkInHousing(req.user.userId, bookingId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('temporary/bookings/:bookingId/complete')
  completeHousingStay(
    @Request() req,
    @Param('bookingId') bookingId: string,
    @Body() body,
  ) {
    return this.housingService.completeHousingStay(
      req.user.userId,
      bookingId,
      body,
    );
  }

  // ============================================
  // HOUSING COOPERATIVES - Cooperativas
  // ============================================

  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @Post('coops')
  createCoop(@Request() req, @Body() body) {
    return this.housingService.createCoop(req.user.userId, body);
  }

  @Get('coops')
  findCoops(
    @Query('type') type?: string,
    @Query('phase') phase?: string,
    @Query('openToMembers') openToMembers?: string,
  ) {
    return this.housingService.findCoops({ type, phase, openToMembers });
  }

  @Get('coops/:id')
  findCoopById(@Param('id') id: string) {
    return this.housingService.findCoopById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('coops/:id/join')
  joinCoop(@Request() req, @Param('id') id: string, @Body() body) {
    return this.housingService.joinCoop(req.user.userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('coops/proposals/:proposalId/vote')
  voteCoopProposal(
    @Request() req,
    @Param('proposalId') proposalId: string,
    @Body() body,
  ) {
    return this.housingService.voteCoopProposal(req.user.userId, proposalId, {
      points: body.points,
      decision: body.decision,
      reason: body.reason,
    });
  }

  // ============================================
  // COMMUNITY GUARANTEE - Garantía Comunitaria
  // ============================================

  @UseGuards(JwtAuthGuard)
  @Post('guarantee/request')
  requestGuarantee(@Request() req, @Body() body) {
    return this.housingService.requestGuarantee(req.user.userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('guarantee/:guaranteeId/support')
  supportGuarantee(
    @Request() req,
    @Param('guaranteeId') guaranteeId: string,
    @Body() body,
  ) {
    return this.housingService.supportGuarantee(req.user.userId, guaranteeId, {
      months: body.months,
      amount: body.amount,
    });
  }

  // ============================================
  // USER DASHBOARD
  // ============================================

  @UseGuards(JwtAuthGuard)
  @Get('my-bookings')
  getMyBookings(@Request() req) {
    return this.housingService.getMyBookings(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my-offerings')
  getMyOfferings(@Request() req) {
    return this.housingService.getMyOfferings(req.user.userId);
  }
}
