import { Test, TestingModule } from '@nestjs/testing';
import { MutualAidService } from './mutual-aid.service';
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
} from '@prisma/client';
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';

describe('MutualAidService', () => {
  let service: MutualAidService;
  let prisma: PrismaService;

  const mockPrismaService = {
    need: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    communityProject: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    contribution: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      deleteMany: jest.fn(),
    },
    projectPhase: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    projectUpdate: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    impactReport: {
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MutualAidService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MutualAidService>(MutualAidService);
    prisma = module.get<PrismaService>(PrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================
  // NEEDS TESTS
  // ============================================

  describe('createNeed', () => {
    it('should create a need', async () => {
      const userId = 'user-id';
      const needData = {
        communityId: 'community-id',
        scope: NeedScope.COMMUNITY,
        category: NeedCategory.PROJECT,
        type: NeedType.FOOD,
        title: 'Test Need',
        description: 'Test Description',
        location: 'Test Location',
        latitude: 40.4168,
        longitude: -3.7038,
        urgencyLevel: 3,
      };

      const mockNeed = {
        id: 'need-id',
        creatorId: userId,
        ...needData,
        status: NeedStatus.OPEN,
        creator: { id: userId, name: 'Test User', avatar: null },
        community: { id: 'community-id', name: 'Test Community' },
      };

      mockPrismaService.need.create.mockResolvedValue(mockNeed);

      const result = await service.createNeed(userId, needData);

      expect(result).toEqual(mockNeed);
      expect(mockPrismaService.need.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          creatorId: userId,
          scope: needData.scope,
          category: needData.category,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findNeeds', () => {
    it('should return all needs with filters', async () => {
      const mockNeeds = [
        {
          id: 'need-1',
          scope: NeedScope.COMMUNITY,
          category: NeedCategory.PROJECT,
          creator: { id: 'user-1', name: 'User 1' },
          contributions: [],
        },
      ];

      mockPrismaService.need.findMany.mockResolvedValue(mockNeeds);

      const result = await service.findNeeds({});

      expect(result).toEqual(mockNeeds);
      expect(mockPrismaService.need.findMany).toHaveBeenCalled();
    });

    it('should filter needs by scope and category', async () => {
      mockPrismaService.need.findMany.mockResolvedValue([]);

      await service.findNeeds({
        scope: NeedScope.PERSONAL,
        category: NeedCategory.URGENT,
      });

      expect(mockPrismaService.need.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            scope: NeedScope.PERSONAL,
            category: NeedCategory.URGENT,
          }),
        }),
      );
    });

    it('should filter needs by geographic location', async () => {
      mockPrismaService.need.findMany.mockResolvedValue([]);

      await service.findNeeds({
        lat: '40.4168',
        lng: '-3.7038',
        radiusKm: '10',
      });

      expect(mockPrismaService.need.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            latitude: expect.any(Object),
            longitude: expect.any(Object),
          }),
        }),
      );
    });

    it('should filter needs by verified status', async () => {
      mockPrismaService.need.findMany.mockResolvedValue([]);

      await service.findNeeds({ verified: 'true' });

      expect(mockPrismaService.need.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isVerified: true,
          }),
        }),
      );
    });
  });

  describe('findNeedById', () => {
    it('should return need by id', async () => {
      const mockNeed = {
        id: 'need-id',
        title: 'Test Need',
        creator: { id: 'user-id', name: 'User' },
        contributions: [],
      };

      mockPrismaService.need.findUnique.mockResolvedValue(mockNeed);

      const result = await service.findNeedById('need-id');

      expect(result).toEqual(mockNeed);
    });

    it('should throw NotFoundException if need not found', async () => {
      mockPrismaService.need.findUnique.mockResolvedValue(null);

      await expect(service.findNeedById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateNeed', () => {
    it('should update a need', async () => {
      const needId = 'need-id';
      const userId = 'user-id';

      const mockNeed = {
        id: needId,
        creatorId: userId,
        title: 'Old Title',
      };

      const updateData = {
        title: 'New Title',
        description: 'New Description',
      };

      mockPrismaService.need.findUnique.mockResolvedValue(mockNeed);
      mockPrismaService.need.update.mockResolvedValue({
        ...mockNeed,
        ...updateData,
      });

      const result = await service.updateNeed(userId, needId, updateData);

      expect(result.title).toBe('New Title');
    });

    it('should throw ForbiddenException if not the creator', async () => {
      const mockNeed = {
        id: 'need-id',
        creatorId: 'different-user',
      };

      mockPrismaService.need.findUnique.mockResolvedValue(mockNeed);

      await expect(
        service.updateNeed('wrong-user', 'need-id', {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('closeNeed', () => {
    it('should close a need', async () => {
      const needId = 'need-id';
      const userId = 'user-id';

      const mockNeed = {
        id: needId,
        creatorId: userId,
        status: NeedStatus.OPEN,
      };

      mockPrismaService.need.findUnique.mockResolvedValue(mockNeed);
      mockPrismaService.need.update.mockResolvedValue({
        ...mockNeed,
        status: NeedStatus.CLOSED,
      });

      const result = await service.closeNeed(userId, needId);

      expect(result.status).toBe(NeedStatus.CLOSED);
      expect(mockPrismaService.need.update).toHaveBeenCalledWith({
        where: { id: needId },
        data: { status: NeedStatus.CLOSED, closedAt: expect.any(Date) },
      });
    });
  });

  describe('deleteNeed', () => {
    it('should delete a need without contributions', async () => {
      const needId = 'need-id';
      const userId = 'user-id';

      const mockNeed = {
        id: needId,
        creatorId: userId,
        contributions: [],
      };

      mockPrismaService.need.findUnique.mockResolvedValue(mockNeed);
      mockPrismaService.contribution.count.mockResolvedValue(0);
      mockPrismaService.contribution.deleteMany.mockResolvedValue({});
      mockPrismaService.need.delete.mockResolvedValue({});

      const result = await service.deleteNeed(userId, needId);

      expect(result.message).toBeDefined();
      expect(mockPrismaService.need.delete).toHaveBeenCalledWith({
        where: { id: needId },
      });
    });

    it('should throw BadRequestException if need has contributions', async () => {
      const mockNeed = {
        id: 'need-id',
        creatorId: 'user-id',
        contributions: [{ id: 'contribution-1' }],
      };

      mockPrismaService.need.findUnique.mockResolvedValue(mockNeed);
      mockPrismaService.contribution.count.mockResolvedValue(1);

      await expect(
        service.deleteNeed('user-id', 'need-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ============================================
  // PROJECTS TESTS
  // ============================================

  describe('createProject', () => {
    it('should create a project', async () => {
      const userId = 'user-id';
      const projectData = {
        communityId: 'community-id',
        type: ProjectType.EDUCATION,
        title: 'Test Project',
        description: 'Test Description',
        vision: 'Test Vision',
        location: 'Test Location',
        targetEur: 10000,
        targetCredits: 5000,
        targetHours: 100,
      };

      const mockProject = {
        id: 'project-id',
        creatorId: userId,
        ...projectData,
        status: ProjectStatus.FORMING,
      };

      mockPrismaService.communityProject.create.mockResolvedValue(mockProject);

      const result = await service.createProject(userId, projectData);

      expect(result).toEqual(mockProject);
      expect(mockPrismaService.communityProject.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          creatorId: userId,
          type: projectData.type,
          title: projectData.title,
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('findProjects', () => {
    it('should return all projects', async () => {
      const mockProjects = [
        {
          id: 'project-1',
          type: ProjectType.EDUCATION,
          status: ProjectStatus.EXECUTING,
        },
      ];

      mockPrismaService.communityProject.findMany.mockResolvedValue(mockProjects);

      const result = await service.findProjects({});

      expect(result).toEqual(mockProjects);
    });

    it('should filter projects by type and status', async () => {
      mockPrismaService.communityProject.findMany.mockResolvedValue([]);

      await service.findProjects({
        type: ProjectType.INFRASTRUCTURE,
        status: ProjectStatus.EXECUTING,
      });

      expect(mockPrismaService.communityProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: ProjectType.INFRASTRUCTURE,
            status: ProjectStatus.EXECUTING,
          }),
        }),
      );
    });
  });

  describe('findProjectById', () => {
    it('should return project by id', async () => {
      const mockProject = {
        id: 'project-id',
        title: 'Test Project',
        creator: { id: 'user-id', name: 'User' },
        contributions: [],
        phases: [],
        updates: [],
      };

      mockPrismaService.communityProject.findUnique.mockResolvedValue(mockProject);

      const result = await service.findProjectById('project-id');

      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if project not found', async () => {
      mockPrismaService.communityProject.findUnique.mockResolvedValue(null);

      await expect(service.findProjectById('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProject', () => {
    it('should update a project', async () => {
      const projectId = 'project-id';
      const userId = 'user-id';

      const mockProject = {
        id: projectId,
        creatorId: userId,
        title: 'Old Title',
      };

      const updateData = {
        title: 'New Title',
        description: 'New Description',
      };

      mockPrismaService.communityProject.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.communityProject.update.mockResolvedValue({
        ...mockProject,
        ...updateData,
      });

      const result = await service.updateProject(userId, projectId, updateData);

      expect(result.title).toBe('New Title');
    });

    it('should throw ForbiddenException if not the creator', async () => {
      const mockProject = {
        id: 'project-id',
        creatorId: 'different-user',
      };

      mockPrismaService.communityProject.findUnique.mockResolvedValue(mockProject);

      await expect(
        service.updateProject('wrong-user', 'project-id', {}),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteProject', () => {
    it('should delete a project without contributions', async () => {
      const projectId = 'project-id';
      const userId = 'user-id';

      const mockProject = {
        id: projectId,
        creatorId: userId,
        contributions: [],
      };

      mockPrismaService.communityProject.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.contribution.count.mockResolvedValue(0);
      mockPrismaService.projectPhase.deleteMany.mockResolvedValue({});
      mockPrismaService.projectUpdate.deleteMany.mockResolvedValue({});
      mockPrismaService.impactReport.deleteMany.mockResolvedValue({});
      mockPrismaService.contribution.deleteMany.mockResolvedValue({});
      mockPrismaService.communityProject.delete.mockResolvedValue({});

      const result = await service.deleteProject(userId, projectId);

      expect(result.message).toBeDefined();
      expect(mockPrismaService.communityProject.delete).toHaveBeenCalledWith({
        where: { id: projectId },
      });
    });

    it('should throw BadRequestException if project has contributions', async () => {
      const mockProject = {
        id: 'project-id',
        creatorId: 'user-id',
        contributions: [{ id: 'contribution-1' }],
      };

      mockPrismaService.communityProject.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.contribution.count.mockResolvedValue(1); // Has contributions

      await expect(
        service.deleteProject('user-id', 'project-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('addProjectPhase', () => {
    it('should add a phase to a project', async () => {
      const projectId = 'project-id';
      const userId = 'user-id';

      const mockProject = {
        id: projectId,
        creatorId: userId,
      };

      const phaseData = {
        title: 'Phase 1',
        description: 'First phase',
        targetCredits: 1000,
      };

      mockPrismaService.communityProject.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.projectPhase.create.mockResolvedValue({
        id: 'phase-id',
        projectId,
        ...phaseData,
      });

      const result = await service.addProjectPhase(
        userId,
        projectId,
        phaseData,
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.projectPhase.create).toHaveBeenCalled();
    });
  });

  describe('addProjectUpdate', () => {
    it('should add an update to a project', async () => {
      const projectId = 'project-id';
      const userId = 'user-id';

      const mockProject = {
        id: projectId,
        creatorId: userId,
      };

      const updateData = {
        title: 'Progress Update',
        content: 'We have made great progress',
      };

      mockPrismaService.communityProject.findUnique.mockResolvedValue(mockProject);
      mockPrismaService.projectUpdate.create.mockResolvedValue({
        id: 'update-id',
        projectId,
        ...updateData,
      });

      const result = await service.addProjectUpdate(
        userId,
        projectId,
        updateData,
      );

      expect(result).toBeDefined();
      expect(mockPrismaService.projectUpdate.create).toHaveBeenCalled();
    });
  });

  // ============================================
  // CONTRIBUTIONS TESTS
  // ============================================

  describe('contributeToNeed', () => {
    it('should create a contribution to a need', async () => {
      const userId = 'user-id';
      const needId = 'need-id';

      const mockNeed = {
        id: needId,
        status: NeedStatus.OPEN,
        raisedEur: 0,
        raisedCredits: 0,
        targetCredits: 1000,
      };

      const mockUser = {
        id: userId,
        credits: 500,
      };

      const contributionData = {
        contributionType: ContributionType.MONETARY,
        amountCredits: 100,
      };

      const mockContribution = {
        id: 'contribution-id',
        needId,
        userId,
        ...contributionData,
        status: ContributionStatus.COMPLETED,
      };

      mockPrismaService.need.findUnique.mockResolvedValue(mockNeed);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(mockPrismaService),
      );
      mockPrismaService.contribution.create.mockResolvedValue(
        mockContribution,
      );
      mockPrismaService.need.update.mockResolvedValue(mockNeed);
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      const result = await service.contributeToNeed(
        userId,
        needId,
        contributionData,
      );

      expect(result).toBeDefined();
    });

    it('should throw BadRequestException if need is not open', async () => {
      const mockNeed = {
        id: 'need-id',
        status: NeedStatus.CLOSED,
      };

      mockPrismaService.need.findUnique.mockResolvedValue(mockNeed);

      await expect(
        service.contributeToNeed('user-id', 'need-id', {}),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('validateContribution', () => {
    it('should validate a contribution', async () => {
      const userId = 'user-id';
      const contributionId = 'contribution-id';

      const mockContribution = {
        id: contributionId,
        userId,
        needId: null,
        projectId: 'project-id',
        status: ContributionStatus.PENDING,
        contributionType: ContributionType.SKILLS,
        need: null,
        project: {
          id: 'project-id',
          creatorId: userId,
        },
      };

      mockPrismaService.contribution.findUnique.mockResolvedValue(
        mockContribution,
      );
      mockPrismaService.contribution.update.mockResolvedValue({
        ...mockContribution,
        status: ContributionStatus.COMPLETED,
      });

      const result = await service.validateContribution(
        userId,
        contributionId,
      );

      expect(result.status).toBe(ContributionStatus.COMPLETED);
    });
  });

  describe('cancelContribution', () => {
    it('should cancel a contribution and refund', async () => {
      const userId = 'user-id';
      const contributionId = 'contribution-id';

      const mockContribution = {
        id: contributionId,
        userId,
        status: ContributionStatus.PENDING,
        amountCredits: 100,
        needId: 'need-id',
      };

      const mockNeed = {
        id: 'need-id',
        raisedCredits: 100,
      };

      mockPrismaService.contribution.findUnique.mockResolvedValue(
        mockContribution,
      );
      mockPrismaService.need.findUnique.mockResolvedValue(mockNeed);
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(mockPrismaService),
      );
      mockPrismaService.contribution.update.mockResolvedValue({
        ...mockContribution,
        status: ContributionStatus.CANCELLED,
      });

      const result = await service.cancelContribution(userId, contributionId);

      expect(result).toBeDefined();
    });
  });

  // ============================================
  // USER QUERIES TESTS
  // ============================================

  describe('getMyContributions', () => {
    it('should return all user contributions', async () => {
      const userId = 'user-id';

      const mockContributions = [
        { id: 'contribution-1', userId },
        { id: 'contribution-2', userId },
      ];

      mockPrismaService.contribution.findMany.mockResolvedValue(
        mockContributions,
      );

      const result = await service.getMyContributions(userId);

      expect(result).toEqual(mockContributions);
      expect(mockPrismaService.contribution.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getMyNeeds', () => {
    it('should return all user needs', async () => {
      const userId = 'user-id';

      const mockNeeds = [
        { id: 'need-1', creatorId: userId },
        { id: 'need-2', creatorId: userId },
      ];

      mockPrismaService.need.findMany.mockResolvedValue(mockNeeds);

      const result = await service.getMyNeeds(userId);

      expect(result).toEqual(mockNeeds);
      expect(mockPrismaService.need.findMany).toHaveBeenCalledWith({
        where: { creatorId: userId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('getMyProjects', () => {
    it('should return all user projects', async () => {
      const userId = 'user-id';

      const mockProjects = [
        { id: 'project-1', creatorId: userId },
        { id: 'project-2', creatorId: userId },
      ];

      mockPrismaService.communityProject.findMany.mockResolvedValue(mockProjects);

      const result = await service.getMyProjects(userId);

      expect(result).toEqual(mockProjects);
      expect(mockPrismaService.communityProject.findMany).toHaveBeenCalledWith({
        where: { creatorId: userId },
        include: expect.any(Object),
        orderBy: { createdAt: 'desc' },
      });
    });
  });
});
