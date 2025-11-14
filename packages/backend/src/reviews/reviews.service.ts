import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(reviewerId: string, createReviewDto: CreateReviewDto) {
    const { reviewType, reviewedEntityId, rating, comment, transactionId } = createReviewDto;

    // Convert string to enum
    const reviewTypeEnum = reviewType.toUpperCase() as ReviewType;

    // Verify the reviewer is not reviewing themselves
    if (reviewType === 'user' && reviewerId === reviewedEntityId) {
      throw new BadRequestException('You cannot review yourself');
    }

    // Check if review already exists for this combination
    const existingReview = await this.prisma.review.findFirst({
      where: {
        reviewerId,
        reviewType: reviewTypeEnum,
        reviewedEntityId,
        ...(transactionId && { transactionId }),
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this entity');
    }

    return this.prisma.review.create({
      data: {
        id: uuidv4(),
        reviewerId,
        reviewType: reviewTypeEnum,
        reviewedEntityId,
        rating,
        comment,
        transactionId,
        updatedAt: new Date(),
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async findAll(params?: {
    reviewType?: string;
    reviewedEntityId?: string;
    reviewerId?: string;
  }) {
    const where: any = {};

    if (params?.reviewType) where.reviewType = params.reviewType.toUpperCase() as ReviewType;
    if (params?.reviewedEntityId) where.reviewedEntityId = params.reviewedEntityId;
    if (params?.reviewerId) where.reviewerId = params.reviewerId;

    return this.prisma.review.findMany({
      where,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async update(id: string, reviewerId: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.reviewerId !== reviewerId) {
      throw new BadRequestException('You can only update your own reviews');
    }

    const updateData: any = {};
    if (updateReviewDto.rating !== undefined) updateData.rating = updateReviewDto.rating;
    if (updateReviewDto.comment !== undefined) updateData.comment = updateReviewDto.comment;

    return this.prisma.review.update({
      where: { id },
      data: updateData,
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async remove(id: string, reviewerId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    if (review.reviewerId !== reviewerId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    return this.prisma.review.delete({
      where: { id },
    });
  }

  async getAverageRating(reviewType: string, entityId: string) {
    const reviewTypeEnum = reviewType.toUpperCase() as ReviewType;

    const result = await this.prisma.review.aggregate({
      where: {
        reviewType: reviewTypeEnum,
        reviewedEntityId: entityId,
      },
      _avg: {
        rating: true,
      },
      _count: {
        _all: true,
      },
    });

    return {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count._all,
    };
  }

  async getReviewsByEntity(reviewType: string, entityId: string) {
    const reviews = await this.findAll({ reviewType, reviewedEntityId: entityId });
    const stats = await this.getAverageRating(reviewType, entityId);

    return {
      reviews,
      stats,
    };
  }

  async getReviewsByReviewer(reviewerId: string) {
    return this.findAll({ reviewerId });
  }
}
