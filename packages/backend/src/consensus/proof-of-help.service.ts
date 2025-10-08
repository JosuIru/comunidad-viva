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
        height: blockData.height,
        hash,
        previousHash: blockData.previousHash,
        type: data.type,
        actorId: data.actorId,
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
      include: { badges: true },
    });

    if (!validator) {
      throw new NotFoundException('Validador no encontrado');
    }

    const validatorLevel = this.getValidatorLevel(validator);
    const block = await this.prisma.trustBlock.findUnique({
      where: { id: blockId },
      include: { validations: true },
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
    const existingValidation = block.validations.find(v => v.validatorId === validatorId);
    if (existingValidation) {
      throw new BadRequestException('Ya has validado este bloque');
    }

    // Registrar validación
    const validation = await this.prisma.blockValidation.create({
      data: {
        blockId,
        validatorId,
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
    contentType: 'POST' | 'OFFER' | 'COMMENT' | 'MESSAGE' | 'REVIEW',
    reportReason: string,
    reporterId: string,
  ) {
    this.logger.log(`Moderating content: contentId=${contentId}, type=${contentType}`);

    // Crear un mini-DAO para esta decisión
    const dao = await this.prisma.moderationDAO.create({
      data: {
        contentId,
        contentType,
        reportReason,
        reporterId,
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
          userId: juror.id,
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
      include: { votes: true },
    });

    if (!dao || dao.status !== 'VOTING') {
      throw new BadRequestException('Votación no disponible');
    }

    if (dao.deadline < new Date()) {
      throw new BadRequestException('Votación cerrada');
    }

    // Verificar que no haya votado ya
    const existingVote = dao.votes.find(v => v.voterId === voterId);
    if (existingVote) {
      throw new BadRequestException('Ya has votado en esta moderación');
    }

    const voterReputation = await this.calculateReputation(voterId);

    // Registrar voto ponderado por reputación
    const vote = await this.prisma.moderationVote.create({
      data: {
        daoId,
        voterId,
        decision,
        reason,
        weight: Math.min(voterReputation / 10, 10), // Max peso 10
      },
    });

    this.logger.log(`Moderation vote: daoId=${daoId}, voter=${voterId}, decision=${decision}, weight=${vote.weight}`);

    // Verificar si alcanzamos quorum
    if (dao.votes.length + 1 >= dao.quorum) {
      await this.executeModerationDecision(daoId);
    }

    return vote;
  }

  // ============================================
  // PROPUESTAS COMUNITARIAS (CIPs)
  // ============================================

  /**
   * Sistema de propuestas comunitarias (Community Improvement Proposals - CIPs)
   */
  async createProposal(data: {
    authorId: string;
    type: 'FEATURE' | 'RULE_CHANGE' | 'FUND_ALLOCATION' | 'PARTNERSHIP';
    title: string;
    description: string;
    requiredBudget?: number;
    implementationPlan?: string;
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
      include: { votes: true },
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
        proposalId,
        voterId,
        points,
        cost,
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
        timeBankGiven: { where: { status: 'COMPLETED' } },
        timeBankReceived: { where: { status: 'COMPLETED' } },
        badges: true,
        _count: {
          select: {
            posts: true,
            offers: true,
            connections: true,
          },
        },
      },
    });

    if (!user) return 0;

    // Factores de reputación
    let reputation = 0;

    // Ayudas dadas (peso alto)
    reputation += user.timeBankGiven.length * 5;

    // Ayudas recibidas (peso medio - incentiva pedir ayuda)
    reputation += user.timeBankReceived.length * 2;

    // Badges (peso variable)
    reputation += user.badges.length * 10;

    // Conexiones (peso bajo)
    reputation += user._count.connections;

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
        block: { status: 'APPROVED' },
      },
    });
    reputation += validations * 3;

    return Math.floor(reputation);
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
      include: { validations: true },
    });

    if (!block || block.status !== 'PENDING') return;

    const requiredValidations = this.getRequiredValidations(block.type);
    const approvals = block.validations.filter(v => v.decision === 'APPROVE');
    const rejections = block.validations.filter(v => v.decision === 'REJECT');

    // Consenso por mayoría ponderada por stake
    const approvalStake = approvals.reduce((sum, v) => sum + v.stake, 0);
    const rejectionStake = rejections.reduce((sum, v) => sum + v.stake, 0);
    const totalStake = approvalStake + rejectionStake;

    if (block.validations.length >= requiredValidations) {
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
          userId: validator.validatorId,
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
      include: { votes: true },
    });

    if (!dao) return;

    // Contar votos ponderados
    const voteCount = {
      KEEP: 0,
      REMOVE: 0,
      WARN: 0,
    };

    dao.votes.forEach(vote => {
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
    for (const vote of dao.votes) {
      if (vote.decision === decision) {
        await this.prisma.creditTransaction.create({
          data: {
            userId: vote.voterId,
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
      include: { votes: true },
    });

    if (!proposal) return;

    // Calcular apoyo total (suma de puntos)
    const totalSupport = proposal.votes.reduce((sum, v) => sum + v.points, 0);

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

      // Implementar la propuesta
      this.eventEmitter.emit('proposal.approved', proposal);
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
    }

    if (authorId) {
      await this.prisma.notification.create({
        data: {
          userId: authorId,
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
          userId: witnessId,
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
        timeBankGiven: { where: { status: 'COMPLETED' } },
        badges: true,
      },
    });

    if (!user) return 0;

    const hoursHelped = user.timeBankGiven.reduce((sum, t) => sum + t.hours, 0);
    const badgeBonus = user.badges?.length || 0;

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
}
