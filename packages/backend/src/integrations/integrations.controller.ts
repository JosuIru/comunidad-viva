import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private integrationsService: IntegrationsService) {}

  @ApiOperation({ summary: 'Create new integration' })
  @ApiResponse({
    status: 201,
    description: 'Integration created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid bot token or data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Request() req,
    @Body() createIntegrationDto: CreateIntegrationDto,
  ) {
    return this.integrationsService.create(createIntegrationDto);
  }

  @ApiOperation({ summary: 'Get all integrations for a community' })
  @ApiResponse({
    status: 200,
    description: 'Returns all integrations for the community',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiParam({
    name: 'communityId',
    description: 'Community ID',
    type: String,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('community/:communityId')
  async findByCommunity(@Param('communityId') communityId: string) {
    return this.integrationsService.findByCommunity(communityId);
  }

  @ApiOperation({ summary: 'Get integration by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns integration details',
  })
  @ApiResponse({
    status: 404,
    description: 'Integration not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    type: String,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.integrationsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update integration' })
  @ApiResponse({
    status: 200,
    description: 'Integration updated successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Integration not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    type: String,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateIntegrationDto: UpdateIntegrationDto,
  ) {
    return this.integrationsService.update(id, updateIntegrationDto);
  }

  @ApiOperation({ summary: 'Delete integration' })
  @ApiResponse({
    status: 200,
    description: 'Integration deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Integration not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    type: String,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.integrationsService.delete(id);
  }

  @ApiOperation({ summary: 'Test integration by sending a test message' })
  @ApiResponse({
    status: 200,
    description: 'Test message sent successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Integration not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Failed to send test message',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    type: String,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/test')
  async test(@Param('id') id: string) {
    return this.integrationsService.test(id);
  }

  @ApiOperation({ summary: 'Toggle integration enabled status' })
  @ApiResponse({
    status: 200,
    description: 'Integration status toggled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Integration not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiParam({
    name: 'id',
    description: 'Integration ID',
    type: String,
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/toggle')
  async toggle(@Param('id') id: string) {
    return this.integrationsService.toggle(id);
  }

  @ApiOperation({ summary: 'Publish content to integrations' })
  @ApiResponse({
    status: 200,
    description: 'Content queued for publishing',
  })
  @ApiResponse({
    status: 404,
    description: 'Content not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('publish/:contentType/:contentId')
  async publish(
    @Param('contentType') contentType: 'offer' | 'event' | 'need',
    @Param('contentId') contentId: string,
  ) {
    return this.integrationsService.publishContent(contentType, contentId);
  }
}
