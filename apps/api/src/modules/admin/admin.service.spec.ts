import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  tutorProfile: { update: jest.fn() },
  user: {
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    jest.clearAllMocks();
  });

  describe('approveTutor', () => {
    it('sets isApproved to true on TutorProfile', async () => {
      mockPrisma.tutorProfile.update.mockResolvedValue({ userId: 't1', isApproved: true });

      await service.approveTutor('t1');

      expect(mockPrisma.tutorProfile.update).toHaveBeenCalledWith({
        where: { userId: 't1' },
        data: { isApproved: true },
      });
    });
  });

  describe('suspendUser', () => {
    it('sets isVerified to false on User', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: 'u1', isVerified: false });

      await service.suspendUser('u1');

      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'u1' },
        data: { isVerified: false },
      });
    });
  });

  describe('listUsers', () => {
    it('returns paginated users with total count', async () => {
      const users = [{ id: 'u1' }, { id: 'u2' }];
      mockPrisma.user.findMany.mockResolvedValue(users);
      mockPrisma.user.count.mockResolvedValue(10);

      const result = await service.listUsers(2, 2);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 2, take: 2 }),
      );
      expect(result).toEqual({ data: users, total: 10, page: 2, limit: 2 });
    });

    it('defaults to page 1 limit 20', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      const result = await service.listUsers(1, 20);

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
      expect(result).toEqual({ data: [], total: 0, page: 1, limit: 20 });
    });
  });
});
