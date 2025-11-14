import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  NeedScope,
  NeedCategory,
  NeedType,
  NeedStatus,
  ProjectType,
  ProjectStatus,
  ContributionType,
  ContributionStatus,
  ResourceType,
  ImpactLevel,
  PhaseStatus,
} from '@prisma/client';

@Injectable()
export class MutualAidService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // NEEDS - Necesidades
  // ============================================

  async createNeed(userId: string, data: any) {
    const need = await this.prisma.need.create({
      data: {
        creatorId: userId,
        communityId: data.communityId,
        scope: data.scope,
        category: data.category,
        type: data.type,
        title: data.title,
        description: data.description,
        images: data.images || [],
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        country: data.country,
        resourceTypes: data.resourceTypes || [],
        targetEur: data.targetEur,
        targetCredits: data.targetCredits,
        targetHours: data.targetHours,
        neededSkills: data.neededSkills || [],
        neededMaterials: data.neededMaterials,
        urgencyLevel: data.urgencyLevel || 1,
        deadline: data.deadline ? new Date(data.deadline) : null,
        verificationDocs: data.verificationDocs || [],
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            generosityScore: true,
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

    return need;
  }

  async findNeeds(filters: any) {
    const where: any = {};

    if (filters.scope) where.scope = filters.scope;
    if (filters.category) where.category = filters.category;
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.communityId) where.communityId = filters.communityId;
    if (filters.country) where.country = filters.country;

    // Filter by urgency
    if (filters.minUrgency) {
      where.urgencyLevel = { gte: parseInt(filters.minUrgency) };
    }

    // Filter by resource type
    if (filters.resourceType) {
      where.resourceTypes = { has: filters.resourceType };
    }

    // Only verified needs
    if (filters.verified === 'true') {
      where.isVerified = true;
    }

    let needs = await this.prisma.need.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            generosityScore: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        contributions: {
          select: {
            id: true,
            contributionType: true,
            amountEur: true,
            amountCredits: true,
            amountHours: true,
            status: true,
          },
        },
      },
      orderBy: [
        { urgencyLevel: 'desc' },
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
      take: filters.limit ? parseInt(filters.limit) : 50,
    });

    // Apply proximity filter using Haversine formula
    if (filters.nearLat && filters.nearLng && filters.maxDistance && filters.maxDistance > 0) {
      needs = needs.filter((need) => {
        if (!need.latitude || !need.longitude) return false;
        const distance = this.calculateDistance(filters.nearLat, filters.nearLng, need.latitude, need.longitude);
        return distance <= filters.maxDistance;
      });
    }

    return needs;
  }

  async findNeedById(needId: string) {
    const need = await this.prisma.need.findUnique({
      where: { id: needId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            generosityScore: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
          },
        },
        contributions: {
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
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!need) {
      throw new NotFoundException('Necesidad no encontrada');
    }

    return need;
  }

  async contributeToNeed(userId: string, needId: string, data: any) {
    const need = await this.prisma.need.findUnique({
      where: { id: needId },
    });

    if (!need) {
      throw new NotFoundException('Necesidad no encontrada');
    }

    if (need.status === NeedStatus.FILLED || need.status === NeedStatus.CLOSED) {
      throw new BadRequestException('Esta necesidad ya está cerrada');
    }

    // Check user has enough resources
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { credits: true, hoursShared: true },
    });

    if (data.amountCredits && user.credits < data.amountCredits) {
      throw new BadRequestException('Créditos insuficientes');
    }

    // Create contribution
    const contribution = await this.prisma.$transaction(async (tx) => {
      const newContribution = await tx.contribution.create({
        data: {
          userId,
          needId,
          contributionType: data.contributionType,
          amountEur: data.amountEur,
          amountCredits: data.amountCredits,
          amountHours: data.amountHours,
          skillsOffered: data.skillsOffered || [],
          materialsOffered: data.materialsOffered,
          equipmentOffered: data.equipmentOffered || [],
          message: data.message,
          isAnonymous: data.isAnonymous || false,
          isRecurring: data.isRecurring || false,
          recurringMonths: data.recurringMonths,
          status: ContributionStatus.PENDING,
          proofDocuments: data.proofDocuments || [],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          need: true,
        },
      });

      // Update need's current amounts
      await tx.need.update({
        where: { id: needId },
        data: {
          currentEur: { increment: data.amountEur || 0 },
          currentCredits: { increment: data.amountCredits || 0 },
          currentHours: { increment: data.amountHours || 0 },
          contributorsCount: { increment: 1 },
        },
      });

      // Deduct credits from user if applicable
      if (data.amountCredits) {
        await tx.User.update({
          where: { id: userId },
          data: {
            credits: { decrement: data.amountCredits },
          },
        });
      }

      return newContribution;
    });

    // Check if need is now filled
    const updatedNeed = await this.prisma.need.findUnique({
      where: { id: needId },
    });

    const isFilled =
      (!updatedNeed.targetEur || updatedNeed.currentEur >= updatedNeed.targetEur) &&
      (!updatedNeed.targetCredits || updatedNeed.currentCredits >= updatedNeed.targetCredits) &&
      (!updatedNeed.targetHours || updatedNeed.currentHours >= updatedNeed.targetHours);

    if (isFilled) {
      await this.prisma.need.update({
        where: { id: needId },
        data: { status: NeedStatus.FILLED },
      });
    }

    return contribution;
  }

  async updateNeed(userId: string, needId: string, data: any) {
    const need = await this.prisma.need.findUnique({
      where: { id: needId },
    });

    if (!need) {
      throw new NotFoundException('Necesidad no encontrada');
    }

    if (need.creatorId !== userId) {
      throw new ForbiddenException('No tienes permiso para editar esta necesidad');
    }

    return this.prisma.need.update({
      where: { id: needId },
      data,
    });
  }

  async closeNeed(userId: string, needId: string) {
    const need = await this.prisma.need.findUnique({
      where: { id: needId },
    });

    if (!need) {
      throw new NotFoundException('Necesidad no encontrada');
    }

    if (need.creatorId !== userId) {
      throw new ForbiddenException('No tienes permiso para cerrar esta necesidad');
    }

    return this.prisma.need.update({
      where: { id: needId },
      data: {
        status: NeedStatus.CLOSED,
        closedAt: new Date(),
      },
    });
  }

  async deleteNeed(userId: string, needId: string) {
    const need = await this.prisma.need.findUnique({
      where: { id: needId },
    });

    if (!need) {
      throw new NotFoundException('Necesidad no encontrada');
    }

    if (need.creatorId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar esta necesidad');
    }

    // Verificar que no tenga contribuciones activas
    const activeContributions = await this.prisma.contribution.count({
      where: {
        needId,
        status: {
          in: ['PENDING', 'ACTIVE'],
        },
      },
    });

    if (activeContributions > 0) {
      throw new BadRequestException('No se puede eliminar una necesidad con contribuciones activas');
    }

    // Eliminar contribuciones completadas/canceladas
    await this.prisma.contribution.deleteMany({
      where: { needId },
    });

    // Eliminar la necesidad
    await this.prisma.need.delete({
      where: { id: needId },
    });

    return { message: 'Necesidad eliminada exitosamente' };
  }

  // ============================================
  // COMMUNITY PROJECTS - Proyectos Comunitarios
  // ============================================

  async createProject(userId: string, data: any) {
    const project = await this.prisma.communityProject.create({
      data: {
        creatorId: userId,
        communityId: data.communityId,
        type: data.type,
        title: data.title,
        description: data.description,
        vision: data.vision,
        images: data.images || [],
        videoUrl: data.videoUrl,
        location: data.location,
        latitude: data.latitude,
        longitude: data.longitude,
        country: data.country,
        region: data.region,
        beneficiaries: data.beneficiaries,
        impactGoals: data.impactGoals || [],
        targetEur: data.targetEur,
        targetCredits: data.targetCredits,
        targetHours: data.targetHours,
        targetSkills: data.targetSkills || [],
        materialNeeds: data.materialNeeds,
        participatingCommunities: data.participatingCommunities || [],
        volunteersNeeded: data.volunteersNeeded,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        estimatedMonths: data.estimatedMonths,
        organizationName: data.organizationName,
        contactEmail: data.contactEmail,
        websiteUrl: data.websiteUrl,
        tags: data.tags || [],
        sdgGoals: data.sdgGoals || [],
      },
      include: {
        creator: {
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

    return project;
  }

  async findProjects(filters: any) {
    const where: any = {};

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.country) where.country = filters.country;
    if (filters.region) where.region = filters.region;
    if (filters.communityId) where.communityId = filters.communityId;

    // Filter by tag
    if (filters.tag) {
      where.tags = { has: filters.tag };
    }

    // Filter by SDG goal
    if (filters.sdg) {
      where.sdgGoals = { has: parseInt(filters.sdg) };
    }

    // Only verified projects
    if (filters.verified === 'true') {
      where.isVerified = true;
    }

    let projects = await this.prisma.communityProject.findMany({
      where,
      include: {
        creator: {
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
        contributions: {
          select: {
            id: true,
            contributionType: true,
            amountEur: true,
            amountCredits: true,
            amountHours: true,
            status: true,
          },
        },
        _count: {
          select: {
            contributions: true,
            updates: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit ? parseInt(filters.limit) : 50,
    });

    // Apply proximity filter using Haversine formula
    if (filters.nearLat && filters.nearLng && filters.maxDistance && filters.maxDistance > 0) {
      projects = projects.filter((project) => {
        if (!project.latitude || !project.longitude) return false;
        const distance = this.calculateDistance(filters.nearLat, filters.nearLng, project.latitude, project.longitude);
        return distance <= filters.maxDistance;
      });
    }

    return projects;
  }

  async findProjectById(projectId: string) {
    const project = await this.prisma.communityProject.findUnique({
      where: { id: projectId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            slug: true,
            location: true,
          },
        },
        phases: {
          orderBy: { order: 'asc' },
        },
        contributions: {
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
          orderBy: { createdAt: 'desc' },
        },
        updates: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        impactReports: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          where: { publishedAt: { not: null } },
          orderBy: { publishedAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return project;
  }

  async contributeToProject(userId: string, projectId: string, data: any) {
    const project = await this.prisma.communityProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.status === ProjectStatus.COMPLETED || project.status === ProjectStatus.CANCELLED) {
      throw new BadRequestException('Este proyecto ya está cerrado');
    }

    // Check user has enough resources
    const user = await this.prisma.User.findUnique({
      where: { id: userId },
      select: { credits: true },
    });

    if (data.amountCredits && user.credits < data.amountCredits) {
      throw new BadRequestException('Créditos insuficientes');
    }

    // Create contribution
    const contribution = await this.prisma.$transaction(async (tx) => {
      const newContribution = await tx.contribution.create({
        data: {
          userId,
          projectId,
          phaseId: data.phaseId,
          contributionType: data.contributionType,
          amountEur: data.amountEur,
          amountCredits: data.amountCredits,
          amountHours: data.amountHours,
          skillsOffered: data.skillsOffered || [],
          materialsOffered: data.materialsOffered,
          equipmentOffered: data.equipmentOffered || [],
          message: data.message,
          isAnonymous: data.isAnonymous || false,
          status: ContributionStatus.PENDING,
          proofDocuments: data.proofDocuments || [],
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });

      // Update project's current amounts
      await tx.communityProject.update({
        where: { id: projectId },
        data: {
          currentEur: { increment: data.amountEur || 0 },
          currentCredits: { increment: data.amountCredits || 0 },
          currentHours: { increment: data.amountHours || 0 },
          contributorsCount: { increment: 1 },
        },
      });

      // If contributing time/skills, increment volunteersEnrolled
      if (data.contributionType === ContributionType.TIME || data.contributionType === ContributionType.SKILLS) {
        await tx.communityProject.update({
          where: { id: projectId },
          data: {
            volunteersEnrolled: { increment: 1 },
          },
        });
      }

      // Deduct credits from user if applicable
      if (data.amountCredits) {
        await tx.User.update({
          where: { id: userId },
          data: {
            credits: { decrement: data.amountCredits },
          },
        });
      }

      return newContribution;
    });

    return contribution;
  }

  async updateProject(userId: string, projectId: string, data: any) {
    const project = await this.prisma.communityProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.creatorId !== userId) {
      throw new ForbiddenException('No tienes permiso para modificar este proyecto');
    }

    return this.prisma.communityProject.update({
      where: { id: projectId },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.vision && { vision: data.vision }),
        ...(data.images && { images: data.images }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.location && { location: data.location }),
        ...(data.latitude && { latitude: data.latitude }),
        ...(data.longitude && { longitude: data.longitude }),
        ...(data.country && { country: data.country }),
        ...(data.region && { region: data.region }),
        ...(data.targetEur !== undefined && { targetEur: data.targetEur }),
        ...(data.targetCredits !== undefined && { targetCredits: data.targetCredits }),
        ...(data.targetHours !== undefined && { targetHours: data.targetHours }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.tags && { tags: data.tags }),
        ...(data.sdgs && { sdgs: data.sdgs }),
        ...(data.status && { status: data.status }),
      },
    });
  }

  async deleteProject(userId: string, projectId: string) {
    const project = await this.prisma.communityProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.creatorId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este proyecto');
    }

    // Verificar que no tenga contribuciones activas
    const activeContributions = await this.prisma.contribution.count({
      where: {
        projectId,
        status: {
          in: ['PENDING', 'ACTIVE'],
        },
      },
    });

    if (activeContributions > 0) {
      throw new BadRequestException('No se puede eliminar un proyecto con contribuciones activas');
    }

    // Eliminar fases del proyecto
    await this.prisma.projectPhase.deleteMany({
      where: { projectId },
    });

    // Eliminar actualizaciones del proyecto
    await this.prisma.projectUpdate.deleteMany({
      where: { projectId },
    });

    // Eliminar reportes de impacto
    await this.prisma.impactReport.deleteMany({
      where: { projectId },
    });

    // Eliminar contribuciones
    await this.prisma.contribution.deleteMany({
      where: { projectId },
    });

    // Eliminar el proyecto
    await this.prisma.communityProject.delete({
      where: { id: projectId },
    });

    return { message: 'Proyecto eliminado exitosamente' };
  }

  async addProjectPhase(userId: string, projectId: string, data: any) {
    const project = await this.prisma.communityProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.creatorId !== userId) {
      throw new ForbiddenException('No tienes permiso para añadir fases');
    }

    return this.prisma.projectPhase.create({
      data: {
        projectId,
        name: data.name,
        description: data.description,
        order: data.order,
        targetEur: data.targetEur,
        targetCredits: data.targetCredits,
        targetHours: data.targetHours,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });
  }

  async addProjectUpdate(userId: string, projectId: string, data: any) {
    const project = await this.prisma.communityProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.creatorId !== userId) {
      throw new ForbiddenException('No tienes permiso para añadir actualizaciones');
    }

    const update = await this.prisma.projectUpdate.create({
      data: {
        projectId,
        authorId: userId,
        title: data.title,
        content: data.content,
        images: data.images || [],
        videoUrl: data.videoUrl,
        progressUpdate: data.progressUpdate,
        fundsUsed: data.fundsUsed,
        beneficiariesReached: data.beneficiariesReached,
        milestones: data.milestones || [],
        challenges: data.challenges,
        nextSteps: data.nextSteps,
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

    // Update project completion rate if provided
    if (data.progressUpdate) {
      await this.prisma.communityProject.update({
        where: { id: projectId },
        data: {
          completionRate: data.progressUpdate,
        },
      });
    }

    return update;
  }

  async createImpactReport(userId: string, projectId: string, data: any) {
    const project = await this.prisma.communityProject.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.creatorId !== userId) {
      throw new ForbiddenException('No tienes permiso para crear reportes de impacto');
    }

    return this.prisma.impactReport.create({
      data: {
        projectId,
        authorId: userId,
        title: data.title,
        summary: data.summary,
        impactLevel: data.impactLevel,
        beneficiariesReached: data.beneficiariesReached,
        jobsCreated: data.jobsCreated,
        co2Avoided: data.co2Avoided,
        waterLitersProvided: data.waterLitersProvided,
        peopleEducated: data.peopleEducated,
        customMetrics: data.customMetrics,
        photos: data.photos || [],
        videos: data.videos || [],
        testimonials: data.testimonials || [],
        documents: data.documents || [],
        sustainabilityPlan: data.sustainabilityPlan,
        futureGoals: data.futureGoals || [],
        publishedAt: data.publish ? new Date() : null,
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
  }

  // ============================================
  // CONTRIBUTIONS - Gestión de Contribuciones
  // ============================================

  async validateContribution(userId: string, contributionId: string) {
    const contribution = await this.prisma.contribution.findUnique({
      where: { id: contributionId },
      include: {
        need: true,
        project: true,
      },
    });

    if (!contribution) {
      throw new NotFoundException('Contribución no encontrada');
    }

    // Only need/project creator can validate
    const canValidate =
      (contribution.need && contribution.need.creatorId === userId) ||
      (contribution.project && contribution.project.creatorId === userId);

    if (!canValidate) {
      throw new ForbiddenException('No tienes permiso para validar esta contribución');
    }

    return this.prisma.contribution.update({
      where: { id: contributionId },
      data: {
        status: ContributionStatus.COMPLETED,
        validatedAt: new Date(),
        validatedBy: userId,
      },
    });
  }

  async cancelContribution(userId: string, contributionId: string) {
    const contribution = await this.prisma.contribution.findUnique({
      where: { id: contributionId },
      include: {
        need: true,
        project: true,
      },
    });

    if (!contribution) {
      throw new NotFoundException('Contribución no encontrada');
    }

    if (contribution.userId !== userId) {
      throw new ForbiddenException('No tienes permiso para cancelar esta contribución');
    }

    if (contribution.status !== ContributionStatus.PENDING) {
      throw new BadRequestException('Solo se pueden cancelar contribuciones pendientes');
    }

    // Refund resources
    await this.prisma.$transaction(async (tx) => {
      if (contribution.amountCredits) {
        await tx.User.update({
          where: { id: userId },
          data: {
            credits: { increment: contribution.amountCredits },
          },
        });
      }

      // Update need/project amounts
      if (contribution.needId) {
        await tx.need.update({
          where: { id: contribution.needId },
          data: {
            currentEur: { decrement: contribution.amountEur || 0 },
            currentCredits: { decrement: contribution.amountCredits || 0 },
            currentHours: { decrement: contribution.amountHours || 0 },
            contributorsCount: { decrement: 1 },
          },
        });
      }

      if (contribution.projectId) {
        await tx.communityProject.update({
          where: { id: contribution.projectId },
          data: {
            currentEur: { decrement: contribution.amountEur || 0 },
            currentCredits: { decrement: contribution.amountCredits || 0 },
            currentHours: { decrement: contribution.amountHours || 0 },
            contributorsCount: { decrement: 1 },
          },
        });
      }

      await tx.contribution.update({
        where: { id: contributionId },
        data: {
          status: ContributionStatus.CANCELLED,
          refundedAt: new Date(),
        },
      });
    });

    return { message: 'Contribución cancelada y recursos devueltos' };
  }

  // ============================================
  // DASHBOARD & STATS
  // ============================================

  async getMyContributions(userId: string) {
    const contributions = await this.prisma.contribution.findMany({
      where: { userId },
      include: {
        need: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
          },
        },
        project: {
          select: {
            id: true,
            title: true,
            type: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return contributions;
  }

  async getMyNeeds(userId: string) {
    return this.prisma.need.findMany({
      where: { creatorId: userId },
      include: {
        contributions: {
          select: {
            id: true,
            contributionType: true,
            amountEur: true,
            amountCredits: true,
            amountHours: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyProjects(userId: string) {
    return this.prisma.communityProject.findMany({
      where: { creatorId: userId },
      include: {
        contributions: {
          select: {
            id: true,
            contributionType: true,
            amountEur: true,
            amountCredits: true,
            amountHours: true,
            status: true,
          },
        },
        _count: {
          select: {
            updates: true,
            impactReports: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
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
}
