import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-v4'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    password: '$2b$10$hashedpassword',
    phone: '123456789',
    avatar: null,
    bio: null,
    role: 'CITIZEN' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null,
    emailVerified: false,
    phoneVerified: false,
    onboardingCompleted: false,
    did: null,
  };

  const mockUserWithoutPassword = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    phone: '123456789',
    avatar: null,
    bio: null,
    role: 'CITIZEN' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLogin: null,
    emailVerified: false,
    phoneVerified: false,
    onboardingCompleted: false,
    did: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get(PrismaService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(result).toEqual(mockUserWithoutPassword);
      expect(result.password).toBeUndefined();
    });

    it('should throw UnauthorizedException when user not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser('nonexistent@example.com', 'password123'),
      ).rejects.toThrow(UnauthorizedException);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'nonexistent@example.com' },
      });
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.validateUser('test@example.com', 'wrongpassword'),
      ).rejects.toThrow(UnauthorizedException);

      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
    });
  });

  describe('login', () => {
    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_refresh_token');
      prismaService.refreshToken.create.mockResolvedValue({
        id: 'refresh-token-id',
        token: 'hashed_refresh_token',
        userId: mockUserWithoutPassword.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        revokedAt: null,
      });
    });

    it('should return access token, refresh token and user data', async () => {
      const mockToken = 'jwt.token.here';
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.login(mockUserWithoutPassword);

      expect(jwtService.sign).toHaveBeenCalled();
      expect(prismaService.refreshToken.create).toHaveBeenCalled();
      expect(result).toHaveProperty('access_token', mockToken);
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user', mockUserWithoutPassword);
    });

    it('should create JWT payload with correct structure', async () => {
      const mockToken = 'jwt.token.here';
      jwtService.sign.mockReturnValue(mockToken);

      await service.login(mockUserWithoutPassword);

      const payload = jwtService.sign.mock.calls[0][0];
      expect(payload).toHaveProperty('email');
      expect(payload).toHaveProperty('sub');
      expect(payload).toHaveProperty('role');
    });

    it('should store hashed refresh token in database', async () => {
      const mockToken = 'jwt.token.here';
      jwtService.sign.mockReturnValue(mockToken);

      await service.login(mockUserWithoutPassword);

      expect(prismaService.refreshToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: mockUserWithoutPassword.id,
          token: expect.any(String),
          expiresAt: expect.any(Date),
        }),
      });
    });
  });

  describe('register', () => {
    const registerDto = {
      email: 'newuser@example.com',
      password: 'password123',
      name: 'New User',
      phone: '987654321',
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password_or_token');
      prismaService.refreshToken.create.mockResolvedValue({
        id: 'refresh-token-id',
        token: 'hashed_refresh_token',
        userId: '456',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        revokedAt: null,
      });
    });

    it('should create user with hashed password', async () => {
      const hashedPassword = '$2b$10$newhashed';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const newUser = {
        ...mockUser,
        id: '456',
        email: registerDto.email,
        name: registerDto.name,
        phone: registerDto.phone,
        password: hashedPassword,
      };

      prismaService.user.create.mockResolvedValue(newUser);
      jwtService.sign.mockReturnValue('new.jwt.token');

      const result = await service.register(registerDto);

      expect(bcrypt.hash).toHaveBeenCalled(); // Called for both password and refresh token
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...registerDto,
          password: expect.any(String),
        },
      });
      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
      expect(result.user.password).toBeUndefined();
    });

    it('should return login response after registration', async () => {
      const hashedPassword = '$2b$10$newhashed';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const newUser = {
        ...mockUser,
        id: '456',
        email: registerDto.email,
        name: registerDto.name,
        phone: registerDto.phone,
        password: hashedPassword,
      };

      prismaService.user.create.mockResolvedValue(newUser);
      const mockToken = 'new.jwt.token';
      jwtService.sign.mockReturnValue(mockToken);

      const result = await service.register(registerDto);

      expect(result.access_token).toBe(mockToken);
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.name).toBe(registerDto.name);
    });

    it('should handle registration without optional phone', async () => {
      const registerDtoWithoutPhone = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
      };

      const hashedPassword = '$2b$10$newhashed';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const newUser = {
        ...mockUser,
        id: '456',
        email: registerDtoWithoutPhone.email,
        name: registerDtoWithoutPhone.name,
        phone: null,
        password: hashedPassword,
      };

      prismaService.user.create.mockResolvedValue(newUser);
      jwtService.sign.mockReturnValue('new.jwt.token');

      const result = await service.register(registerDtoWithoutPhone);

      expect(result).toHaveProperty('access_token');
      expect(result.user.phone).toBeNull();
    });
  });

  describe('security', () => {
    it('should never expose password in validateUser result', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).not.toHaveProperty('password');
    });

    it('should never expose password in register result', async () => {
      const hashedPassword = '$2b$10$newhashed';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const newUser = {
        ...mockUser,
        password: hashedPassword,
      };

      prismaService.user.create.mockResolvedValue(newUser);
      jwtService.sign.mockReturnValue('jwt.token');

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('refreshAccessToken', () => {
    const mockRefreshToken = 'valid-refresh-token-uuid';
    const mockStoredToken = {
      id: 'stored-token-id',
      token: 'hashed_refresh_token',
      userId: mockUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      revokedAt: null,
      user: mockUser,
    };

    beforeEach(() => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('new_hashed_refresh_token');
      prismaService.refreshToken.create.mockResolvedValue({
        id: 'new-refresh-token-id',
        token: 'new_hashed_refresh_token',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        revokedAt: null,
      });
    });

    it('should refresh tokens successfully with valid refresh token', async () => {
      prismaService.refreshToken.findMany.mockResolvedValue([mockStoredToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('new-access-token');
      prismaService.refreshToken.update.mockResolvedValue({
        ...mockStoredToken,
        revokedAt: new Date(),
      });

      const result = await service.refreshAccessToken(mockRefreshToken);

      expect(result).toHaveProperty('access_token', 'new-access-token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should revoke old refresh token (token rotation)', async () => {
      prismaService.refreshToken.findMany.mockResolvedValue([mockStoredToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('new-access-token');
      prismaService.refreshToken.update.mockResolvedValue({
        ...mockStoredToken,
        revokedAt: new Date(),
      });

      await service.refreshAccessToken(mockRefreshToken);

      expect(prismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: mockStoredToken.id },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should create new refresh token', async () => {
      prismaService.refreshToken.findMany.mockResolvedValue([mockStoredToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('new-access-token');
      prismaService.refreshToken.update.mockResolvedValue({
        ...mockStoredToken,
        revokedAt: new Date(),
      });

      await service.refreshAccessToken(mockRefreshToken);

      expect(prismaService.refreshToken.create).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      prismaService.refreshToken.findMany.mockResolvedValue([mockStoredToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.refreshAccessToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for expired refresh token', async () => {
      const expiredToken = {
        ...mockStoredToken,
        expiresAt: new Date(Date.now() - 1000), // expired
      };
      prismaService.refreshToken.findMany.mockResolvedValue([expiredToken]);

      await expect(
        service.refreshAccessToken(mockRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for revoked refresh token', async () => {
      const revokedToken = {
        ...mockStoredToken,
        revokedAt: new Date(),
      };
      prismaService.refreshToken.findMany.mockResolvedValue([revokedToken]);

      await expect(
        service.refreshAccessToken(mockRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('revokeRefreshToken', () => {
    const mockRefreshToken = 'valid-refresh-token-uuid';
    const mockStoredToken = {
      id: 'stored-token-id',
      token: 'hashed_refresh_token',
      userId: mockUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      revokedAt: null,
    };

    it('should revoke refresh token successfully', async () => {
      prismaService.refreshToken.findMany.mockResolvedValue([mockStoredToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      prismaService.refreshToken.update.mockResolvedValue({
        ...mockStoredToken,
        revokedAt: new Date(),
      });

      await service.revokeRefreshToken(mockRefreshToken);

      expect(prismaService.refreshToken.update).toHaveBeenCalledWith({
        where: { id: mockStoredToken.id },
        data: { revokedAt: expect.any(Date) },
      });
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      prismaService.refreshToken.findMany.mockResolvedValue([mockStoredToken]);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.revokeRefreshToken('invalid-token'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should delete expired tokens', async () => {
      prismaService.refreshToken.deleteMany.mockResolvedValue({ count: 5 });

      const result = await service.cleanupExpiredTokens();

      expect(prismaService.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });
      expect(result).toBe(5);
    });

    it('should return 0 when no expired tokens', async () => {
      prismaService.refreshToken.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.cleanupExpiredTokens();

      expect(result).toBe(0);
    });
  });
});
