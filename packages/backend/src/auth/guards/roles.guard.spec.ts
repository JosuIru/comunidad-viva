import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '@prisma/client';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const createMockExecutionContext = (user?: any): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as any;
  };

  describe('canActivate', () => {
    it('should allow access when no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
      const context = createMockExecutionContext({ role: UserRole.CITIZEN });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
      const context = createMockExecutionContext({ role: UserRole.ADMIN });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow access when user has one of multiple required roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        UserRole.ADMIN,
        UserRole.MERCHANT,
      ]);
      const context = createMockExecutionContext({ role: UserRole.MERCHANT });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should deny access when user does not have required role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
      const context = createMockExecutionContext({ role: UserRole.CITIZEN });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow(
        'Access denied. Required roles: ADMIN'
      );
    });

    it('should deny access when user is not authenticated', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
      const context = createMockExecutionContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('User not authenticated');
    });

    it('should deny access when user object exists but has no role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
      const context = createMockExecutionContext({});

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should work with CITIZEN role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.CITIZEN]);
      const context = createMockExecutionContext({ role: UserRole.CITIZEN });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should work with MERCHANT role', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.MERCHANT]);
      const context = createMockExecutionContext({ role: UserRole.MERCHANT });

      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should provide clear error message with multiple required roles', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([
        UserRole.ADMIN,
        UserRole.MERCHANT,
      ]);
      const context = createMockExecutionContext({ role: UserRole.CITIZEN });

      expect(() => guard.canActivate(context)).toThrow(
        'Access denied. Required roles: ADMIN, MERCHANT'
      );
    });
  });
});
