import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PostType, Visibility, ReactionType } from '@prisma/client';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { AchievementsService } from '../achievements/achievements.service';

@Injectable()
export class SocialService {
  constructor(
    private prisma: PrismaService,
    private achievementsService: AchievementsService,
  ) {}

  // Extract hashtags from content
  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
  }

  // Extract mentions from content
  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    return matches ? matches.map(mention => mention.slice(1).toLowerCase()) : [];
  }

  async createPost(authorId: string, createPostDto: CreatePostDto) {
    // Parse location if provided
    let lat: number | undefined;
    let lng: number | undefined;
    if (createPostDto.location) {
      const [latStr, lngStr] = createPostDto.location.split(',');
      lat = parseFloat(latStr);
      lng = parseFloat(lngStr);
    }

    // Extract hashtags and mentions from content
    const autoHashtags = this.extractHashtags(createPostDto.content);
    const autoMentions = this.extractMentions(createPostDto.content);

    // Merge with manually provided tags
    const allTags = [...new Set([...(createPostDto.tags || []), ...autoHashtags])];

    const post = await this.prisma.post.create({
      data: {
        content: createPostDto.content,
        type: createPostDto.type || PostType.STORY,
        images: createPostDto.media || [],
        lat,
        lng,
        visibility: createPostDto.visibility || Visibility.PUBLIC,
        relatedOfferId: createPostDto.relatedOfferId,
        tags: allTags,
        mentions: autoMentions,
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Check achievements for post creation
    this.achievementsService.checkAchievements(authorId).catch(err => {
      console.error('Error checking achievements after post creation:', err);
    });

    return post;
  }

  async getFeed(userId: string, params?: { limit?: number; cursor?: string; type?: PostType }) {
    const { limit = 50, cursor, type } = params || {};

    const where: any = {
      OR: [
        { visibility: Visibility.PUBLIC },
        { authorId: userId },
      ],
    };

    if (type) {
      where.type = type;
    }

    const posts = await this.prisma.post.findMany({
      where,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          include: {
            author: {
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
          take: 3,
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Add userReaction to each post
    const postsWithUserReaction = posts.map(post => {
      const userReaction = post.reactions.find(r => r.userId === userId);
      return {
        ...post,
        userReaction: userReaction?.type,
      };
    });

    return {
      data: postsWithUserReaction,
      hasMore: posts.length === limit,
    };
  }

  async getPost(id: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
          include: {
            author: {
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
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check visibility
    if (post.visibility !== Visibility.PUBLIC && post.authorId !== userId) {
      throw new ForbiddenException('You do not have access to this post');
    }

    return post;
  }

  async updatePost(id: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async deletePost(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    // Delete related data
    await this.prisma.reaction.deleteMany({ where: { postId: id } });
    await this.prisma.comment.deleteMany({ where: { postId: id } });

    return this.prisma.post.delete({ where: { id } });
  }

  async addComment(postId: string, authorId: string, createCommentDto: CreateCommentDto) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        postId,
        authorId,
        content: createCommentDto.content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Increment comment count
    await this.prisma.post.update({
      where: { id: postId },
      data: {
        commentsCount: {
          increment: 1,
        },
      },
    });

    // Check achievements for comment creation
    this.achievementsService.checkAchievements(authorId).catch(err => {
      console.error('Error checking achievements after comment creation:', err);
    });

    return comment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    await this.prisma.comment.delete({ where: { id: commentId } });

    // Decrement comment count
    await this.prisma.post.update({
      where: { id: comment.postId },
      data: {
        commentsCount: {
          decrement: 1,
        },
      },
    });

    return { message: 'Comment deleted successfully' };
  }

  async addReaction(postId: string, userId: string, createReactionDto: CreateReactionDto) {
    // Check if post exists
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // Check if user already reacted
    const existingReaction = await this.prisma.reaction.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (existingReaction) {
      // Update reaction type
      return this.prisma.reaction.update({
        where: { id: existingReaction.id },
        data: { type: createReactionDto.type },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
    }

    // Create new reaction
    const reaction = await this.prisma.reaction.create({
      data: {
        postId,
        userId,
        type: createReactionDto.type,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Increment appropriate count based on reaction type
    const updateData: any = {};
    switch (createReactionDto.type) {
      case 'THANKS':
        updateData.thanksCount = { increment: 1 };
        break;
      case 'SUPPORT':
        updateData.supportsCount = { increment: 1 };
        break;
      case 'HELPED':
        updateData.helpedCount = { increment: 1 };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.post.update({
        where: { id: postId },
        data: updateData,
      });
    }

    // Check achievements for post author (received reaction) and reactor
    this.achievementsService.checkAchievements(post.authorId).catch(err => {
      console.error('Error checking achievements for post author:', err);
    });
    this.achievementsService.checkAchievements(userId).catch(err => {
      console.error('Error checking achievements for reactor:', err);
    });

    return reaction;
  }

  async removeReaction(postId: string, userId: string) {
    const reaction = await this.prisma.reaction.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!reaction) {
      throw new NotFoundException('Reaction not found');
    }

    await this.prisma.reaction.delete({ where: { id: reaction.id } });

    // Decrement appropriate count based on reaction type
    const updateData: any = {};
    switch (reaction.type) {
      case 'THANKS':
        updateData.thanksCount = { decrement: 1 };
        break;
      case 'SUPPORT':
        updateData.supportsCount = { decrement: 1 };
        break;
      case 'HELPED':
        updateData.helpedCount = { decrement: 1 };
        break;
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.post.update({
        where: { id: postId },
        data: updateData,
      });
    }

    return { message: 'Reaction removed successfully' };
  }

  async getUserPosts(userId: string, limit = 50) {
    return this.prisma.post.findMany({
      where: { authorId: userId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async getPostsByHashtag(tag: string, userId?: string, limit = 50) {
    const normalizedTag = tag.toLowerCase();

    const posts = await this.prisma.post.findMany({
      where: {
        tags: {
          has: normalizedTag,
        },
        visibility: Visibility.PUBLIC,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Add userReaction if userId provided
    if (userId) {
      return posts.map(post => {
        const userReaction = post.reactions.find(r => r.userId === userId);
        return {
          ...post,
          userReaction: userReaction?.type,
        };
      });
    }

    return posts;
  }

  async getTrendingHashtags(limit = 10) {
    // Get all posts from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentPosts = await this.prisma.post.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
        visibility: Visibility.PUBLIC,
      },
      select: {
        tags: true,
      },
    });

    // Count hashtag occurrences
    const tagCounts: Record<string, number> = {};
    recentPosts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort and return top tags
    const trending = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));

    return { trending };
  }

  async getMentions(userId: string, limit = 50) {
    // First get the user to get their name/username
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Extract username from name or email
    const username = user.name.toLowerCase().replace(/\s+/g, '');

    const posts = await this.prisma.post.findMany({
      where: {
        mentions: {
          has: username,
        },
        visibility: Visibility.PUBLIC,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Add userReaction
    const postsWithUserReaction = posts.map(post => {
      const userReaction = post.reactions.find(r => r.userId === userId);
      return {
        ...post,
        userReaction: userReaction?.type,
      };
    });

    return { posts: postsWithUserReaction, count: postsWithUserReaction.length };
  }
}
