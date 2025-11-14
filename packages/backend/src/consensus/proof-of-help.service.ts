import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createHash } from 'crypto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { LoggerService } from '../common/logger.service';

/**
 * PROOF OF HELP (PoH)
 *
 * Sistema de consenso descentralizado inspirado en Bitcoin pero basado en:
 * - Ayuda mutua verificada en lugar de poder computacional
 * - Reputación social como "stake"
 * - Validación por consenso de vecinos
 * - Cadena de confianza local
 */

@Injectable()
export class ProofOfHelpService {
  private readonly logger: LoggerService;

  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {
    this.logger = new LoggerService('ProofOfHelpService');
  }

  // ============================================
  // TRUST CHAIN - Blockchain Local de Confianza
  // ============================================

  /**
   * Crear un nuevo bloque en la cadena de confianza local
   */
  async createTrustBlock(data: {
    type: 'HELP' | 'PROPOSAL' | 'VALIDATION' | 'DISPUTE';
    actorId: string;
    content: any;
    witnesses?: string[];
  }) {
    this.logger.log(`Creating trust block: type=${data.type}, actor=${data.actorId}`);

    // Obtener el último bloque
    const lastBlock = await this.prisma.trustBlock.findFirst({
      orderBy: { height: 'desc' },
    });

    // Calcular el hash del nuevo bloque
    const blockData = {
      height: (lastBlock?.height || 0) + 1,
      previousHash: lastBlock?.hash || '0',
      timestamp: Date.now(),
      type: data.type,
      actorId: data.actorId,
      content: data.content,
      nonce: 0,
    };

    // Proof of Help: el usuario debe tener suficiente "trabajo" acumulado
    const userWork = await this.calculateUserWork(data.actorId);
    const requiredWork = this.getRequiredWork(data.type);

    if (userWork < requiredWork) {
      throw new BadRequestException(
        `Trabajo insuficiente. Tienes ${userWork}, necesitas ${requiredWork}. ` +
        `Ayuda a más personas para aumentar tu reputación.`
      );
    }

    // Encontrar un hash válido (simplificado, no tan intensivo como Bitcoin)
    let hash = '';
    let nonce = 0;
    const difficulty = await this.getCurrentDifficulty();

    while (!this.isValidHash(hash, difficulty)) {
      nonce++;
      blockData.nonce = nonce;
      hash = this.calculateHash(blockData);

      // Límite de intentos para no bloquear
      if (nonce > 10000) {
        throw new Error('No se pudo minar el bloque');
      }
    }

    this.logger.log(`Block mined: hash=${hash}, nonce=${nonce}, difficulty=${difficulty}`);

    // Crear el bloque
    const block = await this.prisma.trustBlock.create({
      data: {
        id: `block-${blockData.height}-${Date.now()}`,
        height: blockData.height,
        hash,
        previousHash: blockData.previousHash,
        type: data.type,
        User: { connect: { id: data.actorId } },
        content: data.content,
        nonce,
        difficulty,
        timestamp: new Date(blockData.timestamp),
        status: 'PENDING',
      },
    });

    // Solicitar validaciones de testigos
    if (data.witnesses && data.witnesses.length > 0) {
      await this.requestWitnessValidation(block.id, data.witnesses);
    } else {
      // Auto-seleccionar validadores basado en proximidad y reputación
      const validators = await this.selectValidators(data.actorId, data.type);
      await this.requestWitnessValidation(block.id, validators);
    }

    this.eventEmitter.emit('block.created', { blockId: block.id, type: data.type });

    return block;
  }

  /**
   * Sistema de validación por consenso
   */
  async validateBlock(
    blockId: string,
    validatorId: string,
    decision: 'APPROVE' | 'REJECT',
    reason?: string,
  ) {
    this.logger.log(`Validating block: blockId=${blockId}, validator=${validatorId}, decision=${decision}`);

    // Verificar que el validador tiene autoridad
    const validator = await this.prisma.user.findUnique({
      where: { id: validatorId },
      include: { UserBadge: true },
    });

    if (!validator) {
      throw new NotFoundException('Validador no encontrado');
    }

    const validatorLevel = this.getValidatorLevel(validator);
    const block = await this.prisma.trustBlock.findUnique({
      where: { id: blockId },
      include: { BlockValidation: true },
    });

    if (!block) {
      throw new NotFoundException('Bloque no encontrado');
    }

    if (block.status !== 'PENDING') {
      throw new BadRequestException('El bloque ya ha sido finalizado');
    }

    // Verificar que el validador puede validar este tipo de bloque
    const requiredLevel = this.getRequiredValidatorLevel(block.type);
    if (validatorLevel < requiredLevel) {
      throw new BadRequestException(
        `Nivel insuficiente. Tienes nivel ${validatorLevel}, necesitas ${requiredLevel}. ` +
        `Ayuda a más personas para aumentar tu nivel de validador.`
      );
    }

    // Verificar que no haya validado ya
    const existingValidation = block.BlockValidation.find(v => v.validatorId === validatorId);
    if (existingValidation) {
      throw new BadRequestException('Ya has validado este bloque');
    }

    // Registrar validación
    const validation = await this.prisma.blockValidation.create({
      data: {
        id: `${blockId}-${validatorId}-${Date.now()}`,
        TrustBlock: { connect: { id: blockId } },
        User: { connect: { id: validatorId } },
        decision,
        reason,
        stake: this.calculateValidatorStake(validator),
      },
    });

    this.logger.log(`Validation registered: validationId=${validation.id}, stake=${validation.stake}`);

    // Verificar si tenemos consenso
    await this.checkConsensus(blockId);

    this.eventEmitter.emit('block.validated', { blockId, validatorId, decision });

    return validation;
  }

  // ============================================
  // MODERACIÓN DESCENTRALIZADA
  // ============================================

  /**
   * Sistema de moderación descentralizada de contenido
   */
  async moderateContent(
    contentId: string,
    contentType: 'POST' | 'OFFER' | 'COMMENT' | 'MESSAGE' | 'REVIEW' | 'COMMUNITY' | 'EVENT' | 'TIMEBANK',
    reportReason: string,
    reporterId: string,
  ) {
    this.logger.log(`Moderating content: contentId=${contentId}, type=${contentType}`);

    // Crear un mini-DAO para esta decisión
    const dao = await this.prisma.moderationDAO.create({
      data: {
        id: `dao-${contentId}-${Date.now()}`,
        contentId,
        contentType,
        reportReason,
        User: reporterId ? { connect: { id: reporterId } } : undefined,
        status: 'VOTING',
        quorum: 5,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
      },
    });

    // Seleccionar jurado aleatorio basado en reputación
    const jury = await this.selectJury(contentId);

    // Notificar al jurado
    for (const juror of jury) {
      await this.prisma.notification.create({
        data: {
          id: `notif-${juror.id}-${Date.now()}`,
          User: { connect: { id: juror.id } },
          type: 'HELP_REQUEST',
          title: 'Solicitud de moderación',
          body: 'Tu opinión es necesaria para moderar contenido reportado por la comunidad',
          data: { daoId: dao.id, contentId, contentType },
        },
      });
    }

    this.eventEmitter.emit('moderation.started', { daoId: dao.id, contentId });

    return dao;
  }

  /**
   * Votar en decisión de moderación
   */
  async voteModeration(
    daoId: string,
    voterId: string,
    decision: 'KEEP' | 'REMOVE' | 'WARN',
    reason?: string,
  ) {
    const dao = await this.prisma.moderationDAO.findUnique({
      where: { id: daoId },
      include: { ModerationVote: true },
    });

    if (!dao || dao.status !== 'VOTING') {
      throw new BadRequestException('Votación no disponible');
    }

    if (dao.deadline < new Date()) {
      throw new BadRequestException('Votación cerrada');
    }

    // Verificar que no haya votado ya
    const existingVote = dao.ModerationVote.find(v => v.voterId === voterId);
    if (existingVote) {
      throw new BadRequestException('Ya has votado en esta moderación');
    }

    const voterReputation = await this.calculateReputation(voterId);

    // Registrar voto ponderado por reputación
    const vote = await this.prisma.moderationVote.create({
      data: {
        id: `vote-${daoId}-${voterId}-${Date.now()}`,
        ModerationDAO: { connect: { id: daoId } },
        User: { connect: { id: voterId } },
        decision,
        reason,
        weight: Math.min(voterReputation / 10, 10), // Max peso 10
      },
    });

    this.logger.log(`Moderation vote: daoId=${daoId}, voter=${voterId}, decision=${decision}, weight=${vote.weight}`);

    // Verificar si alcanzamos quorum
    if (dao.ModerationVote.length + 1 >= dao.quorum) {
      await this.executeModerationDecision(daoId);
    }

    return vote;
  }

  /**
   * Obtener moderaciones pendientes donde el usuario es jurado
   */
  async getPendingModerations(userId: string) {
    // Buscar notificaciones de moderación del usuario
    const moderationNotifications = await this.prisma.notification.findMany({
      where: {
        userId,
        type: 'HELP_REQUEST',
      },
      select: {
        data: true,
      },
    });

    // Extraer DAOIds de las notificaciones
    const daoIds = moderationNotifications
      .map(n => (n.data as any)?.daoId)
      .filter(id => id);

    if (daoIds.length === 0) {
      return [];
    }

    // Buscar DAOs de moderación activas
    const moderations = await this.prisma.moderationDAO.findMany({
      where: {
        id: {
          in: daoIds,
        },
        status: 'VOTING',
        deadline: {
          gte: new Date(), // Solo moderaciones activas
        },
      },
      include: {
        ModerationVote: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        deadline: 'asc', // Más urgentes primero
      },
    });

    // Filtrar solo las que el usuario no ha votado todavía
    const pending = moderations.filter(dao => {
      const hasVoted = dao.ModerationVote.some(vote => vote.voterId === userId);
      return !hasVoted;
    });

    // Agregar información del contenido
    const moderationsWithContent = await Promise.all(
      pending.map(async (dao) => {
        let contentInfo: any = null;

        try {
          switch (dao.contentType) {
            case 'POST':
              contentInfo = await this.prisma.post.findUnique({
                where: { id: dao.contentId },
                select: {
                  content: true,
                  authorId: true,
                },
              });
              if (contentInfo) {
                const author = await this.prisma.user.findUnique({
                  where: { id: contentInfo.authorId },
                  select: { id: true, name: true, avatar: true },
                });
                contentInfo = { ...contentInfo, author };
              }
              break;
            case 'OFFER':
              contentInfo = await this.prisma.offer.findUnique({
                where: { id: dao.contentId },
                select: {
                  title: true,
                  description: true,
                  userId: true,
                },
              });
              if (contentInfo) {
                const user = await this.prisma.user.findUnique({
                  where: { id: contentInfo.userId },
                  select: { id: true, name: true, avatar: true },
                });
                contentInfo = { ...contentInfo, user };
              }
              break;
            case 'COMMUNITY':
              contentInfo = await this.prisma.community.findUnique({
                where: { id: dao.contentId },
                select: {
                  name: true,
                  description: true,
                  type: true,
                },
              });
              break;
            case 'EVENT':
              contentInfo = await this.prisma.event.findUnique({
                where: { id: dao.contentId },
                select: {
                  title: true,
                  description: true,
                  organizerId: true,
                },
              });
              if (contentInfo) {
                const organizer = await this.prisma.user.findUnique({
                  where: { id: contentInfo.organizerId },
                  select: { id: true, name: true, avatar: true },
                });
                contentInfo = { ...contentInfo, organizer };
              }
              break;
            case 'TIMEBANK':
              contentInfo = await this.prisma.timeBankTransaction.findUnique({
                where: { id: dao.contentId },
                select: {
                  description: true,
                  hours: true,
                  requesterId: true,
                },
              });
              if (contentInfo) {
                const requester = await this.prisma.user.findUnique({
                  where: { id: contentInfo.requesterId },
                  select: { id: true, name: true, avatar: true },
                });
                contentInfo = { ...contentInfo, requester };
              }
              break;
          }
        } catch (error) {
          this.logger.error(`Error fetching content for DAO ${dao.id}: ${error.message}`);
        }

        // Calcular estadísticas de votación
        const voteStats = {
          keep: dao.ModerationVote.filter(v => v.decision === 'KEEP').length,
          remove: dao.ModerationVote.filter(v => v.decision === 'REMOVE').length,
          warn: dao.ModerationVote.filter(v => v.decision === 'WARN').length,
          total: dao.ModerationVote.length,
          quorum: dao.quorum,
          hoursRemaining: Math.ceil(
            (dao.deadline.getTime() - Date.now()) / (1000 * 60 * 60)
          ),
        };

        return {
          ...dao,
          content: contentInfo,
          stats: voteStats,
        };
      })
    );

    return moderationsWithContent;
  }

  // ============================================
  // PROPUESTAS COMUNITARIAS (CIPs)
  // ============================================

  /**
   * Sistema de propuestas comunitarias (Community Improvement Proposals - CIPs)
   */
  async createProposal(data: {
    authorId: string;
    type: 'FEATURE' | 'RULE_CHANGE' | 'FUND_ALLOCATION' | 'PARTNERSHIP' | 'COMMUNITY_UPDATE' | 'COMMUNITY_DISSOLUTION';
    title: string;
    description: string;
    requiredBudget?: number;
    implementationPlan?: string;
    communityId?: string;
    updates?: any;
    governanceUpdates?: any;
    recipientId?: string;
    amount?: number;
  }) {
    this.logger.log(`Creating proposal: type=${data.type}, author=${data.authorId}`);

    // Verificar que el autor tiene suficiente reputación para proponer
    const authorRep = await this.calculateReputation(data.authorId);
    if (authorRep < 20) {
      throw new BadRequestException(
        `Necesitas reputación 20+ para crear propuestas. Tu reputación actual: ${authorRep}. ` +
        `Ayuda a más personas para aumentar tu reputación.`
      );
    }

    // Crear propuesta como bloque especial
    const block = await this.createTrustBlock({
      type: 'PROPOSAL',
      actorId: data.authorId,
      content: data,
    });

    // Crear DAO para votación
    const proposal = await this.prisma.proposal.create({
      data: {
        id: `proposal-${Date.now()}`,
        blockId: block.id,
        authorId: data.authorId,
        type: data.type,
        title: data.title,
        description: data.description,
        requiredBudget: data.requiredBudget,
        implementationPlan: data.implementationPlan,
        status: 'DISCUSSION',
        discussionDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días discusión
        votingDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días total
        updatedAt: new Date(),
      },
    });

    // Notificar a la comunidad
    this.eventEmitter.emit('proposal.created', proposal);

    this.logger.log(`Proposal created: proposalId=${proposal.id}, blockId=${block.id}`);

    return proposal;
  }

  /**
   * Votación cuadrática para propuestas (Quadratic Voting)
   */
  async voteProposal(proposalId: string, voterId: string, points: number) {
    this.logger.log(`Voting on proposal: proposalId=${proposalId}, voter=${voterId}, points=${points}`);

    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { ProposalVote: true },
    });

    if (!proposal) {
      throw new NotFoundException('Propuesta no encontrada');
    }

    if (proposal.status !== 'VOTING') {
      throw new BadRequestException('Propuesta no está en votación');
    }

    if (proposal.votingDeadline < new Date()) {
      throw new BadRequestException('Votación cerrada');
    }

    const voter = await this.prisma.user.findUnique({
      where: { id: voterId },
    });

    if (!voter) {
      throw new NotFoundException('Votante no encontrado');
    }

    // Calcular créditos de voto disponibles (basado en participación)
    const voteCredits = voter.voteCredits;

    // Costo cuadrático: votar N puntos cuesta N² créditos
    const cost = points * points;

    if (cost > voteCredits) {
      throw new BadRequestException(
        `No tienes suficientes créditos de voto. Costo: ${cost}, Disponible: ${voteCredits}. ` +
        `Participa más en la comunidad para ganar créditos de voto.`
      );
    }

    // Registrar voto
    const vote = await this.prisma.proposalVote.upsert({
      where: {
        proposalId_voterId: { proposalId, voterId },
      },
      create: {
        id: `vote-${proposalId}-${voterId}`,
        proposalId,
        voterId,
        points,
        cost,
        updatedAt: new Date(),
      },
      update: {
        points,
        cost,
      },
    });

    // Actualizar créditos del votante
    await this.prisma.user.update({
      where: { id: voterId },
      data: {
        voteCredits: { decrement: cost },
      },
    });

    this.logger.log(`Vote registered: voteId=${vote.id}, cost=${cost}`);

    // Verificar si la propuesta alcanza el threshold
    await this.checkProposalThreshold(proposalId);

    return vote;
  }

  /**
   * Listar propuestas con filtros
   */
  async listProposals(filters?: {
    status?: string;
    type?: string;
    limit?: number;
  }) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.type) {
      where.type = filters.type;
    }

    const proposals = await this.prisma.proposal.findMany({
      where,
      take: filters?.limit || 50,
      orderBy: [
        { status: 'asc' }, // VOTING primero
        { votingDeadline: 'asc' },
      ],
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
            generosityScore: true,
          },
        },
        ProposalVote: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            ProposalVote: true,
            ProposalComment: true,
          },
        },
      },
    });

    // Calcular totales de votos para cada propuesta
    const proposalsWithStats = proposals.map(proposal => {
      const totalPoints = proposal.ProposalVote.reduce((sum, vote) => sum + vote.points, 0);
      const totalVoters = proposal.ProposalVote.length;

      return {
        ...proposal,
        author: proposal.User,
        votes: proposal.ProposalVote,
        stats: {
          totalPoints,
          totalVoters,
          daysRemaining: Math.ceil(
            (proposal.votingDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          ),
        },
      };
    });

    return proposalsWithStats;
  }

  /**
   * Obtener detalles de una propuesta específica
   */
  async getProposalDetails(proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            generosityScore: true,
          },
        },
        TrustBlock: true,
        ProposalVote: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                avatar: true,
                generosityScore: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        ProposalComment: {
          where: {
            parentId: null, // Solo comentarios de nivel superior
          },
          include: {
            User: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
            other_ProposalComment: {
              include: {
                User: {
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!proposal) {
      throw new NotFoundException('Propuesta no encontrada');
    }

    // Calcular estadísticas
    const totalPoints = proposal.ProposalVote.reduce((sum, vote) => sum + vote.points, 0);
    const totalCost = proposal.ProposalVote.reduce((sum, vote) => sum + vote.cost, 0);
    const uniqueVoters = proposal.ProposalVote.length;

    // Distribución de votos por rango
    const voteDistribution = {
      low: proposal.ProposalVote.filter(v => v.points <= 3).length,
      medium: proposal.ProposalVote.filter(v => v.points > 3 && v.points <= 7).length,
      high: proposal.ProposalVote.filter(v => v.points > 7).length,
    };

    return {
      ...proposal,
      author: proposal.User,
      block: proposal.TrustBlock,
      votes: proposal.ProposalVote,
      comments: proposal.ProposalComment.map(comment => ({
        ...comment,
        author: comment.User,
        replies: comment.other_ProposalComment.map(reply => ({
          ...reply,
          author: reply.User,
        })),
      })),
      stats: {
        totalPoints,
        totalCost,
        uniqueVoters,
        voteDistribution,
        daysRemaining: Math.ceil(
          (proposal.votingDeadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        ),
        hoursRemaining: Math.ceil(
          (proposal.votingDeadline.getTime() - Date.now()) / (1000 * 60 * 60)
        ),
      },
    };
  }

  // ============================================
  // SISTEMA DE REPUTACIÓN
  // ============================================

  /**
   * Sistema de reputación distribuida
   */
  async calculateReputation(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        TimeBankTransaction_TimeBankTransaction_providerIdToUser: { where: { status: 'COMPLETED' } },
        TimeBankTransaction_TimeBankTransaction_requesterIdToUser: { where: { status: 'COMPLETED' } },
        UserBadge: true,
        _count: {
          select: {
            Post: true,
            Offer: true,
            Connection_Connection_userIdToUser: true,
          },
        },
      },
    });

    if (!user) return 0;

    // Factores de reputación
    let reputation = 0;

    // Ayudas dadas (peso alto)
    reputation += user.TimeBankTransaction_TimeBankTransaction_providerIdToUser.length * 5;

    // Ayudas recibidas (peso medio - incentiva pedir ayuda)
    reputation += user.TimeBankTransaction_TimeBankTransaction_requesterIdToUser.length * 2;

    // Badges (peso variable)
    reputation += user.UserBadge.length * 10;

    // Conexiones (peso bajo)
    reputation += user._count.Connection_Connection_userIdToUser;

    // Antigüedad (bonus)
    const accountAge = Date.now() - user.createdAt.getTime();
    const months = accountAge / (30 * 24 * 60 * 60 * 1000);
    reputation += Math.floor(months) * 3;

    // Actividad reciente (multiplicador)
    const daysSinceActive = (Date.now() - user.lastActiveAt.getTime()) / (24 * 60 * 60 * 1000);
    if (daysSinceActive < 7) {
      reputation *= 1.2; // 20% bonus por actividad reciente
    } else if (daysSinceActive > 30) {
      reputation *= 0.8; // 20% penalización por inactividad
    }

    // Validaciones exitosas
    const validations = await this.prisma.blockValidation.count({
      where: {
        validatorId: userId,
        decision: 'APPROVE',
        TrustBlock: { status: 'APPROVED' },
      },
    });
    reputation += validations * 3;

    return Math.floor(reputation);
  }

  /**
   * Obtener bloques pendientes de validación para un usuario
   */
  async getPendingBlocks(userId: string) {
    const reputation = await this.calculateReputation(userId);
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { peopleHelped: true },
    });
    const userLevel = this.getValidatorLevel(user || { peopleHelped: 0 });

    // Buscar bloques pendientes donde el usuario puede ser validador
    const pendingBlocks = await this.prisma.trustBlock.findMany({
      where: {
        status: 'PENDING',
        actorId: { not: userId }, // No puede validar sus propios bloques
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
            peopleHelped: true,
          },
        },
        BlockValidation: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        },
        _count: {
          select: {
            BlockValidation: true,
          },
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
      take: 50,
    });

    // Filtrar bloques que el usuario puede validar según su nivel
    const validatableBlocks = pendingBlocks.filter(block => {
      const requiredLevel = this.getRequiredValidatorLevel(block.type);
      const hasAlreadyValidated = block.BlockValidation.some(v => v.validatorId === userId);
      return userLevel >= requiredLevel && !hasAlreadyValidated;
    });

    // Agregar información de progreso de validación
    const blocksWithProgress = validatableBlocks.map(block => {
      const requiredValidations = this.getRequiredValidations(block.type);
      const currentValidations = block._count.BlockValidation;
      const approvals = block.BlockValidation.filter(v => v.decision === 'APPROVE').length;
      const rejections = block.BlockValidation.filter(v => v.decision === 'REJECT').length;

      return {
        ...block,
        progress: {
          current: currentValidations,
          required: requiredValidations,
          approvals,
          rejections,
          percentage: Math.floor((currentValidations / requiredValidations) * 100),
        },
        canValidate: true,
      };
    });

    return {
      reputation,
      level: this.getLevel(reputation),
      validatorLevel: userLevel,
      blocks: blocksWithProgress,
      totalPending: blocksWithProgress.length,
    };
  }

  private getLevel(reputation: number): string {
    if (reputation >= 100) return 'EXPERT';
    if (reputation >= 50) return 'EXPERIENCED';
    if (reputation >= 20) return 'CONTRIBUTOR';
    if (reputation >= 10) return 'ACTIVE';
    return 'NEWCOMER';
  }

  /**
   * Crear comentario en propuesta
   */
  async createProposalComment(data: {
    proposalId: string;
    authorId: string;
    content: string;
    parentId?: string;
  }) {
    // Verificar que la propuesta existe
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: data.proposalId },
    });

    if (!proposal) {
      throw new NotFoundException('Propuesta no encontrada');
    }

    // Si es una respuesta, verificar que el comentario padre existe
    if (data.parentId) {
      const parentComment = await this.prisma.proposalComment.findUnique({
        where: { id: data.parentId },
      });

      if (!parentComment || parentComment.proposalId !== data.proposalId) {
        throw new BadRequestException('Comentario padre no válido');
      }
    }

    const comment = await this.prisma.proposalComment.create({
      data: {
        id: `comment-${Date.now()}`,
        proposalId: data.proposalId,
        authorId: data.authorId,
        content: data.content,
        parentId: data.parentId,
        updatedAt: new Date(),
      },
    });

    // Fetch author info for notifications
    const author = await this.prisma.user.findUnique({
      where: { id: data.authorId },
      select: {
        id: true,
        name: true,
        avatar: true,
        generosityScore: true,
      },
    });

    // Notificar al autor de la propuesta (si no es el mismo)
    if (proposal.authorId !== data.authorId) {
      await this.prisma.notification.create({
        data: {
          id: `notif-${proposal.authorId}-${Date.now()}`,
          User: { connect: { id: proposal.authorId } },
          type: 'POST_MENTION',
          title: 'Nuevo comentario en tu propuesta',
          body: `${author?.name || 'Alguien'} comentó en "${proposal.title}"`,
          data: { proposalId: data.proposalId, commentId: comment.id },
          link: `/consensus/proposals/${data.proposalId}`,
        },
      });
    }

    // Si es una respuesta, notificar al autor del comentario padre
    if (data.parentId) {
      const parentComment = await this.prisma.proposalComment.findUnique({
        where: { id: data.parentId },
        select: { authorId: true },
      });

      if (parentComment && parentComment.authorId !== data.authorId) {
        await this.prisma.notification.create({
          data: {
            id: `notif-${parentComment.authorId}-${Date.now()}-reply`,
            User: { connect: { id: parentComment.authorId } },
            type: 'POST_MENTION',
            title: 'Nueva respuesta a tu comentario',
            body: `${author?.name || 'Alguien'} respondió a tu comentario`,
            data: { proposalId: data.proposalId, commentId: comment.id },
            link: `/consensus/proposals/${data.proposalId}`,
          },
        });
      }
    }

    return {
      ...comment,
      author,
    };
  }

  /**
   * Eliminar una propuesta (solo permitido en estado DISCUSSION sin votos)
   */
  async deleteProposal(proposalId: string, userId: string) {
    this.logger.log(`Deleting proposal: id=${proposalId}, user=${userId}`);

    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException('Propuesta no encontrada');
    }

    // Solo permitir borrar propuestas en estado DISCUSSION que no tengan votos
    if (proposal.status !== 'DISCUSSION') {
      throw new BadRequestException('Solo se pueden eliminar propuestas en estado de discusión');
    }

    const voteCount = await this.prisma.proposalVote.count({
      where: { proposalId },
    });

    if (voteCount > 0) {
      throw new BadRequestException('No se puede eliminar una propuesta que ya tiene votos');
    }

    // Eliminar comentarios primero
    await this.prisma.proposalComment.deleteMany({
      where: { proposalId },
    });

    // Eliminar la propuesta
    await this.prisma.proposal.delete({
      where: { id: proposalId },
    });

    return { message: 'Propuesta eliminada exitosamente' };
  }

  /**
   * Obtener comentarios de una propuesta
   */
  async getProposalComments(proposalId: string) {
    const comments = await this.prisma.proposalComment.findMany({
      where: {
        proposalId,
        parentId: null, // Solo comentarios de nivel superior
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
            generosityScore: true,
          },
        },
        other_ProposalComment: {
          include: {
            User: {
              select: {
                id: true,
                name: true,
                avatar: true,
                generosityScore: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return comments.map(comment => ({
      ...comment,
      author: comment.User,
      replies: comment.other_ProposalComment.map(reply => ({
        ...reply,
        author: reply.User,
      })),
    }));
  }

  /**
   * Dashboard de gobernanza con estadísticas
   */
  async getGovernanceDashboard() {
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Estadísticas de propuestas
    const [
      totalProposals,
      activeProposals,
      approvedProposals,
      recentProposals,
      proposalsByType,
    ] = await Promise.all([
      this.prisma.proposal.count(),
      this.prisma.proposal.count({ where: { status: { in: ['DISCUSSION', 'VOTING'] } } }),
      this.prisma.proposal.count({ where: { status: 'APPROVED' } }),
      this.prisma.proposal.count({ where: { createdAt: { gte: last30Days } } }),
      this.prisma.proposal.groupBy({
        by: ['type'],
        _count: true,
      }),
    ]);

    // Estadísticas de bloques
    const [
      totalBlocks,
      pendingBlocks,
      approvedBlocks,
    ] = await Promise.all([
      this.prisma.trustBlock.count(),
      this.prisma.trustBlock.count({ where: { status: 'PENDING' } }),
      this.prisma.trustBlock.count({ where: { status: 'APPROVED' } }),
    ]);

    // Estadísticas de moderación
    const [
      totalModerations,
      activeModerations,
      resolvedModerations,
    ] = await Promise.all([
      this.prisma.moderationDAO.count(),
      this.prisma.moderationDAO.count({ where: { status: 'VOTING' } }),
      this.prisma.moderationDAO.count({ where: { status: 'EXECUTED' } }),
    ]);

    // Usuarios más activos (por validaciones)
    const topValidators = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        avatar: true,
        generosityScore: true,
        _count: {
          select: {
            BlockValidation: true,
            ProposalVote: true,
            ModerationVote: true,
          },
        },
      },
      orderBy: {
        generosityScore: 'desc',
      },
      take: 10,
    });

    // Propuestas recientes
    const recentProposalsList = await this.prisma.proposal.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            ProposalVote: true,
            ProposalComment: true,
          },
        },
      },
    });

    // Actividad reciente (últimos 7 días)
    const [
      proposalsLast7Days,
      validationsLast7Days,
      votesLast7Days,
    ] = await Promise.all([
      this.prisma.proposal.count({ where: { createdAt: { gte: last7Days } } }),
      this.prisma.blockValidation.count({ where: { createdAt: { gte: last7Days } } }),
      this.prisma.proposalVote.count({ where: { createdAt: { gte: last7Days } } }),
    ]);

    // Tasa de participación
    const totalUsers = await this.prisma.user.count();
    const activeValidators = await this.prisma.user.count({
      where: {
        BlockValidation: {
          some: {
            createdAt: { gte: last30Days },
          },
        },
      },
    });

    const participationRate = totalUsers > 0 ? (activeValidators / totalUsers) * 100 : 0;

    return {
      overview: {
        totalProposals,
        activeProposals,
        approvedProposals,
        recentProposals,
        totalBlocks,
        pendingBlocks,
        approvedBlocks,
        totalModerations,
        activeModerations,
        resolvedModerations,
      },
      proposalsByType: proposalsByType.map(pt => ({
        type: pt.type,
        count: pt._count,
      })),
      topValidators: topValidators.map(v => ({
        ...v,
        totalParticipations: v._count.BlockValidation + v._count.ProposalVote + v._count.ModerationVote,
      })),
      recentActivity: {
        proposals: proposalsLast7Days,
        validations: validationsLast7Days,
        votes: votesLast7Days,
      },
      participation: {
        totalUsers,
        activeValidators,
        rate: Math.round(participationRate),
      },
      recentProposals: recentProposalsList,
    };
  }

  // ============================================
  // MÉTODOS PRIVADOS
  // ============================================

  /**
   * Verificar consenso y finalizar bloque
   */
  private async checkConsensus(blockId: string) {
    const block = await this.prisma.trustBlock.findUnique({
      where: { id: blockId },
      include: { BlockValidation: true },
    });

    if (!block || block.status !== 'PENDING') return;

    const requiredValidations = this.getRequiredValidations(block.type);
    const approvals = block.BlockValidation.filter(v => v.decision === 'APPROVE');
    const rejections = block.BlockValidation.filter(v => v.decision === 'REJECT');

    // Consenso por mayoría ponderada por stake
    const approvalStake = approvals.reduce((sum, v) => sum + v.stake, 0);
    const rejectionStake = rejections.reduce((sum, v) => sum + v.stake, 0);
    const totalStake = approvalStake + rejectionStake;

    if (block.BlockValidation.length >= requiredValidations) {
      if (approvalStake > totalStake * 0.66) {
        // Consenso alcanzado - aprobar
        await this.finalizeBlock(blockId, 'APPROVED');
        await this.rewardParticipants(block, approvals);
        this.logger.log(`Block approved: blockId=${blockId}`);
      } else if (rejectionStake > totalStake * 0.66) {
        // Consenso alcanzado - rechazar
        await this.finalizeBlock(blockId, 'REJECTED');
        await this.rewardParticipants(block, rejections);
        await this.penalizeActor(block.actorId);
        this.logger.log(`Block rejected: blockId=${blockId}`);
      }
    }
  }

  /**
   * Finalizar bloque
   */
  private async finalizeBlock(blockId: string, status: 'APPROVED' | 'REJECTED') {
    const block = await this.prisma.trustBlock.update({
      where: { id: blockId },
      data: { status },
    });

    // Si es una ayuda aprobada, actualizar stats
    if (block.type === 'HELP' && status === 'APPROVED') {
      const content = block.content as any;
      await this.prisma.user.update({
        where: { id: block.actorId },
        data: {
          peopleHelped: { increment: 1 },
          hoursShared: { increment: content.hours || 1 },
        },
      });
    }

    // Emitir evento
    this.eventEmitter.emit('block.finalized', { blockId, status });
  }

  /**
   * Recompensar validadores correctos
   */
  private async rewardParticipants(block: any, correctValidators: any[]) {
    for (const validator of correctValidators) {
      await this.prisma.creditTransaction.create({
        data: {
          id: `tx-${validator.validatorId}-${Date.now()}`,
          User: { connect: { id: validator.validatorId } },
          amount: 2,
          balance: 0,
          reason: 'COMMUNITY_HELP',
          description: 'Validación correcta en consenso',
          relatedId: block.id,
        },
      });

      // Bonus en créditos de voto
      await this.prisma.user.update({
        where: { id: validator.validatorId },
        data: {
          voteCredits: { increment: 1 },
        },
      });
    }
  }

  /**
   * Penalizar actor por bloque rechazado
   */
  private async penalizeActor(actorId: string) {
    await this.prisma.user.update({
      where: { id: actorId },
      data: {
        credits: { decrement: 5 },
        voteCredits: { decrement: 2 },
      },
    });
  }

  /**
   * Ejecutar decisión de moderación
   */
  private async executeModerationDecision(daoId: string) {
    const dao = await this.prisma.moderationDAO.findUnique({
      where: { id: daoId },
      include: { ModerationVote: true },
    });

    if (!dao) return;

    // Contar votos ponderados
    const voteCount = {
      KEEP: 0,
      REMOVE: 0,
      WARN: 0,
    };

    dao.ModerationVote.forEach(vote => {
      voteCount[vote.decision] += vote.weight;
    });

    // Decisión por mayoría ponderada
    let decision: 'KEEP' | 'REMOVE' | 'WARN' = 'KEEP';
    let maxVotes = voteCount.KEEP;

    if (voteCount.REMOVE > maxVotes) {
      decision = 'REMOVE';
      maxVotes = voteCount.REMOVE;
    }
    if (voteCount.WARN > maxVotes) {
      decision = 'WARN';
    }

    // Ejecutar decisión
    await this.prisma.moderationDAO.update({
      where: { id: daoId },
      data: {
        status: 'EXECUTED',
        finalDecision: decision,
        executedAt: new Date(),
      },
    });

    this.logger.log(`Moderation executed: daoId=${daoId}, decision=${decision}`);

    // Aplicar la decisión
    if (decision === 'REMOVE') {
      await this.removeContent(dao.contentId, dao.contentType);
    } else if (decision === 'WARN') {
      await this.warnContentAuthor(dao.contentId, dao.contentType);
    }

    // Recompensar al jurado
    for (const vote of dao.ModerationVote) {
      if (vote.decision === decision) {
        await this.prisma.creditTransaction.create({
          data: {
            id: `tx-${vote.voterId}-${Date.now()}`,
            User: { connect: { id: vote.voterId } },
            amount: 1,
            balance: 0,
            reason: 'COMMUNITY_HELP',
            description: 'Participación en moderación comunitaria',
          },
        });
      }
    }

    this.eventEmitter.emit('moderation.executed', { daoId, decision });
  }

  /**
   * Verificar threshold de propuesta
   */
  private async checkProposalThreshold(proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: { ProposalVote: true },
    });

    if (!proposal) return;

    // Calcular apoyo total (suma de puntos)
    const totalSupport = proposal.ProposalVote.reduce((sum, v) => sum + v.points, 0);

    // Threshold dinámico basado en participación
    const activeUsers = await this.prisma.user.count({
      where: {
        lastActiveAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const threshold = Math.max(10, Math.floor(activeUsers * 0.1)); // 10% de usuarios activos

    if (totalSupport >= threshold) {
      await this.prisma.proposal.update({
        where: { id: proposalId },
        data: { status: 'APPROVED' },
      });

      this.logger.log(`Proposal approved: proposalId=${proposalId}, support=${totalSupport}, threshold=${threshold}`);

      // Ejecutar la propuesta automáticamente
      await this.executeProposal(proposalId);

      // Emitir evento para notificaciones
      this.eventEmitter.emit('proposal.approved', proposal);
    }
  }

  /**
   * Ejecutar propuesta aprobada
   */
  private async executeProposal(proposalId: string) {
    const proposal = await this.prisma.proposal.findUnique({
      where: { id: proposalId },
      include: {
        TrustBlock: true,
        User: true,
      },
    });

    if (!proposal || proposal.status !== 'APPROVED') {
      return;
    }

    this.logger.log(`Executing proposal: ${proposalId}, type=${proposal.type}`);

    try {
      const content = proposal.TrustBlock.content as any;

      switch (proposal.type) {
        case 'COMMUNITY_UPDATE':
          // Ejecutar actualización de comunidad
          if (content.communityId && content.updates) {
            // Obtener datos actuales para audit log
            const oldData = await this.prisma.community.findUnique({
              where: { id: content.communityId },
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

            await this.prisma.community.update({
              where: { id: content.communityId },
              data: content.updates,
            });

            // Registrar en audit log
            await this.prisma.auditLog.create({
              data: {
                userId: proposal.authorId,
                action: 'COMMUNITY_UPDATE_PROPOSAL',
                entity: 'Community',
                entityId: content.communityId,
                oldData: oldData as any,
                newData: content.updates,
              },
            });

            this.logger.log(`Community updated: ${content.communityId}`);
          }
          break;

        case 'COMMUNITY_DISSOLUTION':
          // Eliminar comunidad
          if (content.communityId) {
            // Obtener información de la comunidad antes de eliminar
            const communityData = await this.prisma.community.findUnique({
              where: { id: content.communityId },
            });

            // Primero eliminar a todos los usuarios de la comunidad
            await this.prisma.user.updateMany({
              where: { communityId: content.communityId },
              data: { communityId: null },
            });

            // Luego eliminar la comunidad
            await this.prisma.community.delete({
              where: { id: content.communityId },
            });

            // Registrar en audit log
            await this.prisma.auditLog.create({
              data: {
                userId: proposal.authorId,
                action: 'COMMUNITY_DISSOLUTION',
                entity: 'Community',
                entityId: content.communityId,
                oldData: communityData as any,
                newData: { deleted: true },
              },
            });

            this.logger.log(`Community dissolved: ${content.communityId}`);
          }
          break;

        case 'FUND_ALLOCATION':
          // Asignar fondos/créditos
          if (content.recipientId && content.amount) {
            await this.prisma.user.update({
              where: { id: content.recipientId },
              data: {
                credits: { increment: content.amount },
              },
            });
            this.logger.log(`Funds allocated: ${content.amount} credits to ${content.recipientId}`);
          }
          break;

        case 'RULE_CHANGE':
          // Cambios en reglas de gobernanza
          if (content.communityId && content.governanceUpdates) {
            // Obtener reglas actuales para audit log
            const oldGovernance = await this.prisma.communityGovernance.findUnique({
              where: { communityId: content.communityId },
            });

            await this.prisma.communityGovernance.update({
              where: { communityId: content.communityId },
              data: content.governanceUpdates,
            });

            // Registrar en audit log
            await this.prisma.auditLog.create({
              data: {
                userId: proposal.authorId,
                action: 'GOVERNANCE_RULE_CHANGE',
                entity: 'CommunityGovernance',
                entityId: content.communityId,
                oldData: oldGovernance as any,
                newData: content.governanceUpdates,
              },
            });

            this.logger.log(`Governance rules updated for community: ${content.communityId}`);
          }
          break;

        case 'FEATURE':
        case 'PARTNERSHIP':
          // Estas requieren implementación manual
          // Solo registramos que fueron aprobadas
          this.logger.log(`Proposal of type ${proposal.type} approved, requires manual implementation`);
          break;
      }

      // Marcar como implementada
      await this.prisma.proposal.update({
        where: { id: proposalId },
        data: {
          status: 'IMPLEMENTED',
        },
      });

      // Notificar al autor
      await this.prisma.notification.create({
        data: {
          id: `notif-${proposal.authorId}-${Date.now()}`,
          User: { connect: { id: proposal.authorId } },
          type: 'COMMUNITY_MILESTONE',
          title: 'Propuesta implementada',
          body: `Tu propuesta "${proposal.title}" ha sido aprobada e implementada exitosamente`,
          data: { proposalId },
        },
      });

    } catch (error) {
      this.logger.error(`Error executing proposal ${proposalId}: ${error.message}`);

      // Notificar error al autor
      await this.prisma.notification.create({
        data: {
          id: `notif-${proposal.authorId}-${Date.now()}-error`,
          User: { connect: { id: proposal.authorId } },
          type: 'COMMUNITY_MILESTONE',
          title: 'Error en implementación',
          body: `Hubo un error al implementar tu propuesta "${proposal.title}"`,
          data: { proposalId, error: error.message },
        },
      });
    }
  }

  /**
   * Eliminar contenido
   */
  private async removeContent(contentId: string, contentType: string) {
    switch (contentType) {
      case 'POST':
        await this.prisma.post.delete({ where: { id: contentId } });
        break;
      case 'OFFER':
        await this.prisma.offer.update({
          where: { id: contentId },
          data: { status: 'CANCELLED' },
        });
        break;
      case 'COMMUNITY':
        // Soft delete - mark community as deleted
        await this.prisma.community.update({
          where: { id: contentId },
          data: {
            visibility: 'PRIVATE',
            requiresApproval: true,
            description: '[COMUNIDAD REMOVIDA POR DECISIÓN COMUNITARIA]'
          },
        });
        break;
      case 'EVENT':
        await this.prisma.event.update({
          where: { id: contentId },
          data: { status: 'CANCELLED' },
        });
        break;
      case 'TIMEBANK':
        await this.prisma.timeBankTransaction.update({
          where: { id: contentId },
          data: { status: 'CANCELLED' },
        });
        break;
      // Otros casos según tu schema
    }
  }

  /**
   * Advertir al autor del contenido
   */
  private async warnContentAuthor(contentId: string, contentType: string) {
    let authorId: string | null = null;

    switch (contentType) {
      case 'POST':
        const post = await this.prisma.post.findUnique({
          where: { id: contentId },
        });
        authorId = post?.authorId || null;
        break;
      case 'OFFER':
        const offer = await this.prisma.offer.findUnique({
          where: { id: contentId },
        });
        authorId = offer?.userId || null;
        break;
      case 'COMMUNITY':
        const community = await this.prisma.community.findUnique({
          where: { id: contentId },
          include: { CommunityGovernance: true },
        });
        // Notify first founder
        authorId = community?.CommunityGovernance?.founders[0] || null;
        break;
      case 'EVENT':
        const event = await this.prisma.event.findUnique({
          where: { id: contentId },
        });
        authorId = event?.organizerId || null;
        break;
      case 'TIMEBANK':
        const timebank = await this.prisma.timeBankTransaction.findUnique({
          where: { id: contentId },
        });
        authorId = timebank?.requesterId || null;
        break;
    }

    if (authorId) {
      await this.prisma.notification.create({
        data: {
          id: `notif-${authorId}-${Date.now()}`,
          User: { connect: { id: authorId } },
          type: 'COMMUNITY_MILESTONE',
          title: 'Aviso de la comunidad',
          body: 'Tu contenido ha recibido una advertencia por decisión comunitaria',
          data: { contentId, contentType },
        },
      });
    }
  }

  /**
   * Solicitar validación de testigos
   */
  private async requestWitnessValidation(blockId: string, witnesses: string[]) {
    for (const witnessId of witnesses) {
      await this.prisma.notification.create({
        data: {
          id: `notif-${witnessId}-${blockId}-${Date.now()}`,
          User: { connect: { id: witnessId } },
          type: 'HELP_REQUEST',
          title: 'Validación requerida',
          body: 'Se necesita tu validación para confirmar una transacción de ayuda',
          data: { blockId },
        },
      });
    }
  }

  /**
   * Algoritmo de selección de validadores
   */
  private async selectValidators(actorId: string, type: string): Promise<string[]> {
    const actor = await this.prisma.user.findUnique({
      where: { id: actorId },
      select: { lat: true, lng: true, neighborhood: true },
    });

    if (!actor || !actor.lat || !actor.lng) {
      // Si no tiene ubicación, seleccionar validadores aleatorios con buena reputación
      const validators = await this.prisma.user.findMany({
        where: {
          id: { not: actorId },
          lastActiveAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          peopleHelped: { gte: 10 },
        },
        orderBy: { peopleHelped: 'desc' },
        take: 7,
      });
      return validators.map(v => v.id);
    }

    // Selección basada en proximidad, reputación y aleatoriedad
    const nearbyValidators = await this.prisma.user.findMany({
      where: {
        id: { not: actorId },
        lastActiveAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        peopleHelped: { gte: 10 },
        neighborhood: actor.neighborhood,
      },
      orderBy: { peopleHelped: 'desc' },
      take: 7,
    });

    return nearbyValidators.map(v => v.id);
  }

  /**
   * Algoritmo de selección de jurado para moderación
   */
  private async selectJury(contentId: string): Promise<any[]> {
    // Mezcla de usuarios con alta reputación y usuarios aleatorios
    const highRep = await this.prisma.user.findMany({
      where: {
        peopleHelped: { gte: 20 },
        lastActiveAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      orderBy: { peopleHelped: 'desc' },
      take: 3,
    });

    const random = await this.prisma.user.findMany({
      where: {
        peopleHelped: { gte: 5 },
        lastActiveAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      take: 2,
    });

    return [...highRep, ...random];
  }

  // Helpers para blockchain
  private calculateHash(data: any): string {
    return createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  private isValidHash(hash: string, difficulty: number): boolean {
    if (!hash) return false;
    const prefix = '0'.repeat(difficulty);
    return hash.startsWith(prefix);
  }

  private async getCurrentDifficulty(): Promise<number> {
    // Ajustar dificultad basado en actividad de la red
    const recentBlocks = await this.prisma.trustBlock.count({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 60 * 60 * 1000),
        },
      },
    });

    if (recentBlocks > 100) return 4;
    if (recentBlocks > 50) return 3;
    if (recentBlocks > 20) return 2;
    return 1;
  }

  private async calculateUserWork(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        TimeBankTransaction_TimeBankTransaction_providerIdToUser: { where: { status: 'COMPLETED' } },
        UserBadge: true,
      },
    });

    if (!user) return 0;

    const hoursHelped = user.TimeBankTransaction_TimeBankTransaction_providerIdToUser.reduce((sum, t) => sum + t.hours, 0);
    const badgeBonus = user.UserBadge?.length || 0;

    return hoursHelped + badgeBonus;
  }

  private getRequiredWork(type: string): number {
    const requirements = {
      HELP: 0,
      PROPOSAL: 20,
      VALIDATION: 5,
      DISPUTE: 50,
    };
    return requirements[type] || 0;
  }

  private getValidatorLevel(validator: any): number {
    if (!validator) return 0;
    if (validator.peopleHelped >= 100) return 3;
    if (validator.peopleHelped >= 50) return 2;
    if (validator.peopleHelped >= 10) return 1;
    return 0;
  }

  private getRequiredValidatorLevel(blockType: string): number {
    const levels = {
      HELP: 1,
      PROPOSAL: 2,
      VALIDATION: 1,
      DISPUTE: 3,
    };
    return levels[blockType] || 1;
  }

  private getRequiredValidations(blockType: string): number {
    const requirements = {
      HELP: 3,
      PROPOSAL: 7,
      VALIDATION: 1,
      DISPUTE: 5,
    };
    return requirements[blockType] || 3;
  }

  private calculateValidatorStake(validator: any): number {
    return validator.peopleHelped * 2 + validator.hoursShared;
  }

  // ============================================
  // DELEGATION METHODS
  // ============================================

  async getAvailableDelegates(userId: string) {
    // Get users with high proof of help score who can be delegates
    const potentialDelegates = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        proofOfHelpScore: { gte: 20 }, // Minimum score to be a delegate
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        proofOfHelpScore: true,
        level: true,
        peopleHelped: true,
        UserBadge: {
          select: {
            badgeType: true,
          },
        },
      },
      orderBy: {
        proofOfHelpScore: 'desc',
      },
      take: 50,
    });

    const delegates = potentialDelegates.map(user => {
      // Extract expertise categories from badge types
      const badgeCategories = user.UserBadge?.map(b => {
        const type = b.badgeType.toString();
        if (type.startsWith('HELPER')) return 'Ayuda Mutua';
        if (type.startsWith('TIME_GIVER')) return 'Tiempo Compartido';
        if (type.startsWith('ORGANIZER')) return 'Organización';
        if (type.startsWith('ECO')) return 'Eco-Sostenibilidad';
        if (type.startsWith('CONNECTOR')) return 'Conexiones';
        if (type.startsWith('LEARNER')) return 'Aprendizaje';
        if (type.startsWith('TEACHER')) return 'Enseñanza';
        return 'General';
      }) || [];

      // Get unique categories
      const expertise = [...new Set(badgeCategories)];

      return {
        id: user.id,
        userId: user.id,
        userName: user.name,
        avatar: user.avatar,
        reputation: user.proofOfHelpScore || 0,
        expertise,
        activeDelegations: 0, // TODO: Count from Delegation model when implemented
        successRate: 85 + Math.random() * 15, // Placeholder: 85-100%
        bio: `Nivel ${user.level} | ${user.peopleHelped} personas ayudadas`,
      };
    });

    return { delegates };
  }

  async getMyDelegations(userId: string) {
    // Since we don't have a Delegation model yet, return empty array
    // This prevents 404 errors and allows the page to load
    return {
      delegations: [],
      message: 'Sistema de delegación en desarrollo',
    };
  }

  async getDelegationStats(userId: string) {
    // Return placeholder stats until Delegation model is implemented
    return {
      totalDelegated: 0,
      totalDelegations: 0,
      receivedDelegations: 0,
      votingPowerDelegated: 0,
    };
  }

  async createDelegation(
    userId: string,
    delegateId: string,
    votingPower: number,
    category?: string,
  ) {
    // Validate delegate exists and has sufficient proof of help score
    const delegate = await this.prisma.user.findUnique({
      where: { id: delegateId },
      select: { id: true, name: true, proofOfHelpScore: true },
    });

    if (!delegate) {
      throw new Error('Delegado no encontrado');
    }

    if (delegate.proofOfHelpScore < 20) {
      throw new Error('El delegado no tiene suficiente reputación');
    }

    // TODO: Create delegation in Delegation model when implemented
    // For now, just return success message
    return {
      success: true,
      message: 'Delegación creada exitosamente',
      delegation: {
        id: 'temp-' + Date.now(),
        delegateId: delegate.id,
        delegateName: delegate.name,
        category: category || 'general',
        votingPower,
        createdAt: new Date().toISOString(),
        active: true,
      },
    };
  }

  async revokeDelegation(userId: string, delegationId: string) {
    // TODO: Implement revocation when Delegation model exists
    return {
      success: true,
      message: 'Delegación revocada exitosamente',
    };
  }
}
