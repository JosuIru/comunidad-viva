import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostType, Visibility, ReactionType } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPostDto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        id: randomUUID(),
        ...createPostDto,
        authorId: userId,
        visibility: createPostDto.visibility || Visibility.PUBLIC,
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

  async findAll(
    filters?: {
      type?: PostType;
      visibility?: Visibility;
      limit?: number;
      offset?: number;
    },
    currentUserId?: string,
  ) {
    const limit = filters?.limit || 20;
    const offset = filters?.offset || 0;

    const posts = await this.prisma.post.findMany({
      where: {
        ...(filters?.type && { type: filters.type }),
        ...(filters?.visibility && { visibility: filters.visibility }),
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        Reaction: currentUserId
          ? {
              where: {
                userId: currentUserId,
              },
              select: {
                type: true,
              },
            }
          : false,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Transform posts to include userReaction
    return posts.map((post) => {
      const { Reaction, ...postData } = post;
      return {
        ...postData,
        userReaction: Reaction && Reaction.length > 0 ? Reaction[0].type : null,
      };
    });
  }

  async findOne(id: string, currentUserId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        Reaction: currentUserId
          ? {
              where: {
                userId: currentUserId,
              },
              select: {
                type: true,
              },
            }
          : false,
        Comment: {
          take: 5,
          orderBy: {
            createdAt: 'desc',
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
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const { Reaction, ...postData } = post;
    return {
      ...postData,
      userReaction: Reaction && Reaction.length > 0 ? Reaction[0].type : null,
    };
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostDto) {
    // Check if post exists and belongs to user
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new UnauthorizedException('You can only update your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: {
        ...updatePostDto,
        editedAt: new Date(),
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

  async delete(id: string, userId: string) {
    // Check if post exists and belongs to user
    const post = await this.prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new UnauthorizedException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id },
    });

    return { message: 'Post deleted successfully' };
  }

  async toggleReaction(postId: string, userId: string, reactionType: ReactionType) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if reaction already exists
    const existingReaction = await this.prisma.reaction.findFirst({
      where: {
        postId,
        userId,
        type: reactionType,
      },
    });

    if (existingReaction) {
      // Remove reaction and decrement count
      await this.prisma.reaction.delete({
        where: { id: existingReaction.id },
      });

      // Decrement the appropriate count
      const countField = this.getCountFieldForReactionType(reactionType);
      await this.prisma.post.update({
        where: { id: postId },
        data: {
          [countField]: {
            decrement: 1,
          },
        },
      });
    } else {
      // Create reaction and increment count
      await this.prisma.reaction.create({
        data: {
          id: randomUUID(),
          postId,
          userId,
          type: reactionType,
        },
      });

      // Increment the appropriate count
      const countField = this.getCountFieldForReactionType(reactionType);
      await this.prisma.post.update({
        where: { id: postId },
        data: {
          [countField]: {
            increment: 1,
          },
        },
      });
    }

    // Return updated post with counts
    return this.findOne(postId, userId);
  }

  async share(postId: string) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Increment share count
    return this.prisma.post.update({
      where: { id: postId },
      data: {
        sharesCount: {
          increment: 1,
        },
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

  private getCountFieldForReactionType(reactionType: ReactionType): string {
    switch (reactionType) {
      case ReactionType.THANKS:
        return 'thanksCount';
      case ReactionType.SUPPORT:
        return 'supportsCount';
      case ReactionType.HELPED:
        return 'helpedCount';
      case ReactionType.CELEBRATE:
        return 'supportsCount'; // Use supportsCount for celebrate
      default:
        throw new Error(`Unknown reaction type: ${reactionType}`);
    }
  }
}
