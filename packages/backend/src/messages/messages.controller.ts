import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { SendMessageDto } from './dto/send-message.dto';

@ApiTags('messages')
@Controller('messages')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @ApiOperation({ summary: 'Get all conversations' })
  @ApiResponse({ status: 200, description: 'Returns all conversations for the current user' })
  @Get('conversations')
  async getConversations(@Request() req) {
    return this.messagesService.getConversations(req.User.userId);
  }

  @ApiOperation({ summary: 'Get messages with a specific user' })
  @ApiResponse({ status: 200, description: 'Returns messages between users' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Get(':userId')
  async getMessages(@Request() req, @Param('userId') userId: string) {
    return this.messagesService.getMessages(req.User.userId, userId);
  }

  @ApiOperation({ summary: 'Send a message to a user' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Post(':userId')
  async sendMessage(
    @Request() req,
    @Param('userId') userId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    return this.messagesService.sendMessage(req.User.userId, userId, sendMessageDto);
  }

  @ApiOperation({ summary: 'Mark message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @Patch(':messageId/read')
  async markAsRead(@Request() req, @Param('messageId') messageId: string) {
    return this.messagesService.markAsRead(messageId, req.User.userId);
  }
}
