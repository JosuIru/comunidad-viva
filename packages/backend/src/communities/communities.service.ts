import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CommunityVisibility } from '@prisma/client';
import { AchievementsService } from '../achievements/achievements.service';
import { CommunityPacksService } from '../community-packs/community-packs.service';

@Injectable()
export class CommunitiesService {
  private readonly logger = new Logger(CommunitiesService.name);

  constructor(
    private prisma: PrismaService,
    private achievementsService: AchievementsService,
    private communityPacksService: CommunityPacksService,
  ) {}

  async create(userId: string, createCommunityDto: CreateCommunityDto) {
    // Crear comunidad con gobernanza descentralizada
    // El creador es solo un fundador inicial, sin privilegios permanentes
    const bootstrapEndDate = new Date();
    bootstrapEndDate.setDate(bootstrapEndDate.getDate() + 30); // 30 días de bootstrap

    // Extract onboarding pack data before creating community
    const { onboardingPack, ...communityData } = createCommunityDto;

    const community = await this.prisma.community.create({
      data: {
        ...communityData,
        governance: {
          create: {
            founders: [userId],
            bootstrapEndDate,
            // Valores por defecto están en el schema
          },
        },
      },
      include: {
        governance: true,
      },
    });

    // Assign the creator as the first member with community relationship
    await this.prisma.user.update({
      where: { id: userId },
      data: { communityId: community.id },
    });

    // Create onboarding pack if provided
    if (onboardingPack) {
      try {
        await this.communityPacksService.createPack(
          community.id,
          {
            packType: onboardingPack.type,
            customConfig: onboardingPack.setupData || {},
          },
          userId,
        );
        this.logger.log(`Created onboarding pack ${onboardingPack.type} for community ${community.id}`);
      } catch (error) {
        this.logger.error(`Failed to create onboarding pack: ${error.message}`, error.stack);
        // Don't fail community creation if pack creation fails
      }
    }

    // Check achievements for community founder
    this.achievementsService.checkAchievements(userId).catch(err => {
      // Achievement check failed silently
    });

    return community;
  }

  async findAll(filters?: {
    type?: string;
    visibility?: CommunityVisibility;
    search?: string;
    nearLat?: number;
    nearLng?: number;
    maxDistance?: number;
  }) {
    const where: any = {
      // Only show non-private communities in public listing
      visibility: {
        not: CommunityVisibility.PRIVATE,
      },
    };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.visibility) {
      where.visibility = filters.visibility;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { location: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    let communities = await this.prisma.community.findMany({
      where,
      include: {
        _count: {
          select: {
            users: true,
            offers: true,
            events: true,
          },
        },
      },
      orderBy: {
        membersCount: 'desc',
      },
    });

    // Apply proximity filter using Haversine formula
    if (filters?.nearLat && filters?.nearLng && filters?.maxDistance && filters.maxDistance > 0) {
      communities = communities.filter((community) => {
        if (!community.lat || !community.lng) return false;
        const distance = this.calculateDistance(filters.nearLat, filters.nearLng, community.lat, community.lng);
        return distance <= filters.maxDistance;
      });
    }

    return communities;
  }

  async findOne(id: string, userId?: string) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        governance: true,
        _count: {
          select: {
            users: true,
            offers: true,
            events: true,
            connectionsOut: true,
            connectionsIn: true,
          },
        },
      },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if user is member
    let isMember = false;
    let isFounder = false;
    let canPropose = false;
    let canVote = false;
    let canModerate = false;

    if (userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          communityId: true,
          generosityScore: true,
        },
      });

      isMember = user?.communityId === id;
      isFounder = community.governance?.founders.includes(userId) || false;

      // Permisos basados en reputación, no en roles
      if (isMember && user) {
        canPropose = user.generosityScore >= (community.governance?.minProposalReputation || 10);
        canVote = user.generosityScore >= (community.governance?.minVoteReputation || 1);
        canModerate = user.generosityScore >= (community.governance?.minModerateReputation || 5);
      }
    }

    // If community is private and user is not a member, restrict info
    if (community.visibility === CommunityVisibility.PRIVATE && !isMember) {
      return {
        id: community.id,
        name: community.name,
        type: community.type,
        visibility: community.visibility,
        requiresApproval: community.requiresApproval,
        isMember: false,
        restricted: true,
      };
    }

    return {
      ...community,
      isMember,
      isFounder,
      canPropose,
      canVote,
      canModerate,
    };
  }

  async findBySlug(slug: string, userId?: string) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    return this.findOne(community.id, userId);
  }

  /**
   * Clasificar qué campos son cambios técnicos vs sustanciales
   */
  private isTechnicalChange(updates: UpdateCommunityDto): boolean {
    const technicalFields = ['location', 'lat', 'lng', 'radiusKm', 'description', 'logo', 'bannerImage', 'primaryColor', 'language', 'currency'];
    const substantialFields = ['name', 'slug', 'type', 'visibility', 'requiresApproval', 'allowExternalOffers'];

    const fieldsBeingUpdated = Object.keys(updates);
    const hasSubstantialChanges = fieldsBeingUpdated.some(field => substantialFields.includes(field));

    return !hasSubstantialChanges;
  }

  async update(id: string, userId: string, updateCommunityDto: UpdateCommunityDto) {
    const communityResult = await this.findOne(id, userId);

    if ('restricted' in communityResult && communityResult.restricted) {
      throw new ForbiddenException('No tienes acceso a esta comunidad');
    }

    // At this point, TypeScript knows we have the full community object
    const community = communityResult as Awaited<ReturnType<typeof this.findOne>> & { isFounder: boolean; governance: any };

    if (!community.isMember) {
      throw new ForbiddenException('Solo miembros pueden proponer cambios');
    }

    // Verificar reputación mínima para proponer cambios
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { generosityScore: true },
    });

    if (!user || user.generosityScore < 5) {
      throw new ForbiddenException(
        `Necesitas reputación mínima de 5 para proponer cambios. ` +
        `Tu reputación actual: ${user?.generosityScore || 0}. ` +
        `Ayuda a la comunidad para ganar reputación.`
      );
    }

    const now = new Date();
    const isBootstrap = community.governance?.bootstrapEndDate && now < community.governance.bootstrapEndDate;

    // Durante bootstrap (primeros 30 días), fundadores pueden hacer cambios directos
    if (isBootstrap && community.isFounder) {
      // Obtener datos actuales antes de actualizar
      const oldData = await this.prisma.community.findUnique({
        where: { id },
        select: {
          name: true,
          description: true,
          logo: true,
          bannerImage: true,
          location: true,
          lat: true,
          lng: true,
          radiusKm: true,
          type: true,
          visibility: true,
          requiresApproval: true,
          allowExternalOffers: true,
          primaryColor: true,
          language: true,
          currency: true,
        },
      });

      // Extract onboardingPack if present
      const { onboardingPack, ...communityUpdateData } = updateCommunityDto;

      const updatedCommunity = await this.prisma.community.update({
        where: { id },
        data: communityUpdateData,
      });

      // Registrar cambio en el log de auditoría
      await this.prisma.auditLog.create({
        data: {
          userId,
          action: 'COMMUNITY_UPDATE_BOOTSTRAP',
          entity: 'Community',
          entityId: id,
          oldData: oldData as any,
          newData: updateCommunityDto as any,
        },
      });

      return updatedCommunity;
    }

    // Después de bootstrap: Sistema descentralizado basado en PoH
    const isTechnical = this.isTechnicalChange(updateCommunityDto);

    if (isTechnical) {
      // CAMBIOS TÉCNICOS: Validación rápida por vecinos (sistema PoH descentralizado)
      // TODO: Integrar con ProofOfHelpService cuando se resuelvan dependencias circulares
      // Por ahora: aplicar cambios directamente si reputación >= 15 (miembros confiables)

      if (user.generosityScore >= 15) {
        // Miembros con alta reputación pueden hacer cambios técnicos directamente
        // Los cambios quedan registrados en el historial para transparencia

        // Obtener datos actuales antes de actualizar
        const oldData = await this.prisma.community.findUnique({
          where: { id },
          select: {
            name: true,
            description: true,
            logo: true,
            bannerImage: true,
            location: true,
            lat: true,
            lng: true,
            radiusKm: true,
            type: true,
            visibility: true,
            requiresApproval: true,
            allowExternalOffers: true,
            primaryColor: true,
            language: true,
            currency: true,
          },
        });

        // Extract onboardingPack if present
        const { onboardingPack, ...communityUpdateData } = updateCommunityDto;

        const updatedCommunity = await this.prisma.community.update({
          where: { id },
          data: communityUpdateData,
        });

        // Registrar cambio en el log de auditoría
        await this.prisma.auditLog.create({
          data: {
            userId,
            action: 'COMMUNITY_UPDATE_TECHNICAL',
            entity: 'Community',
            entityId: id,
            oldData: oldData as any,
            newData: updateCommunityDto as any,
          },
        });

        return updatedCommunity;
      }

      // Reputación insuficiente: requiere validación comunitaria
      throw new ForbiddenException(
        `Cambios técnicos requieren reputación >= 15 para aplicación directa. ` +
        `Tu reputación: ${user.generosityScore}. ` +
        `Alternativamente, crea una propuesta en /consensus/proposals.`
      );
    } else {
      // CAMBIOS SUSTANCIALES: Requieren propuesta y votación comunitaria completa
      throw new BadRequestException(
        'Los cambios sustanciales (nombre, tipo, visibilidad) requieren una propuesta y votación comunitaria. ' +
        'Usa el endpoint POST /consensus/proposals con type=COMMUNITY_UPDATE para crear una propuesta formal.\n\n' +
        'Proceso: 7 días de votación, quorum 50%, aprobación 75%.'
      );
    }
  }

  async delete(id: string, userId: string) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      select: {
        membersCount: true,
        governance: { select: { founders: true } },
      },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const isFounder = community.governance?.founders.includes(userId);

    // Si la comunidad tiene ≤ 1 miembro y el usuario es fundador, puede eliminar directamente
    if (community.membersCount <= 1 && isFounder) {
      await this.prisma.community.delete({ where: { id } });
      return { message: 'Comunidad eliminada exitosamente' };
    }

    // Si tiene más miembros, requiere consenso comunitario
    throw new BadRequestException(
      'Eliminar una comunidad con miembros requiere consenso comunitario del 90% de miembros activos. ' +
      `Miembros actuales: ${community.membersCount}. ` +
      'Crea una propuesta en POST /consensus/proposals con type=COMMUNITY_DISSOLUTION para iniciar el proceso.'
    );
  }

  async joinCommunity(communityId: string, userId: string, message?: string) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    // Check if already a member
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.communityId === communityId) {
      return { message: 'Already a member of this community' };
    }

    if (community.requiresApproval) {
      // Check if there's already a pending request
      const existingRequest = await this.prisma.membershipRequest.findUnique({
        where: {
          communityId_userId: {
            communityId,
            userId,
          },
        },
      });

      if (existingRequest) {
        if (existingRequest.status === 'PENDING') {
          return { message: 'You already have a pending membership request for this community' };
        } else if (existingRequest.status === 'REJECTED') {
          throw new ForbiddenException('Your membership request was rejected');
        } else if (existingRequest.status === 'APPROVED') {
          // Request was approved, join the community
          await this.prisma.$transaction([
            this.prisma.user.update({
              where: { id: userId },
              data: { communityId },
            }),
            this.prisma.community.update({
              where: { id: communityId },
              data: { membersCount: { increment: 1 } },
            }),
          ]);

          // Check achievements for joining community
          this.achievementsService.checkAchievements(userId).catch(err => {
            // Achievement check failed silently
          });

          return { message: 'Successfully joined community' };
        }
      }

      // Create membership request
      await this.prisma.membershipRequest.create({
        data: {
          communityId,
          userId,
          message,
        },
      });

      // Notify community moderators
      const moderators = await this.prisma.user.findMany({
        where: {
          communityId,
          generosityScore: { gte: 5 }, // Users with moderation permissions
        },
        select: { id: true },
      });

      await Promise.all(
        moderators.map(moderator =>
          this.prisma.notification.create({
            data: {
              userId: moderator.id,
              type: 'HELP_REQUEST',
              title: 'Nueva solicitud de membresía',
              body: `${user.name} quiere unirse a ${community.name}`,
              data: { communityId, requesterId: userId },
              link: `/communities/${communityId}/membership-requests`,
            },
          })
        )
      );

      return { message: 'Membership request submitted. You will be notified when it is reviewed.' };
    }

    // Join community directly
    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { communityId },
      }),
      this.prisma.community.update({
        where: { id: communityId },
        data: {
          membersCount: {
            increment: 1,
          },
        },
      }),
    ]);

    // Check achievements for joining community
    this.achievementsService.checkAchievements(userId).catch(err => {
      this.logger.error('Error checking achievements after joining community', err.stack, { userId, communityId });
    });

    return { message: 'Successfully joined community' };
  }

  async leaveCommunity(communityId: string, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.communityId !== communityId) {
      throw new ForbiddenException('You are not a member of this community');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: userId },
        data: { communityId: null },
      }),
      this.prisma.community.update({
        where: { id: communityId },
        data: {
          membersCount: {
            decrement: 1,
          },
        },
      }),
    ]);

    return { message: 'Successfully left community' };
  }

  async getMembers(communityId: string, userId: string) {
    // Check if user has access to see members
    const community = await this.findOne(communityId, userId);

    if (community.visibility === CommunityVisibility.PRIVATE && !community.isMember) {
      throw new ForbiddenException('You must be a member to view community members');
    }

    return this.prisma.user.findMany({
      where: {
        communityId,
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        bio: true,
        level: true,
        credits: true,
      },
      orderBy: {
        credits: 'desc',
      },
    });
  }

  async getMembershipRequests(communityId: string, userId: string) {
    const community = await this.findOne(communityId, userId);

    if (!community.isMember) {
      throw new ForbiddenException('Only members can view membership requests');
    }

    // Check if user has moderation permissions (generosityScore >= 5)
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { generosityScore: true },
    });

    if (!user || user.generosityScore < 5) {
      throw new ForbiddenException('You need moderation permissions to view membership requests');
    }

    return this.prisma.membershipRequest.findMany({
      where: {
        communityId,
        status: 'PENDING',
      },
      select: {
        id: true,
        userId: true,
        message: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async approveMembershipRequest(communityId: string, requestId: string, reviewerId: string, reviewNote?: string) {
    const community = await this.findOne(communityId, reviewerId);

    if (!community.isMember) {
      throw new ForbiddenException('Only members can approve membership requests');
    }

    // Check if user has moderation permissions
    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },
      select: { generosityScore: true, name: true },
    });

    if (!reviewer || reviewer.generosityScore < 5) {
      throw new ForbiddenException('You need moderation permissions to approve membership requests');
    }

    const request = await this.prisma.membershipRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Membership request not found');
    }

    if (request.communityId !== communityId) {
      throw new ForbiddenException('This request does not belong to the specified community');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(`Request has already been ${request.status.toLowerCase()}`);
    }

    // Approve request and add user to community
    await this.prisma.$transaction([
      this.prisma.membershipRequest.update({
        where: { id: requestId },
        data: {
          status: 'APPROVED',
          reviewedBy: reviewerId,
          reviewNote,
          reviewedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id: request.userId },
        data: { communityId },
      }),
      this.prisma.community.update({
        where: { id: communityId },
        data: { membersCount: { increment: 1 } },
      }),
    ]);

    // Notify requester
    const communityData = await this.prisma.community.findUnique({
      where: { id: communityId },
      select: { name: true },
    });

    await this.prisma.notification.create({
      data: {
        userId: request.userId,
        type: 'COMMUNITY_MILESTONE',
        title: 'Solicitud de membresía aprobada',
        body: `Tu solicitud para unirte a ${communityData.name} ha sido aprobada`,
        data: { communityId, requestId },
        link: `/communities/${communityId}`,
      },
    });

    return { message: 'Membership request approved successfully' };
  }

  async rejectMembershipRequest(communityId: string, requestId: string, reviewerId: string, reviewNote?: string) {
    const community = await this.findOne(communityId, reviewerId);

    if (!community.isMember) {
      throw new ForbiddenException('Only members can reject membership requests');
    }

    // Check if user has moderation permissions
    const reviewer = await this.prisma.user.findUnique({
      where: { id: reviewerId },
      select: { generosityScore: true, name: true },
    });

    if (!reviewer || reviewer.generosityScore < 5) {
      throw new ForbiddenException('You need moderation permissions to reject membership requests');
    }

    const request = await this.prisma.membershipRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      throw new NotFoundException('Membership request not found');
    }

    if (request.communityId !== communityId) {
      throw new ForbiddenException('This request does not belong to the specified community');
    }

    if (request.status !== 'PENDING') {
      throw new BadRequestException(`Request has already been ${request.status.toLowerCase()}`);
    }

    // Reject request
    await this.prisma.membershipRequest.update({
      where: { id: requestId },
      data: {
        status: 'REJECTED',
        reviewedBy: reviewerId,
        reviewNote,
        reviewedAt: new Date(),
      },
    });

    // Notify requester
    const communityData = await this.prisma.community.findUnique({
      where: { id: communityId },
      select: { name: true },
    });

    await this.prisma.notification.create({
      data: {
        userId: request.userId,
        type: 'COMMUNITY_MILESTONE',
        title: 'Solicitud de membresía rechazada',
        body: `Tu solicitud para unirte a ${communityData.name} ha sido rechazada${reviewNote ? `: ${reviewNote}` : ''}`,
        data: { communityId, requestId },
      },
    });

    return { message: 'Membership request rejected successfully' };
  }

  async getAuditLog(filters?: {
    userId?: string;
    entity?: string;
    entityId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    skip?: number;
    take?: number;
  }) {
    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.entity) {
      where.entity = filters.entity;
    }

    if (filters?.entityId) {
      where.entityId = filters.entityId;
    }

    if (filters?.action) {
      where.action = filters.action;
    }

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const skip = filters?.skip || 0;
    const take = filters?.take || 50;

    const [logs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        skip,
        take,
        hasMore: skip + take < total,
      },
    };
  }

  async getCommunityActivity(communityId: string, limit: number = 20) {
    // Verificar que la comunidad existe
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new NotFoundException('Comunidad no encontrada');
    }

    // Obtener actividad reciente de diferentes fuentes
    const [offers, events, proposals, posts] = await Promise.all([
      // Ofertas recientes
      this.prisma.offer.findMany({
        where: { communityId },
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      // Eventos recientes
      this.prisma.event.findMany({
        where: { communityId },
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' },
        include: {
          organizer: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      // Propuestas recientes
      this.prisma.proposal.findMany({
        where: {
          block: {
            content: {
              path: ['communityId'],
              equals: communityId,
            },
          },
        },
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
      // Posts recientes de la comunidad
      this.prisma.post.findMany({
        where: { author: { communityId } },
        take: Math.ceil(limit / 4),
        orderBy: { createdAt: 'desc' },
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
              comments: true,
              reactions: true,
            },
          },
        },
      }),
    ]);

    // Combinar y ordenar por fecha
    const activities = [
      ...offers.map(offer => ({
        type: 'offer' as const,
        id: offer.id,
        title: offer.title,
        description: offer.description,
        createdAt: offer.createdAt,
        user: offer.user,
        data: offer,
      })),
      ...events.map(event => ({
        type: 'event' as const,
        id: event.id,
        title: event.title,
        description: event.description,
        createdAt: event.createdAt,
        user: event.organizer,
        data: event,
      })),
      ...proposals.map(proposal => ({
        type: 'proposal' as const,
        id: proposal.id,
        title: proposal.title,
        description: proposal.description,
        createdAt: proposal.createdAt,
        user: proposal.author,
        data: proposal,
      })),
      ...posts.map(post => ({
        type: 'post' as const,
        id: post.id,
        title: null,
        description: post.content,
        createdAt: post.createdAt,
        user: post.author,
        data: {
          ...post,
          commentsCount: post._count.comments,
          reactionsCount: post._count.reactions,
        },
      })),
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);

    return activities;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get offers from a community
   */
  async getCommunityOffers(communityId: string, status?: string, limit: number = 50) {
    const community = await this.prisma.community.findUnique({
      where: { id: communityId },
    });

    if (!community) {
      throw new NotFoundException('Community not found');
    }

    const offers = await this.prisma.offer.findMany({
      where: {
        communityId,
        ...(status && { status: status as any }),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    return offers;
  }
}
