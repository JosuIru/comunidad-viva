import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma/prisma.service';
import { PostType, Visibility, ReactionType } from '@prisma/client';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

describe('PostsService', () => {
  let service: PostsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    post: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    reaction: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a post', async () => {
      const userId = 'user-id';
      const createPostDto = {
        content: 'Test post content',
        type: PostType.STORY,
        visibility: Visibility.PUBLIC,
      };

      const mockPost = {
        id: 'post-id',
        authorId: userId,
        ...createPostDto,
        createdAt: new Date(),
        author: {
          id: userId,
          name: 'Test User',
          avatar: null,
        },
      };

      mockPrismaService.post.create.mockResolvedValue(mockPost);

      const result = await service.create(userId, createPostDto);

      expect(result).toEqual(mockPost);
      expect(mockPrismaService.post.create).toHaveBeenCalledWith({
        data: {
          ...createPostDto,
          authorId: userId,
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
        },
      });
    });

    it('should default to PUBLIC visibility if not specified', async () => {
      const userId = 'user-id';
      const createPostDto = {
        content: 'Test post',
        type: PostType.STORY,
      };

      mockPrismaService.post.create.mockResolvedValue({});

      await service.create(userId, createPostDto as any);

      expect(mockPrismaService.post.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            visibility: Visibility.PUBLIC,
          }),
        }),
      );
    });
  });

  describe('findAll', () => {
    it('should return all posts with default pagination', async () => {
      const mockPosts = [
        {
          id: 'post-1',
          content: 'Post 1',
          author: { id: 'user-1', name: 'User 1', avatar: null },
          reactions: [],
        },
        {
          id: 'post-2',
          content: 'Post 2',
          author: { id: 'user-2', name: 'User 2', avatar: null },
          reactions: [],
        },
      ];

      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].userReaction).toBeNull();
      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
        take: 20,
        skip: 0,
      });
    });

    it('should filter posts by type', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([]);

      await service.findAll({ type: PostType.NEED });

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: PostType.NEED,
          }),
        }),
      );
    });

    it('should filter posts by visibility', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([]);

      await service.findAll({ visibility: Visibility.NEIGHBORS });

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            visibility: Visibility.NEIGHBORS,
          }),
        }),
      );
    });

    it('should include user reaction when currentUserId provided', async () => {
      const currentUserId = 'current-user-id';
      const mockPosts = [
        {
          id: 'post-1',
          content: 'Post 1',
          author: { id: 'user-1', name: 'User 1' },
          reactions: [{ type: ReactionType.THANKS }],
        },
      ];

      mockPrismaService.post.findMany.mockResolvedValue(mockPosts);

      const result = await service.findAll({}, currentUserId);

      expect(result[0].userReaction).toBe(ReactionType.THANKS);
    });

    it('should respect limit and offset', async () => {
      mockPrismaService.post.findMany.mockResolvedValue([]);

      await service.findAll({ limit: 10, offset: 5 });

      expect(mockPrismaService.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          skip: 5,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a single post with comments', async () => {
      const postId = 'post-id';
      const mockPost = {
        id: postId,
        content: 'Test post',
        User: { id: 'user-id', name: 'User', avatar: null },
        Reaction: [],
        Comment: [
          {
            id: 'comment-1',
            content: 'Comment 1',
            User: { id: 'commenter-1', name: 'Commenter 1', avatar: null },
          },
        ],
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      const result = await service.findOne(postId);

      expect(result).toBeDefined();
      expect(result.Comment).toHaveLength(1);
      expect(result.userReaction).toBeNull();
    });

    it('should throw NotFoundException if post not found', async () => {
      const postId = 'non-existent-id';

      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.findOne(postId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(postId)).rejects.toThrow('Post not found');
    });

    it('should include user reaction when currentUserId provided', async () => {
      const postId = 'post-id';
      const currentUserId = 'user-id';

      const mockPost = {
        id: postId,
        content: 'Test post',
        author: { id: 'author-id', name: 'Author' },
        reactions: [{ type: ReactionType.SUPPORT }],
        comments: [],
      };

      mockPrismaService.post.findUnique.mockResolvedValue(mockPost);

      const result = await service.findOne(postId, currentUserId);

      expect(result.userReaction).toBe(ReactionType.SUPPORT);
    });
  });

  describe('update', () => {
    it('should update a post', async () => {
      const postId = 'post-id';
      const userId = 'user-id';
      const updatePostDto = {
        content: 'Updated content',
      };

      mockPrismaService.post.findUnique.mockResolvedValue({
        id: postId,
        authorId: userId,
      });

      const mockUpdatedPost = {
        id: postId,
        authorId: userId,
        content: 'Updated content',
        editedAt: new Date(),
      };

      mockPrismaService.post.update.mockResolvedValue(mockUpdatedPost);

      const result = await service.update(postId, userId, updatePostDto);

      expect(result).toEqual(mockUpdatedPost);
      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: {
          ...updatePostDto,
          editedAt: expect.any(Date),
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      const postId = 'non-existent-id';
      const userId = 'user-id';

      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.update(postId, userId, {})).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if user is not the author', async () => {
      const postId = 'post-id';
      const userId = 'user-id';
      const otherUserId = 'other-user-id';

      mockPrismaService.post.findUnique.mockResolvedValue({
        id: postId,
        authorId: otherUserId,
      });

      await expect(service.update(postId, userId, {})).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.update(postId, userId, {})).rejects.toThrow(
        'You can only update your own posts',
      );
    });
  });

  describe('delete', () => {
    it('should delete a post', async () => {
      const postId = 'post-id';
      const userId = 'user-id';

      mockPrismaService.post.findUnique.mockResolvedValue({
        id: postId,
        authorId: userId,
      });

      mockPrismaService.post.delete.mockResolvedValue({});

      const result = await service.delete(postId, userId);

      expect(result.message).toBe('Post deleted successfully');
      expect(mockPrismaService.post.delete).toHaveBeenCalledWith({
        where: { id: postId },
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      const postId = 'non-existent-id';
      const userId = 'user-id';

      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.delete(postId, userId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw UnauthorizedException if user is not the author', async () => {
      const postId = 'post-id';
      const userId = 'user-id';
      const otherUserId = 'other-user-id';

      mockPrismaService.post.findUnique.mockResolvedValue({
        id: postId,
        authorId: otherUserId,
      });

      await expect(service.delete(postId, userId)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.delete(postId, userId)).rejects.toThrow(
        'You can only delete your own posts',
      );
    });
  });

  describe('toggleReaction', () => {
    it('should add reaction if not exists', async () => {
      const postId = 'post-id';
      const userId = 'user-id';
      const reactionType = ReactionType.THANKS;

      mockPrismaService.post.findUnique.mockResolvedValue({
        id: postId,
        content: 'Test post',
      });

      mockPrismaService.reaction.findFirst.mockResolvedValue(null);
      mockPrismaService.reaction.create.mockResolvedValue({});
      mockPrismaService.post.update.mockResolvedValue({});

      // Mock findOne for the return
      const mockPost = {
        id: postId,
        content: 'Test post',
        thanksCount: 1,
        author: { id: 'author-id', name: 'Author' },
        reactions: [{ type: ReactionType.THANKS }],
        comments: [],
      };
      mockPrismaService.post.findUnique.mockResolvedValueOnce(mockPost);

      await service.toggleReaction(postId, userId, reactionType);

      expect(mockPrismaService.reaction.create).toHaveBeenCalledWith({
        data: {
          postId,
          userId,
          type: reactionType,
        },
      });

      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: {
          thanksCount: {
            increment: 1,
          },
        },
      });
    });

    it('should remove reaction if already exists', async () => {
      const postId = 'post-id';
      const userId = 'user-id';
      const reactionType = ReactionType.SUPPORT;

      const existingReaction = {
        id: 'reaction-id',
        postId,
        userId,
        type: reactionType,
      };

      mockPrismaService.post.findUnique.mockResolvedValue({
        id: postId,
        content: 'Test post',
      });

      mockPrismaService.reaction.findFirst.mockResolvedValue(existingReaction);
      mockPrismaService.reaction.delete.mockResolvedValue({});
      mockPrismaService.post.update.mockResolvedValue({});

      // Mock findOne for the return
      const mockPost = {
        id: postId,
        content: 'Test post',
        supportsCount: 0,
        author: { id: 'author-id', name: 'Author' },
        reactions: [],
        comments: [],
      };
      mockPrismaService.post.findUnique.mockResolvedValueOnce(mockPost);

      await service.toggleReaction(postId, userId, reactionType);

      expect(mockPrismaService.reaction.delete).toHaveBeenCalledWith({
        where: { id: existingReaction.id },
      });

      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: {
          supportsCount: {
            decrement: 1,
          },
        },
      });
    });

    it('should throw NotFoundException if post not found', async () => {
      const postId = 'non-existent-id';
      const userId = 'user-id';

      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(
        service.toggleReaction(postId, userId, ReactionType.THANKS),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle HELPED reaction correctly', async () => {
      const postId = 'post-id';
      const userId = 'user-id';
      const reactionType = ReactionType.HELPED;

      mockPrismaService.post.findUnique.mockResolvedValue({
        id: postId,
        content: 'Test post',
      });

      mockPrismaService.reaction.findFirst.mockResolvedValue(null);
      mockPrismaService.reaction.create.mockResolvedValue({});
      mockPrismaService.post.update.mockResolvedValue({});

      const mockPost = {
        id: postId,
        content: 'Test post',
        helpedCount: 1,
        author: { id: 'author-id', name: 'Author' },
        reactions: [],
        comments: [],
      };
      mockPrismaService.post.findUnique.mockResolvedValueOnce(mockPost);

      await service.toggleReaction(postId, userId, reactionType);

      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: {
          helpedCount: {
            increment: 1,
          },
        },
      });
    });
  });

  describe('share', () => {
    it('should increment share count', async () => {
      const postId = 'post-id';

      mockPrismaService.post.findUnique.mockResolvedValue({
        id: postId,
        content: 'Test post',
        sharesCount: 5,
      });

      const mockSharedPost = {
        id: postId,
        content: 'Test post',
        sharesCount: 6,
        author: { id: 'author-id', name: 'Author', avatar: null },
      };

      mockPrismaService.post.update.mockResolvedValue(mockSharedPost);

      const result = await service.share(postId);

      expect(result.sharesCount).toBe(6);
      expect(mockPrismaService.post.update).toHaveBeenCalledWith({
        where: { id: postId },
        data: {
          sharesCount: {
            increment: 1,
          },
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
    });

    it('should throw NotFoundException if post not found', async () => {
      const postId = 'non-existent-id';

      mockPrismaService.post.findUnique.mockResolvedValue(null);

      await expect(service.share(postId)).rejects.toThrow(NotFoundException);
      await expect(service.share(postId)).rejects.toThrow('Post not found');
    });
  });
});
