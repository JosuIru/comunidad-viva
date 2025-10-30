import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let analyticsService: any;

  beforeEach(async () => {
    analyticsService = {
      getCommunityMetrics: jest.fn(),
      getUserMetrics: jest.fn(),
      getTimeSeriesMetrics: jest.fn(),
      exportMetricsCSV: jest.fn(),
      getUserStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        {
          provide: AnalyticsService,
          useValue: analyticsService,
        },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCommunityMetrics', () => {
    it('should call service with correct parameters', async () => {
      const mockMetrics = {
        totalUsers: 100,
        totalTransactions: 500,
        totalCreditsCirculating: 10000,
      };

      analyticsService.getCommunityMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getCommunityMetrics(
        '2025-01-01',
        '2025-10-30',
        'community-123'
      );

      expect(analyticsService.getCommunityMetrics).toHaveBeenCalledWith({
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-10-30'),
        communityId: 'community-123',
      });
      expect(result).toEqual(mockMetrics);
    });

    it('should handle undefined dates', async () => {
      const mockMetrics = { totalUsers: 100 };
      analyticsService.getCommunityMetrics.mockResolvedValue(mockMetrics);

      await controller.getCommunityMetrics();

      expect(analyticsService.getCommunityMetrics).toHaveBeenCalledWith({
        startDate: undefined,
        endDate: undefined,
        communityId: undefined,
      });
    });
  });

  describe('getUserMetrics', () => {
    it('should call service with user ID from request', async () => {
      const mockRequest = {
        user: {
          userId: 'user-123',
          role: UserRole.CITIZEN,
        },
      };

      const mockMetrics = {
        totalCreditsEarned: 500,
        totalCreditsSpent: 200,
        netImpact: 300,
      };

      analyticsService.getUserMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getUserMetrics(
        mockRequest,
        '2025-01-01',
        '2025-10-30'
      );

      expect(analyticsService.getUserMetrics).toHaveBeenCalledWith(
        'user-123',
        {
          startDate: new Date('2025-01-01'),
          endDate: new Date('2025-10-30'),
        }
      );
      expect(result).toEqual(mockMetrics);
    });
  });

  describe('getTimeSeriesMetrics', () => {
    it('should call service with interval parameter', async () => {
      const mockTimeSeries = {
        data: [
          { date: '2025-10-01', value: 100 },
          { date: '2025-10-02', value: 150 },
        ],
      };

      analyticsService.getTimeSeriesMetrics.mockResolvedValue(mockTimeSeries);

      const result = await controller.getTimeSeriesMetrics(
        '2025-10-01',
        '2025-10-30',
        'day'
      );

      expect(analyticsService.getTimeSeriesMetrics).toHaveBeenCalledWith({
        startDate: new Date('2025-10-01'),
        endDate: new Date('2025-10-30'),
        interval: 'day',
      });
      expect(result).toEqual(mockTimeSeries);
    });

    it('should handle week and month intervals', async () => {
      analyticsService.getTimeSeriesMetrics.mockResolvedValue({ data: [] });

      await controller.getTimeSeriesMetrics(undefined, undefined, 'week');
      expect(analyticsService.getTimeSeriesMetrics).toHaveBeenCalledWith({
        startDate: undefined,
        endDate: undefined,
        interval: 'week',
      });

      await controller.getTimeSeriesMetrics(undefined, undefined, 'month');
      expect(analyticsService.getTimeSeriesMetrics).toHaveBeenCalledWith({
        startDate: undefined,
        endDate: undefined,
        interval: 'month',
      });
    });
  });

  describe('exportMetricsCSV', () => {
    it('should export CSV with correct headers', async () => {
      const mockCSV = 'date,users,transactions\n2025-10-01,100,500';
      analyticsService.exportMetricsCSV.mockResolvedValue(mockCSV);

      const mockResponse = {
        setHeader: jest.fn(),
        send: jest.fn(),
      };

      await controller.exportMetricsCSV(
        mockResponse as any,
        '2025-01-01',
        '2025-10-30',
        'community-123'
      );

      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Type',
        'text/csv'
      );
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=community-metrics.csv'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockCSV);
    });
  });

  describe('getUserStats', () => {
    it('should call service with user ID', async () => {
      const mockRequest = {
        user: {
          userId: 'user-123',
          role: UserRole.CITIZEN,
        },
      };

      const mockStats = {
        level: 5,
        credits: 1000,
        experience: 5000,
      };

      analyticsService.getUserStats.mockResolvedValue(mockStats);

      const result = await controller.getUserStats(mockRequest);

      expect(analyticsService.getUserStats).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockStats);
    });
  });

  describe('Security - Protected Endpoints', () => {
    it('should have ADMIN guard on getCommunityMetrics', () => {
      const metadata = Reflect.getMetadata(
        'roles',
        controller.getCommunityMetrics
      );
      expect(metadata).toContain(UserRole.ADMIN);
    });

    it('should have ADMIN guard on getTimeSeriesMetrics', () => {
      const metadata = Reflect.getMetadata(
        'roles',
        controller.getTimeSeriesMetrics
      );
      expect(metadata).toContain(UserRole.ADMIN);
    });

    it('should have ADMIN guard on exportMetricsCSV', () => {
      const metadata = Reflect.getMetadata(
        'roles',
        controller.exportMetricsCSV
      );
      expect(metadata).toContain(UserRole.ADMIN);
    });

    it('should have JWT guard on getUserMetrics', () => {
      // getUserMetrics should be protected with JwtAuthGuard only
      const rolesMetadata = Reflect.getMetadata(
        'roles',
        controller.getUserMetrics
      );
      expect(rolesMetadata).toBeUndefined(); // No specific roles, just JWT auth
    });
  });
});
