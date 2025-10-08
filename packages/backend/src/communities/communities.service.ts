import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { CommunityVisibility } from '@prisma/client';

@Injectable()
export class CommunitiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createCommunityDto: CreateCommunityDto) {
    // Crear comunidad con gobernanza descentralizada
    // El creador es solo un fundador inicial, sin privilegios permanentes
    const bootstrapEndDate = new Date();
    bootstrapEndDate.setDate(bootstrapEndDate.getDate() + 30); // 30 días de bootstrap

    const community = await this.prisma.community.create({
      data: {
        ...createCommunityDto,
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

    return community;
  }

  async findAll(filters?: {
    type?: string;
    visibility?: CommunityVisibility;
    search?: string;
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

    return this.prisma.community.findMany({
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

  async update(id: string, userId: string, updateCommunityDto: UpdateCommunityDto) {
    const community = await this.findOne(id, userId);

    if ('restricted' in community && community.restricted) {
      throw new ForbiddenException('No tienes acceso a esta comunidad');
    }

    if (!community.isMember) {
      throw new ForbiddenException('Solo miembros pueden proponer cambios');
    }

    if (!('canPropose' in community) || !community.canPropose) {
      const minRep = ('governance' in community && community.governance)
        ? community.governance.minProposalReputation
        : 10;
      throw new ForbiddenException(
        `Necesitas reputación mínima de ${minRep} para proponer cambios. ` +
        `Ayuda a la comunidad para ganar reputación.`
      );
    }

    const now = new Date();
    const isBootstrap = community.governance?.bootstrapEndDate && now < community.governance.bootstrapEndDate;

    // Durante bootstrap, fundadores pueden hacer cambios directos
    if (isBootstrap && community.isFounder) {
      return this.prisma.community.update({
        where: { id },
        data: updateCommunityDto,
      });
    }

    // Después de bootstrap, los cambios requieren propuesta y votación comunitaria
    throw new BadRequestException(
      'Los cambios a la comunidad requieren una propuesta y votación. ' +
      'Usa el endpoint /consensus/proposals para crear una propuesta.'
    );
  }

  async delete(id: string, userId: string) {
    // Eliminar una comunidad siempre requiere consenso comunitario
    // No puede ser decisión unilateral, ni siquiera de fundadores
    throw new BadRequestException(
      'Eliminar una comunidad requiere consenso comunitario del 90% de miembros activos. ' +
      'Crea una propuesta en /consensus/proposals con type=COMMUNITY_DISSOLUTION'
    );
  }

  async joinCommunity(communityId: string, userId: string) {
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

    if (user.communityId === communityId) {
      return { message: 'Already a member of this community' };
    }

    if (community.requiresApproval) {
      // TODO: Create a membership request system
      throw new ForbiddenException('This community requires approval to join');
    }

    // Join community
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
}
