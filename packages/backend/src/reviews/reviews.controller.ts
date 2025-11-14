import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new review' })
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.User.userId, createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews with optional filters' })
  @ApiQuery({ name: 'reviewType', required: false })
  @ApiQuery({ name: 'reviewedEntityId', required: false })
  @ApiQuery({ name: 'reviewerId', required: false })
  findAll(
    @Query('reviewType') reviewType?: string,
    @Query('reviewedEntityId') reviewedEntityId?: string,
    @Query('reviewerId') reviewerId?: string,
  ) {
    return this.reviewsService.findAll({
      reviewType,
      reviewedEntityId,
      reviewerId,
    });
  }

  @Get('entity/:type/:id')
  @ApiOperation({ summary: 'Get reviews and stats for a specific entity' })
  @ApiParam({ name: 'type', description: 'Entity type (offer, user, event)' })
  @ApiParam({ name: 'id', description: 'Entity ID' })
  getReviewsByEntity(@Param('type') type: string, @Param('id') id: string) {
    return this.reviewsService.getReviewsByEntity(type, id);
  }

  @Get('entity/:type/:id/average')
  @ApiOperation({ summary: 'Get average rating for a specific entity' })
  @ApiParam({ name: 'type', description: 'Entity type (offer, user, event)' })
  @ApiParam({ name: 'id', description: 'Entity ID' })
  getAverageRating(@Param('type') type: string, @Param('id') id: string) {
    return this.reviewsService.getAverageRating(type, id);
  }

  @Get('reviewer/:id')
  @ApiOperation({ summary: 'Get all reviews by a specific reviewer' })
  @ApiParam({ name: 'id', description: 'Reviewer ID' })
  getReviewsByReviewer(@Param('id') id: string) {
    return this.reviewsService.getReviewsByReviewer(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific review' })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a review' })
  update(
    @Param('id') id: string,
    @Request() req,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, req.User.userId, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  remove(@Param('id') id: string, @Request() req) {
    return this.reviewsService.remove(id, req.User.userId);
  }
}
