import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MutualAidService } from './mutual-aid.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('mutual-aid')
export class MutualAidController {
  constructor(private readonly mutualAidService: MutualAidService) {}

  // ============================================
  // NEEDS - Necesidades
  // ============================================

  @UseGuards(JwtAuthGuard)
  @Post('needs')
  createNeed(@Request() req, @Body() body) {
    return this.mutualAidService.createNeed(req.user.userId, body);
  }

  @Get('needs')
  findNeeds(
    @Query('scope') scope?: string,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('communityId') communityId?: string,
    @Query('country') country?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('minUrgency') minUrgency?: string,
    @Query('resourceType') resourceType?: string,
    @Query('verified') verified?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mutualAidService.findNeeds({
      scope,
      category,
      type,
      status,
      communityId,
      country,
      lat,
      lng,
      radiusKm,
      minUrgency,
      resourceType,
      verified,
      limit,
    });
  }

  @Get('needs/:id')
  findNeedById(@Param('id') id: string) {
    return this.mutualAidService.findNeedById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('needs/:id/contribute')
  contributeToNeed(@Request() req, @Param('id') id: string, @Body() body) {
    return this.mutualAidService.contributeToNeed(req.user.userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Put('needs/:id')
  updateNeed(@Request() req, @Param('id') id: string, @Body() body) {
    return this.mutualAidService.updateNeed(req.user.userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('needs/:id/close')
  closeNeed(@Request() req, @Param('id') id: string) {
    return this.mutualAidService.closeNeed(req.user.userId, id);
  }

  // ============================================
  // COMMUNITY PROJECTS - Proyectos Comunitarios
  // ============================================

  @UseGuards(JwtAuthGuard)
  @Post('projects')
  createProject(@Request() req, @Body() body) {
    return this.mutualAidService.createProject(req.user.userId, body);
  }

  @Get('projects')
  findProjects(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('country') country?: string,
    @Query('region') region?: string,
    @Query('communityId') communityId?: string,
    @Query('tag') tag?: string,
    @Query('sdg') sdg?: string,
    @Query('verified') verified?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radiusKm') radiusKm?: string,
    @Query('limit') limit?: string,
  ) {
    return this.mutualAidService.findProjects({
      type,
      status,
      country,
      region,
      communityId,
      tag,
      sdg,
      verified,
      lat,
      lng,
      radiusKm,
      limit,
    });
  }

  @Get('projects/:id')
  findProjectById(@Param('id') id: string) {
    return this.mutualAidService.findProjectById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('projects/:id/contribute')
  contributeToProject(
    @Request() req,
    @Param('id') id: string,
    @Body() body,
  ) {
    return this.mutualAidService.contributeToProject(
      req.user.userId,
      id,
      body,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('projects/:id/phases')
  addProjectPhase(@Request() req, @Param('id') id: string, @Body() body) {
    return this.mutualAidService.addProjectPhase(req.user.userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('projects/:id/updates')
  addProjectUpdate(@Request() req, @Param('id') id: string, @Body() body) {
    return this.mutualAidService.addProjectUpdate(req.user.userId, id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('projects/:id/impact-reports')
  createImpactReport(@Request() req, @Param('id') id: string, @Body() body) {
    return this.mutualAidService.createImpactReport(req.user.userId, id, body);
  }

  // ============================================
  // CONTRIBUTIONS - Gestión de Contribuciones
  // ============================================

  @UseGuards(JwtAuthGuard)
  @Post('contributions/:id/validate')
  validateContribution(@Request() req, @Param('id') id: string) {
    return this.mutualAidService.validateContribution(req.user.userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('contributions/:id/cancel')
  cancelContribution(@Request() req, @Param('id') id: string) {
    return this.mutualAidService.cancelContribution(req.user.userId, id);
  }

  // ============================================
  // DASHBOARD - Panel de Usuario
  // ============================================

  @UseGuards(JwtAuthGuard)
  @Get('my/contributions')
  getMyContributions(@Request() req) {
    return this.mutualAidService.getMyContributions(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/needs')
  getMyNeeds(@Request() req) {
    return this.mutualAidService.getMyNeeds(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/projects')
  getMyProjects(@Request() req) {
    return this.mutualAidService.getMyProjects(req.user.userId);
  }
}
