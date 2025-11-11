import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Guard to verify resource ownership
 * Use @CheckOwnership('resourceType') decorator
 *
 * Supported resources: offer, event, post, comment, proposal, housingListing, mutualAidNeed, mutualAidProject
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const resourceType = this.reflector.get<string>('resourceType', context.getHandler());

    if (!resourceType) {
      return true; // No ownership check required
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const resourceId = request.params.id;

    if (!user || !user.userId) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!resourceId) {
      throw new ForbiddenException('ID de recurso no proporcionado');
    }

    // Check ownership based on resource type
    const isOwner = await this.checkOwnership(resourceType, resourceId, user.userId, user.role);

    if (!isOwner) {
      throw new ForbiddenException('No tienes permisos para modificar este recurso');
    }

    return true;
  }

  private async checkOwnership(
    resourceType: string,
    resourceId: string,
    userId: string,
    userRole: string
  ): Promise<boolean> {
    // Admins bypass ownership checks
    if (userRole === 'ADMIN') {
      return true;
    }

    try {
      switch (resourceType) {
        case 'offer':
          const offer = await this.prisma.offer.findUnique({
            where: { id: resourceId },
            select: { userId: true }
          });
          if (!offer) throw new NotFoundException('Oferta no encontrada');
          return offer.userId === userId;

        case 'event':
          const event = await this.prisma.event.findUnique({
            where: { id: resourceId },
            select: { organizerId: true }
          });
          if (!event) throw new NotFoundException('Evento no encontrado');
          return event.organizerId === userId;

        case 'post':
          const post = await this.prisma.post.findUnique({
            where: { id: resourceId },
            select: { authorId: true }
          });
          if (!post) throw new NotFoundException('Post no encontrado');
          return post.authorId === userId;

        case 'comment':
          const comment = await this.prisma.comment.findUnique({
            where: { id: resourceId },
            select: { authorId: true }
          });
          if (!comment) throw new NotFoundException('Comentario no encontrado');
          return comment.authorId === userId;

        case 'proposal':
          const proposal = await this.prisma.proposal.findUnique({
            where: { id: resourceId },
            select: { authorId: true }
          });
          if (!proposal) throw new NotFoundException('Propuesta no encontrada');
          return proposal.authorId === userId;

        case 'housingListing':
          const housing = await this.prisma.temporaryHousing.findUnique({
            where: { id: resourceId },
            select: { hostId: true }
          });
          if (!housing) throw new NotFoundException('Anuncio de vivienda no encontrado');
          return housing.hostId === userId;

        case 'mutualAidNeed':
          const need = await this.prisma.need.findUnique({
            where: { id: resourceId },
            select: { creatorId: true }
          });
          if (!need) throw new NotFoundException('Necesidad no encontrada');
          // Puede ser null si es una necesidad comunitaria
          return need.creatorId === userId;

        case 'mutualAidProject':
          const project = await this.prisma.communityProject.findUnique({
            where: { id: resourceId },
            select: { creatorId: true }
          });
          if (!project) throw new NotFoundException('Proyecto no encontrado');
          return project.creatorId === userId;

        default:
          throw new Error(`Tipo de recurso no soportado: ${resourceType}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      // Error checking ownership - return false for safety
      return false;
    }
  }
}
