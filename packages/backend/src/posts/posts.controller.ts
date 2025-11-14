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
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { CreateReactionDto } from './dto/create-reaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostType, Visibility } from '@prisma/client';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @ApiOperation({ summary: 'Get feed of posts (paginated)' })
  @ApiResponse({ status: 200, description: 'Returns paginated list of posts' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of posts to return' })
  @ApiQuery({ name: 'offset', required: false, type: Number, description: 'Offset for pagination' })
  @ApiQuery({ name: 'type', required: false, enum: PostType, description: 'Filter by post type' })
  @ApiQuery({ name: 'visibility', required: false, enum: Visibility, description: 'Filter by visibility' })
  async findAll(
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @Query('type') type?: PostType,
    @Query('visibility') visibility?: Visibility,
    @Request() req?: any,
  ) {
    const currentUserId = req?.user?.userId;

    return this.postsService.findAll(
      {
        limit,
        offset,
        type,
        visibility,
      },
      currentUserId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single post by ID' })
  @ApiResponse({ status: 200, description: 'Returns post details' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async findOne(@Param('id') id: string, @Request() req?: any) {
    const currentUserId = req?.user?.userId;
    return this.postsService.findOne(id, currentUserId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Request() req, @Body() createPostDto: CreatePostDto) {
    return this.postsService.create(req.User.userId, createPostDto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async update(
    @Param('id') id: string,
    @Request() req,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.update(id, req.User.userId, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async delete(@Param('id') id: string, @Request() req) {
    return this.postsService.delete(id, req.User.userId);
  }

  @Post(':id/react')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add or toggle a reaction on a post' })
  @ApiResponse({ status: 200, description: 'Reaction toggled successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async react(
    @Param('id') id: string,
    @Request() req,
    @Body() createReactionDto: CreateReactionDto,
  ) {
    return this.postsService.toggleReaction(id, req.User.userId, createReactionDto.type);
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Increment share count for a post' })
  @ApiResponse({ status: 200, description: 'Share count incremented successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  async share(@Param('id') id: string) {
    return this.postsService.share(id);
  }
}
