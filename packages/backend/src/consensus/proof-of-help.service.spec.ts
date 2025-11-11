import { Test, TestingModule } from '@nestjs/testing';
import { ProofOfHelpService } from './proof-of-help.service';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProofOfHelpService', () => {
  let service: ProofOfHelpService;
  let prisma: PrismaService;
  let eventEmitter: EventEmitter2;

  const mockPrismaService = {
    trustBlock: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    blockValidation: {
      create: jest.fn(),
      count: jest.fn(),
    },
    moderationDAO: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    moderationVote: {
      create: jest.fn(),
    },
    proposal: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    proposalVote: {
      upsert: jest.fn(),
      count: jest.fn(),
    },
    proposalComment: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    creditTransaction: {
      create: jest.fn(),
    },
    community: {
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    communityGovernance: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
    post: {
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    offer: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    event: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    timeBankTransaction: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProofOfHelpService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<ProofOfHelpService>(ProofOfHelpService);
    prisma = module.get<PrismaService>(PrismaService);
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // TRUST CHAIN - Blockchain Local
  // ============================================

  describe('createTrustBlock', () => {
    it('should create a trust block for a HELP action', async () => {
      const blockData = {
        type: 'HELP' as const,
        actorId: 'user-id',
        content: { hours: 2, description: 'Helped with gardening' },
        witnesses: ['witness-1', 'witness-2'],
      };

      // Mock last block
      mockPrismaService.trustBlock.findFirst.mockResolvedValue({
        id: 'last-block',
        height: 10,
        hash: 'previous-hash',
      });

      // Mock user work (sufficient for HELP)
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        timeBankGiven: [{ hours: 5 }],
        badges: [{ type: 'HELPER_10' }],
      });

      // Mock block count for difficulty
      mockPrismaService.trustBlock.count.mockResolvedValue(15);

      // Mock block creation
      const mockBlock = {
        id: 'block-id',
        height: 11,
        hash: 'new-block-hash',
        type: 'HELP',
        actorId: 'user-id',
        status: 'PENDING',
      };
      mockPrismaService.trustBlock.create.mockResolvedValue(mockBlock);

      // Mock witness notifications
      mockPrismaService.notification.create.mockResolvedValue({});

      const result = await service.createTrustBlock(blockData);

      expect(result).toEqual(mockBlock);
      expect(mockPrismaService.trustBlock.create).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('block.created', {
        blockId: mockBlock.id,
        type: 'HELP',
      });
    });

    it('should throw BadRequestException if user has insufficient work', async () => {
      const blockData = {
        type: 'PROPOSAL' as const,
        actorId: 'user-id',
        content: { title: 'New proposal' },
      };

      mockPrismaService.trustBlock.findFirst.mockResolvedValue(null);

      // Mock insufficient user work (PROPOSAL requires 20)
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'user-id',
        timeBankGiven: [{ hours: 1 }], // Only 1 hour
        badges: [],
      });

      await expect(service.createTrustBlock(blockData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('validateBlock', () => {
    it('should validate a block with APPROVE decision', async () => {
      const blockId = 'block-id';
      const validatorId = 'validator-id';

      // Mock validator with sufficient level
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: validatorId,
        peopleHelped: 50,
        hoursShared: 100,
        badges: [{ type: 'HELPER_10' }],
      });

      // Mock pending block
      mockPrismaService.trustBlock.findUnique.mockResolvedValue({
        id: blockId,
        type: 'HELP',
        status: 'PENDING',
        validations: [],
      });

      // Mock validation creation
      const mockValidation = {
        id: 'validation-id',
        blockId,
        validatorId,
        decision: 'APPROVE',
        stake: 200,
      };
      mockPrismaService.blockValidation.create.mockResolvedValue(
        mockValidation,
      );

      const result = await service.validateBlock(
        blockId,
        validatorId,
        'APPROVE',
      );

      expect(result).toEqual(mockValidation);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith('block.validated', {
        blockId,
        validatorId,
        decision: 'APPROVE',
      });
    });

    it('should throw NotFoundException if block not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'validator-id',
        peopleHelped: 50,
      });

      mockPrismaService.trustBlock.findUnique.mockResolvedValue(null);

      await expect(
        service.validateBlock('invalid-id', 'validator-id', 'APPROVE'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if validator has insufficient level', async () => {
      const blockId = 'block-id';
      const validatorId = 'validator-id';

      // Mock validator with low level
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: validatorId,
        peopleHelped: 5, // Only level 0 (needs 10+ for level 1)
        badges: [],
      });

      // Mock PROPOSAL block (requires level 2)
      mockPrismaService.trustBlock.findUnique.mockResolvedValue({
        id: blockId,
        type: 'PROPOSAL',
        status: 'PENDING',
        validations: [],
      });

      await expect(
        service.validateBlock(blockId, validatorId, 'APPROVE'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if already validated', async () => {
      const blockId = 'block-id';
      const validatorId = 'validator-id';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: validatorId,
        peopleHelped: 50,
      });

      mockPrismaService.trustBlock.findUnique.mockResolvedValue({
        id: blockId,
        type: 'HELP',
        status: 'PENDING',
        validations: [
          { validatorId: 'validator-id', decision: 'APPROVE' }, // Already validated
        ],
      });

      await expect(
        service.validateBlock(blockId, validatorId, 'APPROVE'),
      ).rejects.toThrow('Ya has validado este bloque');
    });
  });

  // ============================================
  // MODERACIÓN DESCENTRALIZADA
  // ============================================

  describe('moderateContent', () => {
    it('should create a moderation DAO for reported content', async () => {
      const contentId = 'content-id';
      const contentType = 'POST';
      const reportReason = 'Contenido ofensivo';
      const reporterId = 'reporter-id';

      const mockDAO = {
        id: 'dao-id',
        contentId,
        contentType,
        reportReason,
        reporterId,
        status: 'VOTING',
        quorum: 5,
      };

      mockPrismaService.moderationDAO.create.mockResolvedValue(mockDAO);

      // Mock jury selection
      mockPrismaService.user.findMany.mockResolvedValue([
        { id: 'juror-1', peopleHelped: 30 },
        { id: 'juror-2', peopleHelped: 25 },
        { id: 'juror-3', peopleHelped: 20 },
      ]);

      mockPrismaService.notification.create.mockResolvedValue({});

      const result = await service.moderateContent(
        contentId,
        contentType,
        reportReason,
        reporterId,
      );

      expect(result).toEqual(mockDAO);
      expect(mockPrismaService.moderationDAO.create).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'moderation.started',
        { daoId: mockDAO.id, contentId },
      );
    });
  });

  describe('voteModeration', () => {
    it('should register a moderation vote', async () => {
      const daoId = 'dao-id';
      const voterId = 'voter-id';

      const mockDAO = {
        id: daoId,
        status: 'VOTING',
        deadline: new Date(Date.now() + 1000 * 60 * 60), // 1 hour from now
        votes: [],
        quorum: 5,
      };

      mockPrismaService.moderationDAO.findUnique.mockResolvedValue(mockDAO);

      // Mock voter reputation
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: voterId,
        peopleHelped: 20,
        hoursShared: 50,
        badges: [{ type: 'HELPER_10' }],
        timeBankGiven: [{ status: 'COMPLETED' }],
        timeBankReceived: [],
        _count: { posts: 5, offers: 3, connections: 10 },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(),
      });

      mockPrismaService.blockValidation.count.mockResolvedValue(5);

      const mockVote = {
        id: 'vote-id',
        daoId,
        voterId,
        decision: 'REMOVE',
        weight: 5,
      };

      mockPrismaService.moderationVote.create.mockResolvedValue(mockVote);

      const result = await service.voteModeration(
        daoId,
        voterId,
        'REMOVE',
        'Contenido inapropiado',
      );

      expect(result).toEqual(mockVote);
      expect(mockPrismaService.moderationVote.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException if voting is closed', async () => {
      const daoId = 'dao-id';

      mockPrismaService.moderationDAO.findUnique.mockResolvedValue({
        id: daoId,
        status: 'VOTING',
        deadline: new Date(Date.now() - 1000), // Already passed
        votes: [],
      });

      await expect(
        service.voteModeration(daoId, 'voter-id', 'KEEP'),
      ).rejects.toThrow('Votación cerrada');
    });

    it('should throw BadRequestException if already voted', async () => {
      const daoId = 'dao-id';
      const voterId = 'voter-id';

      mockPrismaService.moderationDAO.findUnique.mockResolvedValue({
        id: daoId,
        status: 'VOTING',
        deadline: new Date(Date.now() + 1000 * 60 * 60),
        votes: [{ voterId: 'voter-id', decision: 'KEEP' }], // Already voted
      });

      await expect(
        service.voteModeration(daoId, voterId, 'REMOVE'),
      ).rejects.toThrow('Ya has votado en esta moderación');
    });
  });

  describe('getPendingModerations', () => {
    it('should return pending moderations for a user', async () => {
      const userId = 'user-id';

      // Mock notifications with moderation requests
      mockPrismaService.notification.findMany.mockResolvedValue([
        {
          data: { daoId: 'dao-1', contentId: 'content-1', contentType: 'POST' },
        },
        {
          data: { daoId: 'dao-2', contentId: 'content-2', contentType: 'OFFER' },
        },
      ]);

      // Mock pending DAOs
      const mockDAOs = [
        {
          id: 'dao-1',
          contentId: 'content-1',
          contentType: 'POST',
          reportReason: 'Spam',
          status: 'VOTING',
          deadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
          quorum: 5,
          votes: [{ voterId: 'other-user', decision: 'REMOVE' }],
          reporter: { id: 'reporter-1', name: 'Reporter', avatar: null },
        },
      ];

      mockPrismaService.moderationDAO.findMany.mockResolvedValue(mockDAOs);

      // Mock content info
      mockPrismaService.post.findUnique.mockResolvedValue({
        id: 'content-1',
        content: 'Test post content',
        author: { id: 'author-1', name: 'Author', avatar: null },
      });

      const result = await service.getPendingModerations(userId);

      expect(result).toHaveLength(1);
      expect(result[0].content).toBeDefined();
      expect(result[0].stats).toBeDefined();
    });

    it('should return empty array if no pending moderations', async () => {
      mockPrismaService.notification.findMany.mockResolvedValue([]);

      const result = await service.getPendingModerations('user-id');

      expect(result).toEqual([]);
    });
  });

  // ============================================
  // PROPUESTAS COMUNITARIAS (CIPs)
  // ============================================

  describe('createProposal', () => {
    it('should create a community proposal', async () => {
      const proposalData = {
        authorId: 'author-id',
        type: 'FEATURE' as const,
        title: 'Add new feature',
        description: 'Description of the new feature',
      };

      // Mock author with sufficient reputation
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'author-id',
        peopleHelped: 25,
        hoursShared: 50,
        badges: [{ type: 'HELPER_10' }],
        timeBankGiven: [{ status: 'COMPLETED' }, { status: 'COMPLETED' }],
        timeBankReceived: [],
        _count: { posts: 5, offers: 3, connections: 10 },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        lastActiveAt: new Date(),
      });

      mockPrismaService.blockValidation.count.mockResolvedValue(5);

      // Mock last block for trust block creation
      mockPrismaService.trustBlock.findFirst.mockResolvedValue({
        height: 10,
        hash: 'previous-hash',
      });

      mockPrismaService.trustBlock.count.mockResolvedValue(15);

      // Mock block creation
      mockPrismaService.trustBlock.create.mockResolvedValue({
        id: 'block-id',
        height: 11,
        hash: 'new-hash',
      });

      // Mock proposal creation
      const mockProposal = {
        id: 'proposal-id',
        blockId: 'block-id',
        authorId: 'author-id',
        type: 'FEATURE',
        title: 'Add new feature',
        description: 'Description of the new feature',
        status: 'DISCUSSION',
      };

      mockPrismaService.proposal.create.mockResolvedValue(mockProposal);
      mockPrismaService.notification.create.mockResolvedValue({});
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.createProposal(proposalData);

      expect(result).toEqual(mockProposal);
      expect(mockPrismaService.proposal.create).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'proposal.created',
        mockProposal,
      );
    });

    it('should throw BadRequestException if author has insufficient reputation', async () => {
      const proposalData = {
        authorId: 'author-id',
        type: 'FEATURE' as const,
        title: 'Add new feature',
        description: 'Description',
      };

      // Mock author with low reputation
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'author-id',
        peopleHelped: 5, // Less than 20
        badges: [],
        timeBankGiven: [],
        timeBankReceived: [],
        _count: { posts: 0, offers: 0, connections: 0 },
        createdAt: new Date(),
        lastActiveAt: new Date(),
      });

      mockPrismaService.blockValidation.count.mockResolvedValue(0);

      await expect(service.createProposal(proposalData)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('voteProposal', () => {
    it('should register a quadratic vote on a proposal', async () => {
      const proposalId = 'proposal-id';
      const voterId = 'voter-id';
      const points = 3; // Costs 9 credits (3²)

      const mockProposal = {
        id: proposalId,
        status: 'VOTING',
        votingDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
        votes: [],
      };

      mockPrismaService.proposal.findUnique.mockResolvedValue(mockProposal);

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: voterId,
        voteCredits: 20, // Has enough for 9 credits
      });

      const mockVote = {
        id: 'vote-id',
        proposalId,
        voterId,
        points: 3,
        cost: 9,
      };

      mockPrismaService.proposalVote.upsert.mockResolvedValue(mockVote);
      mockPrismaService.user.update.mockResolvedValue({});
      mockPrismaService.user.count.mockResolvedValue(100);

      const result = await service.voteProposal(proposalId, voterId, points);

      expect(result).toEqual(mockVote);
      expect(mockPrismaService.proposalVote.upsert).toHaveBeenCalled();
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: voterId },
        data: { voteCredits: { decrement: 9 } },
      });
    });

    it('should throw BadRequestException if insufficient vote credits', async () => {
      const proposalId = 'proposal-id';
      const voterId = 'voter-id';
      const points = 10; // Costs 100 credits

      mockPrismaService.proposal.findUnique.mockResolvedValue({
        id: proposalId,
        status: 'VOTING',
        votingDeadline: new Date(Date.now() + 1000 * 60 * 60),
        votes: [],
      });

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: voterId,
        voteCredits: 50, // Not enough for 100
      });

      await expect(
        service.voteProposal(proposalId, voterId, points),
      ).rejects.toThrow('No tienes suficientes créditos de voto');
    });

    it('should throw NotFoundException if proposal not found', async () => {
      mockPrismaService.proposal.findUnique.mockResolvedValue(null);

      await expect(
        service.voteProposal('invalid-id', 'voter-id', 5),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if proposal not in voting', async () => {
      mockPrismaService.proposal.findUnique.mockResolvedValue({
        id: 'proposal-id',
        status: 'DISCUSSION', // Not VOTING
        votes: [],
      });

      await expect(
        service.voteProposal('proposal-id', 'voter-id', 5),
      ).rejects.toThrow('Propuesta no está en votación');
    });
  });

  describe('listProposals', () => {
    it('should return all proposals with stats', async () => {
      const mockProposals = [
        {
          id: 'proposal-1',
          title: 'Proposal 1',
          status: 'VOTING',
          type: 'FEATURE',
          votingDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
          author: {
            id: 'author-1',
            name: 'Author 1',
            avatar: null,
            generosityScore: 50,
          },
          votes: [
            { points: 5, voter: { id: 'v1', name: 'V1', avatar: null } },
            { points: 3, voter: { id: 'v2', name: 'V2', avatar: null } },
          ],
          _count: { votes: 2, comments: 5 },
        },
      ];

      mockPrismaService.proposal.findMany.mockResolvedValue(mockProposals);

      const result = await service.listProposals();

      expect(result).toHaveLength(1);
      expect(result[0].stats).toBeDefined();
      expect(result[0].stats.totalPoints).toBe(8); // 5 + 3
      expect(result[0].stats.totalVoters).toBe(2);
    });

    it('should filter proposals by status', async () => {
      mockPrismaService.proposal.findMany.mockResolvedValue([]);

      await service.listProposals({ status: 'APPROVED' });

      expect(mockPrismaService.proposal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'APPROVED' }),
        }),
      );
    });

    it('should filter proposals by type', async () => {
      mockPrismaService.proposal.findMany.mockResolvedValue([]);

      await service.listProposals({ type: 'FUND_ALLOCATION' });

      expect(mockPrismaService.proposal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'FUND_ALLOCATION' }),
        }),
      );
    });
  });

  describe('getProposalDetails', () => {
    it('should return detailed proposal information', async () => {
      const proposalId = 'proposal-id';

      const mockProposal = {
        id: proposalId,
        title: 'Test Proposal',
        description: 'Description',
        status: 'VOTING',
        votingDeadline: new Date(Date.now() + 1000 * 60 * 60 * 24),
        author: {
          id: 'author-id',
          name: 'Author',
          avatar: null,
          bio: 'Author bio',
          generosityScore: 75,
        },
        block: { id: 'block-id', hash: 'block-hash' },
        votes: [
          {
            points: 5,
            cost: 25,
            voter: {
              id: 'voter-1',
              name: 'Voter 1',
              avatar: null,
              generosityScore: 60,
            },
            createdAt: new Date(),
          },
        ],
        comments: [
          {
            id: 'comment-1',
            content: 'Great idea!',
            author: { id: 'c1', name: 'Commenter', avatar: null },
            parentId: null,
            replies: [],
          },
        ],
      };

      mockPrismaService.proposal.findUnique.mockResolvedValue(mockProposal);

      const result = await service.getProposalDetails(proposalId);

      expect(result).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.stats.totalPoints).toBe(5);
      expect(result.stats.totalCost).toBe(25);
      expect(result.stats.uniqueVoters).toBe(1);
      expect(result.stats.voteDistribution).toBeDefined();
    });

    it('should throw NotFoundException if proposal not found', async () => {
      mockPrismaService.proposal.findUnique.mockResolvedValue(null);

      await expect(service.getProposalDetails('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('deleteProposal', () => {
    it('should delete a proposal in DISCUSSION state without votes', async () => {
      const proposalId = 'proposal-id';
      const userId = 'user-id';

      mockPrismaService.proposal.findUnique.mockResolvedValue({
        id: proposalId,
        status: 'DISCUSSION',
        authorId: userId,
      });

      mockPrismaService.proposalVote.count.mockResolvedValue(0);
      mockPrismaService.proposalComment.deleteMany.mockResolvedValue({});
      mockPrismaService.proposal.delete.mockResolvedValue({});

      const result = await service.deleteProposal(proposalId, userId);

      expect(result.message).toBe('Propuesta eliminada exitosamente');
      expect(mockPrismaService.proposalComment.deleteMany).toHaveBeenCalled();
      expect(mockPrismaService.proposal.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException if proposal not found', async () => {
      mockPrismaService.proposal.findUnique.mockResolvedValue(null);

      await expect(
        service.deleteProposal('invalid-id', 'user-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if proposal not in DISCUSSION', async () => {
      mockPrismaService.proposal.findUnique.mockResolvedValue({
        id: 'proposal-id',
        status: 'VOTING', // Not DISCUSSION
      });

      await expect(
        service.deleteProposal('proposal-id', 'user-id'),
      ).rejects.toThrow(
        'Solo se pueden eliminar propuestas en estado de discusión',
      );
    });

    it('should throw BadRequestException if proposal has votes', async () => {
      mockPrismaService.proposal.findUnique.mockResolvedValue({
        id: 'proposal-id',
        status: 'DISCUSSION',
      });

      mockPrismaService.proposalVote.count.mockResolvedValue(5); // Has votes

      await expect(
        service.deleteProposal('proposal-id', 'user-id'),
      ).rejects.toThrow(
        'No se puede eliminar una propuesta que ya tiene votos',
      );
    });
  });

  describe('createProposalComment', () => {
    it('should create a comment on a proposal', async () => {
      const commentData = {
        proposalId: 'proposal-id',
        authorId: 'author-id',
        content: 'Great proposal!',
      };

      mockPrismaService.proposal.findUnique.mockResolvedValue({
        id: 'proposal-id',
        authorId: 'proposal-author',
        title: 'Test Proposal',
      });

      const mockComment = {
        id: 'comment-id',
        ...commentData,
        author: {
          id: 'author-id',
          name: 'Author',
          avatar: null,
          generosityScore: 50,
        },
      };

      mockPrismaService.proposalComment.create.mockResolvedValue(mockComment);
      mockPrismaService.notification.create.mockResolvedValue({});

      const result = await service.createProposalComment(commentData);

      expect(result).toEqual(mockComment);
      expect(mockPrismaService.proposalComment.create).toHaveBeenCalled();
      expect(mockPrismaService.notification.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException if proposal not found', async () => {
      mockPrismaService.proposal.findUnique.mockResolvedValue(null);

      await expect(
        service.createProposalComment({
          proposalId: 'invalid-id',
          authorId: 'author-id',
          content: 'Comment',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should create a reply to an existing comment', async () => {
      const replyData = {
        proposalId: 'proposal-id',
        authorId: 'author-id',
        content: 'Reply to comment',
        parentId: 'parent-comment-id',
      };

      mockPrismaService.proposal.findUnique.mockResolvedValue({
        id: 'proposal-id',
        authorId: 'proposal-author',
        title: 'Test',
      });

      mockPrismaService.proposalComment.findUnique.mockResolvedValue({
        id: 'parent-comment-id',
        proposalId: 'proposal-id',
        authorId: 'parent-author',
      });

      const mockReply = {
        id: 'reply-id',
        ...replyData,
        author: { id: 'author-id', name: 'Author', avatar: null, generosityScore: 50 },
      };

      mockPrismaService.proposalComment.create.mockResolvedValue(mockReply);
      mockPrismaService.notification.create.mockResolvedValue({});

      const result = await service.createProposalComment(replyData);

      expect(result).toEqual(mockReply);
      expect(mockPrismaService.notification.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('getProposalComments', () => {
    it('should return all top-level comments with replies', async () => {
      const proposalId = 'proposal-id';

      const mockComments = [
        {
          id: 'comment-1',
          proposalId,
          content: 'Top level comment',
          parentId: null,
          author: { id: 'a1', name: 'Author 1', avatar: null, generosityScore: 50 },
          replies: [
            {
              id: 'reply-1',
              content: 'Reply to comment',
              author: { id: 'a2', name: 'Author 2', avatar: null, generosityScore: 40 },
            },
          ],
        },
      ];

      mockPrismaService.proposalComment.findMany.mockResolvedValue(
        mockComments,
      );

      const result = await service.getProposalComments(proposalId);

      expect(result).toEqual(mockComments);
      expect(result[0].replies).toHaveLength(1);
    });
  });

  // ============================================
  // SISTEMA DE REPUTACIÓN
  // ============================================

  describe('calculateReputation', () => {
    it('should calculate user reputation correctly', async () => {
      const userId = 'user-id';

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: userId,
        timeBankGiven: [{ status: 'COMPLETED' }, { status: 'COMPLETED' }],
        timeBankReceived: [{ status: 'COMPLETED' }],
        badges: [{ type: 'HELPER_10' }, { type: 'TIME_GIVER_50' }],
        _count: {
          posts: 10,
          offers: 5,
          connections: 20,
        },
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // 2 months old
        lastActiveAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Active 2 days ago
      });

      mockPrismaService.blockValidation.count.mockResolvedValue(10);

      const reputation = await service.calculateReputation(userId);

      expect(reputation).toBeGreaterThan(0);
      // 2 ayudas dadas * 5 = 10
      // 1 ayuda recibida * 2 = 2
      // 2 badges * 10 = 20
      // 20 connections = 20
      // 2 months * 3 = 6
      // 10 validations * 3 = 30
      // Total base: 88, then 20% bonus for activity = ~105
      expect(reputation).toBeGreaterThan(80);
    });

    it('should return 0 if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.blockValidation.count.mockResolvedValue(0);

      const reputation = await service.calculateReputation('invalid-id');

      expect(reputation).toBe(0);
    });
  });

  describe('getPendingBlocks', () => {
    it('should return pending blocks user can validate', async () => {
      const userId = 'user-id';

      // Mock user reputation and level
      mockPrismaService.user.findUnique
        .mockResolvedValueOnce({
          id: userId,
          peopleHelped: 50,
          timeBankGiven: [{ status: 'COMPLETED', hours: 10 }],
          timeBankReceived: [],
          badges: [{ type: 'HELPER_10' }],
          _count: { posts: 5, offers: 3, connections: 10 },
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          lastActiveAt: new Date(),
        })
        .mockResolvedValueOnce({
          id: userId,
          peopleHelped: 50,
        });

      mockPrismaService.blockValidation.count.mockResolvedValue(10);

      const mockBlocks = [
        {
          id: 'block-1',
          type: 'HELP',
          status: 'PENDING',
          actorId: 'other-user',
          actor: {
            id: 'other-user',
            name: 'Other User',
            avatar: null,
            peopleHelped: 5,
          },
          validations: [],
          _count: { validations: 0 },
        },
      ];

      mockPrismaService.trustBlock.findMany.mockResolvedValue(mockBlocks);

      const result = await service.getPendingBlocks(userId);

      expect(result).toBeDefined();
      expect(result.blocks).toHaveLength(1);
      expect(result.reputation).toBeGreaterThan(0);
      expect(result.validatorLevel).toBeGreaterThan(0);
    });
  });

  // ============================================
  // DASHBOARD Y ESTADÍSTICAS
  // ============================================

  describe('getGovernanceDashboard', () => {
    it('should return comprehensive governance statistics', async () => {
      // Mock all counts
      mockPrismaService.proposal.count
        .mockResolvedValueOnce(50) // total
        .mockResolvedValueOnce(10) // active
        .mockResolvedValueOnce(30) // approved
        .mockResolvedValueOnce(5); // recent

      mockPrismaService.proposal.groupBy.mockResolvedValue([
        { type: 'FEATURE', _count: 15 },
        { type: 'FUND_ALLOCATION', _count: 10 },
      ]);

      mockPrismaService.trustBlock.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(20) // pending
        .mockResolvedValueOnce(75); // approved

      mockPrismaService.moderationDAO.count
        .mockResolvedValueOnce(40) // total
        .mockResolvedValueOnce(8) // active
        .mockResolvedValueOnce(30); // resolved

      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: 'user-1',
          name: 'Top Validator',
          avatar: null,
          generosityScore: 100,
          _count: {
            blockValidations: 50,
            proposalVotes: 30,
            moderationVotes: 20,
          },
        },
      ]);

      mockPrismaService.proposal.findMany.mockResolvedValue([
        {
          id: 'p1',
          title: 'Recent Proposal',
          author: { id: 'a1', name: 'Author', avatar: null },
          _count: { votes: 10, comments: 5 },
          createdAt: new Date(),
        },
      ]);

      mockPrismaService.proposal.count
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(3); // last 7 days

      mockPrismaService.blockValidation.count.mockResolvedValue(15);
      mockPrismaService.proposalVote.count.mockResolvedValue(25);

      mockPrismaService.user.count
        .mockResolvedValueOnce(200) // total
        .mockResolvedValueOnce(50); // active validators

      const result = await service.getGovernanceDashboard();

      expect(result).toBeDefined();
      expect(result.overview).toBeDefined();
      expect(result.proposalsByType).toBeDefined();
      expect(result.topValidators).toBeDefined();
      expect(result.recentActivity).toBeDefined();
      expect(result.participation).toBeDefined();
      expect(result.recentProposals).toBeDefined();
    });
  });

  // ============================================
  // DELEGATION
  // ============================================

  describe('getAvailableDelegates', () => {
    it('should return list of available delegates', async () => {
      const userId = 'user-id';

      mockPrismaService.user.findMany.mockResolvedValue([
        {
          id: 'delegate-1',
          name: 'Delegate 1',
          avatar: null,
          proofOfHelpScore: 50,
          level: 'EXPERIENCED',
          peopleHelped: 30,
          badges: [
            { badgeType: 'HELPER_10' },
            { badgeType: 'TIME_GIVER_50' },
          ],
        },
      ]);

      const result = await service.getAvailableDelegates(userId);

      expect(result.delegates).toBeDefined();
      expect(result.delegates).toHaveLength(1);
      expect(result.delegates[0].expertise).toBeDefined();
    });
  });

  describe('getMyDelegations', () => {
    it('should return empty delegations (not implemented yet)', async () => {
      const result = await service.getMyDelegations('user-id');

      expect(result.delegations).toEqual([]);
      expect(result.message).toBe('Sistema de delegación en desarrollo');
    });
  });

  describe('getDelegationStats', () => {
    it('should return placeholder stats', async () => {
      const result = await service.getDelegationStats('user-id');

      expect(result.totalDelegated).toBe(0);
      expect(result.totalDelegations).toBe(0);
      expect(result.receivedDelegations).toBe(0);
      expect(result.votingPowerDelegated).toBe(0);
    });
  });

  describe('createDelegation', () => {
    it('should create a delegation', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'delegate-id',
        name: 'Delegate',
        proofOfHelpScore: 50,
      });

      const result = await service.createDelegation(
        'user-id',
        'delegate-id',
        10,
        'general',
      );

      expect(result.success).toBe(true);
      expect(result.delegation).toBeDefined();
    });

    it('should throw error if delegate not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.createDelegation('user-id', 'invalid-id', 10),
      ).rejects.toThrow('Delegado no encontrado');
    });

    it('should throw error if delegate has insufficient reputation', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'delegate-id',
        name: 'Delegate',
        proofOfHelpScore: 10, // Less than 20
      });

      await expect(
        service.createDelegation('user-id', 'delegate-id', 10),
      ).rejects.toThrow('El delegado no tiene suficiente reputación');
    });
  });

  describe('revokeDelegation', () => {
    it('should revoke a delegation', async () => {
      const result = await service.revokeDelegation('user-id', 'delegation-id');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Delegación revocada exitosamente');
    });
  });
});
