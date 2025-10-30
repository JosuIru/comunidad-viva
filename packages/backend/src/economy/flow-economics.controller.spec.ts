import { Test, TestingModule } from '@nestjs/testing';
import { FlowEconomicsController } from './flow-economics.controller';
import { FlowEconomicsService } from './flow-economics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { UserRole, PoolType, RequestStatus } from '@prisma/client';

describe('FlowEconomicsController', () => {
  let controller: FlowEconomicsController;
  let service: any;

  beforeEach(async () => {
    service = {
      getEconomicMetrics: jest.fn(),
      calculateGiniIndex: jest.fn(),
      executePeerTransaction: jest.fn(),
      createPoolRequest: jest.fn(),
      getPoolRequests: jest.fn(),
      getMyPoolRequests: jest.fn(),
      getPoolRequestById: jest.fn(),
      voteOnPoolRequest: jest.fn(),
      approvePoolRequest: jest.fn(),
      rejectPoolRequest: jest.fn(),
      distributePoolRequest: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlowEconomicsController],
      providers: [
        {
          provide: FlowEconomicsService,
          useValue: service,
        },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<FlowEconomicsController>(FlowEconomicsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMetrics', () => {
    it('should return economic metrics', async () => {
      const mockMetrics = {
        totalCredits: 100000,
        velocity: 1.5,
        giniIndex: 0.35,
        flowMultiplierAvg: 1.2,
      };

      service.getEconomicMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getMetrics();

      expect(service.getEconomicMetrics).toHaveBeenCalled();
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('getGiniIndex', () => {
    it('should return Gini index with interpretation', async () => {
      service.calculateGiniIndex.mockResolvedValue(0.35);

      const result = await controller.getGiniIndex();

      expect(result.giniIndex).toBe(0.35);
      expect(result.interpretation).toContain('Bueno');
    });

    it('should interpret different Gini values correctly', async () => {
      // Excellent
      service.calculateGiniIndex.mockResolvedValue(0.25);
      let result = await controller.getGiniIndex();
      expect(result.interpretation).toContain('Excelente');

      // High
      service.calculateGiniIndex.mockResolvedValue(0.55);
      result = await controller.getGiniIndex();
      expect(result.interpretation).toContain('Alto');

      // Very high
      service.calculateGiniIndex.mockResolvedValue(0.75);
      result = await controller.getGiniIndex();
      expect(result.interpretation).toContain('Muy alto');
    });
  });

  describe('sendWithFlowMultiplier', () => {
    it('should send credits with flow multiplier', async () => {
      const mockRequest = {
        user: { userId: 'user-123' },
      };

      const mockResult = {
        flowTx: {
          flowMultiplier: 1.5,
          totalValue: 150,
        },
        bonusValue: 50,
        poolContribution: 10,
      };

      service.executePeerTransaction.mockResolvedValue(mockResult);

      const result = await controller.sendWithFlowMultiplier(mockRequest, {
        toUserId: 'user-456',
        amount: 100,
        description: 'Help with groceries',
      });

      expect(service.executePeerTransaction).toHaveBeenCalledWith(
        'user-123',
        'user-456',
        100,
        expect.any(String),
        'Help with groceries'
      );
      expect(result.baseAmount).toBe(100);
      expect(result.flowMultiplier).toBe(1.5);
      expect(result.totalValue).toBe(150);
    });

    it('should throw error for negative amount', async () => {
      const mockRequest = {
        user: { userId: 'user-123' },
      };

      await expect(
        controller.sendWithFlowMultiplier(mockRequest, {
          toUserId: 'user-456',
          amount: -100,
          description: 'Invalid',
        })
      ).rejects.toThrow();
    });
  });

  describe('createPoolRequest', () => {
    it('should create pool request', async () => {
      const mockRequest = {
        user: { userId: 'user-123' },
      };

      const mockPoolRequest = {
        id: 'request-123',
        poolType: PoolType.EMERGENCY,
        amount: 500,
        reason: 'Medical emergency',
        status: RequestStatus.PENDING,
      };

      service.createPoolRequest.mockResolvedValue(mockPoolRequest);

      const result = await controller.createPoolRequest(mockRequest, {
        poolType: PoolType.EMERGENCY,
        amount: 500,
        reason: 'Medical emergency',
      });

      expect(service.createPoolRequest).toHaveBeenCalledWith(
        'user-123',
        PoolType.EMERGENCY,
        500,
        'Medical emergency'
      );
      expect(result.success).toBe(true);
      expect(result.request).toEqual(mockPoolRequest);
    });

    it('should throw error for negative amount', async () => {
      const mockRequest = {
        user: { userId: 'user-123' },
      };

      await expect(
        controller.createPoolRequest(mockRequest, {
          poolType: PoolType.EMERGENCY,
          amount: -100,
          reason: 'Invalid',
        })
      ).rejects.toThrow('Amount must be positive');
    });

    it('should throw error for empty reason', async () => {
      const mockRequest = {
        user: { userId: 'user-123' },
      };

      await expect(
        controller.createPoolRequest(mockRequest, {
          poolType: PoolType.EMERGENCY,
          amount: 100,
          reason: '   ',
        })
      ).rejects.toThrow('Reason is required');
    });
  });

  describe('voteOnRequest', () => {
    it('should record vote on pool request', async () => {
      const mockRequest = {
        user: { userId: 'user-123' },
      };

      const mockResult = {
        voteCount: 5,
        approved: false,
      };

      service.voteOnPoolRequest.mockResolvedValue(mockResult);

      const result = await controller.voteOnRequest(
        mockRequest,
        'request-123',
        { vote: true, comment: 'Looks legitimate' }
      );

      expect(service.voteOnPoolRequest).toHaveBeenCalledWith(
        'request-123',
        'user-123',
        true,
        'Looks legitimate'
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain('favor');
    });

    it('should handle negative votes', async () => {
      const mockRequest = {
        user: { userId: 'user-123' },
      };

      service.voteOnPoolRequest.mockResolvedValue({ voteCount: 1 });

      const result = await controller.voteOnRequest(
        mockRequest,
        'request-123',
        { vote: false, comment: 'Suspicious' }
      );

      expect(result.message).toContain('contra');
    });
  });

  describe('approveRequest', () => {
    it('should approve pool request', async () => {
      const mockRequest = {
        user: { userId: 'admin-123' },
      };

      const mockResult = {
        id: 'request-123',
        status: RequestStatus.APPROVED,
      };

      service.approvePoolRequest.mockResolvedValue(mockResult);

      const result = await controller.approveRequest(mockRequest, 'request-123');

      expect(service.approvePoolRequest).toHaveBeenCalledWith(
        'request-123',
        'admin-123'
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain('aprobada');
    });
  });

  describe('rejectRequest', () => {
    it('should reject pool request', async () => {
      const mockRequest = {
        user: { userId: 'admin-123' },
      };

      const mockResult = {
        id: 'request-123',
        status: RequestStatus.REJECTED,
      };

      service.rejectPoolRequest.mockResolvedValue(mockResult);

      const result = await controller.rejectRequest(mockRequest, 'request-123');

      expect(service.rejectPoolRequest).toHaveBeenCalledWith(
        'request-123',
        'admin-123'
      );
      expect(result.success).toBe(true);
      expect(result.message).toContain('rechazada');
    });
  });

  describe('distributeRequest', () => {
    it('should distribute funds from approved pool request', async () => {
      const mockResult = {
        id: 'request-123',
        status: RequestStatus.DISTRIBUTED,
        distributedAmount: 500,
      };

      service.distributePoolRequest.mockResolvedValue(mockResult);

      const result = await controller.distributeRequest('request-123');

      expect(service.distributePoolRequest).toHaveBeenCalledWith('request-123');
      expect(result.success).toBe(true);
      expect(result.message).toContain('distribuidos');
    });
  });

  describe('Security - Protected Endpoints', () => {
    it('should have ADMIN guard on getMetrics', () => {
      const metadata = Reflect.getMetadata('roles', controller.getMetrics);
      expect(metadata).toContain(UserRole.ADMIN);
    });

    it('should have ADMIN guard on getGiniIndex', () => {
      const metadata = Reflect.getMetadata('roles', controller.getGiniIndex);
      expect(metadata).toContain(UserRole.ADMIN);
    });

    it('should have ADMIN guard on getMetricsHistory', () => {
      const metadata = Reflect.getMetadata('roles', controller.getMetricsHistory);
      expect(metadata).toContain(UserRole.ADMIN);
    });

    it('should have ADMIN guard on approveRequest', () => {
      const metadata = Reflect.getMetadata('roles', controller.approveRequest);
      expect(metadata).toContain(UserRole.ADMIN);
    });

    it('should have ADMIN guard on rejectRequest', () => {
      const metadata = Reflect.getMetadata('roles', controller.rejectRequest);
      expect(metadata).toContain(UserRole.ADMIN);
    });

    it('should have ADMIN guard on distributeRequest', () => {
      const metadata = Reflect.getMetadata('roles', controller.distributeRequest);
      expect(metadata).toContain(UserRole.ADMIN);
    });

    it('should have JWT guard (no roles) on sendWithFlowMultiplier', () => {
      const metadata = Reflect.getMetadata(
        'roles',
        controller.sendWithFlowMultiplier
      );
      expect(metadata).toBeUndefined(); // Just JWT auth, no specific roles
    });

    it('should have JWT guard (no roles) on createPoolRequest', () => {
      const metadata = Reflect.getMetadata('roles', controller.createPoolRequest);
      expect(metadata).toBeUndefined();
    });
  });
});
