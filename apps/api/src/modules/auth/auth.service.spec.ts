import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

jest.mock('bcrypt');
const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwt = { sign: jest.fn() };
const mockConfig = { getOrThrow: jest.fn() };

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('throws ConflictException if email is already taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-id' });

      await expect(
        service.register({ email: 'a@b.com', password: 'pass', displayName: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });

    it('creates user and returns tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      (bcryptMock.hash as jest.Mock).mockResolvedValue('hashed');
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        email: 'a@b.com',
        role: UserRole.learner,
        profile: { displayName: 'Test' },
      });
      mockConfig.getOrThrow.mockReturnValue('secret');
      mockJwt.sign.mockReturnValueOnce('access-token').mockReturnValueOnce('refresh-token');

      const result = await service.register({
        email: 'a@b.com',
        password: 'pass',
        displayName: 'Test',
      });

      expect(result).toEqual({ accessToken: 'access-token', refreshToken: 'refresh-token' });
      expect(bcryptMock.hash).toHaveBeenCalledWith('pass', 12);
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login({ email: 'x@x.com', password: 'pw' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('throws UnauthorizedException if password is wrong', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        passwordHash: 'stored',
        email: 'x@x.com',
        role: UserRole.learner,
      });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'x@x.com', password: 'wrong' })).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns tokens on valid credentials', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'u1',
        passwordHash: 'stored',
        email: 'x@x.com',
        role: UserRole.learner,
      });
      (bcryptMock.compare as jest.Mock).mockResolvedValue(true);
      mockConfig.getOrThrow.mockReturnValue('secret');
      mockJwt.sign.mockReturnValueOnce('access').mockReturnValueOnce('refresh');

      const result = await service.login({ email: 'x@x.com', password: 'correct' });
      expect(result).toEqual({ accessToken: 'access', refreshToken: 'refresh' });
    });
  });

  describe('refresh', () => {
    it('issues new tokens for valid user', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValue({
        id: 'u1',
        email: 'a@b.com',
        role: UserRole.tutor,
      });
      mockConfig.getOrThrow.mockReturnValue('secret');
      mockJwt.sign.mockReturnValueOnce('new-access').mockReturnValueOnce('new-refresh');

      const result = await service.refresh('u1');
      expect(result).toEqual({ accessToken: 'new-access', refreshToken: 'new-refresh' });
    });
  });
});
