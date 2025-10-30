import { ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: any;

  beforeEach(() => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    service = new UsersService(prismaService);
  });

  describe('update', () => {
    const mockUser = {
      id: 'user-123',
      email: 'user@test.com',
      name: 'Test User',
      role: UserRole.CITIZEN,
    };

    const mockAdmin = {
      id: 'admin-123',
      email: 'admin@test.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
    };

    const updateData = {
      name: 'Updated Name',
      bio: 'Updated bio',
    };

    it('should allow user to update their own profile', async () => {
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await service.update('user-123', 'user-123', updateData);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: updateData,
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should throw ForbiddenException when non-admin tries to update another profile', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.update('user-456', 'user-123', updateData)
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.update('user-456', 'user-123', updateData)
      ).rejects.toThrow('You can only update your own profile');
    });

    it('should allow admin to update any profile', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockAdmin);
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      const result = await service.update('user-456', 'admin-123', updateData);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'admin-123' },
        select: { role: true },
      });
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-456' },
        data: updateData,
      });
      expect(result.name).toBe('Updated Name');
    });

    it('should throw ForbiddenException when merchant tries to update another profile', async () => {
      const mockMerchant = {
        id: 'merchant-123',
        role: UserRole.MERCHANT,
      };

      prismaService.user.findUnique.mockResolvedValue(mockMerchant);

      await expect(
        service.update('user-456', 'merchant-123', updateData)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when requesting user is not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.update('user-456', 'nonexistent-123', updateData)
      ).rejects.toThrow(ForbiddenException);
    });

    it('should not check permissions when user updates own profile', async () => {
      prismaService.user.update.mockResolvedValue({
        ...mockUser,
        ...updateData,
      });

      await service.update('user-123', 'user-123', updateData);

      // Should not call findUnique to check permissions
      expect(prismaService.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
    it('should return user profile with selected fields', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'user@test.com',
        name: 'Test User',
        bio: 'Bio text',
        avatar: 'avatar.jpg',
        role: UserRole.CITIZEN,
        credits: 100,
        level: 2,
      };

      prismaService.user.findUnique.mockResolvedValue(mockProfile);

      const result = await service.getProfile('user-123');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        select: expect.objectContaining({
          id: true,
          email: true,
          name: true,
          bio: true,
          avatar: true,
          role: true,
          credits: true,
          level: true,
        }),
      });
      expect(result).toEqual(mockProfile);
    });
  });

  describe('searchByEmail', () => {
    it('should find user by email (case insensitive)', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        name: 'Test User',
        avatar: 'avatar.jpg',
        credits: 100,
      };

      prismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.searchByEmail('USER@TEST.COM');

      expect(prismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          email: {
            equals: 'USER@TEST.COM',
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          credits: true,
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return user with skills and badges', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        name: 'Test User',
        skills: [
          { id: 'skill-1', name: 'JavaScript' },
          { id: 'skill-2', name: 'TypeScript' },
        ],
        badges: [
          { id: 'badge-1', name: 'Helper' },
        ],
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne('user-123');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          skills: true,
          badges: true,
        },
      });
      expect(result).toEqual(mockUser);
      expect(result.skills).toHaveLength(2);
      expect(result.badges).toHaveLength(1);
    });
  });

  describe('findByEmail', () => {
    it('should return user by exact email', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'user@test.com',
        name: 'Test User',
      };

      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('user@test.com');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'user@test.com' },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
