import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Put,
  Delete,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { PostType } from '@prisma/client';

@ApiTags('social')
@Controller('social')
export class SocialController {
  constructor(private socialService: SocialService) {}

  @ApiOperation({ summary: 'Get user feed' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'cursor', required: false, type: String })
  @ApiQuery({ name: 'type', required: false, enum: PostType })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('feed')
  async getFeed(
    @Request() req,
    @Query('limit') limitStr?: string,
    @Query('cursor') cursor?: string,
    @Query('type') type?: PostType
  ) {
    const limit = limitStr ? parseInt(limitStr, 10) : undefined;
    return this.socialService.getFeed(req.User.userId, { limit, cursor, type });
  }

  @ApiOperation({ summary: 'Create post' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('posts')
  async createPost(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.socialService.createPost(req.User.userId, createPostDto);
  }

  @ApiOperation({ summary: 'Get single post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @Get('posts/:id')
  async getPost(@Param('id') id: string, @Request() req) {
    const userId = req.user?.userId;
    return this.socialService.getPost(id, userId);
  }

  @ApiOperation({ summary: 'Update post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put('posts/:id')
  async updatePost(
    @Param('id') id: string,
    @Request() req,
    @Body() updatePostDto: UpdatePostDto
  ) {
    return this.socialService.updatePost(id, req.User.userId, updatePostDto);
  }

  @ApiOperation({ summary: 'Delete post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePost(@Param('id') id: string, @Request() req) {
    return this.socialService.deletePost(id, req.User.userId);
  }

  @ApiOperation({ summary: 'Get user posts' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('users/:userId/posts')
  async getUserPosts(
    @Param('userId') userId: string,
    @Query('limit') limit?: number
  ) {
    return this.socialService.getUserPosts(userId, limit);
  }

  @ApiOperation({ summary: 'Add comment to post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/comments')
  async addComment(
    @Param('id') postId: string,
    @Request() req,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.socialService.addComment(postId, req.User.userId, createCommentDto);
  }

  @ApiOperation({ summary: 'Delete comment' })
  @ApiParam({ name: 'commentId', description: 'Comment ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  @HttpCode(HttpStatus.OK)
  async deleteComment(@Param('commentId') commentId: string, @Request() req) {
    return this.socialService.deleteComment(commentId, req.User.userId);
  }

  @ApiOperation({ summary: 'Add or update reaction to post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('posts/:id/reactions')
  async addReaction(
    @Param('id') postId: string,
    @Request() req,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    return this.socialService.addReaction(postId, req.User.userId, createReactionDto);
  }

  @ApiOperation({ summary: 'Remove reaction from post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id/reactions')
  @HttpCode(HttpStatus.OK)
  async removeReaction(@Param('id') postId: string, @Request() req) {
    return this.socialService.removeReaction(postId, req.User.userId);
  }

  @ApiOperation({ summary: 'Search posts by hashtag' })
  @ApiParam({ name: 'tag', description: 'Hashtag to search (without #)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('hashtags/:tag')
  async getPostsByHashtag(
    @Param('tag') tag: string,
    @Query('limit') limit?: number,
    @Request() req?: any
  ) {
    const userId = req?.user?.userId;
    return this.socialService.getPostsByHashtag(tag, userId, limit);
  }

  @ApiOperation({ summary: 'Get trending hashtags' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get('hashtags')
  async getTrendingHashtags(@Query('limit') limit?: number) {
    return this.socialService.getTrendingHashtags(limit);
  }

  @ApiOperation({ summary: 'Get posts where user is mentioned' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('mentions')
  async getMentions(@Request() req, @Query('limit') limit?: number) {
    return this.socialService.getMentions(req.User.userId, limit);
  }
}
