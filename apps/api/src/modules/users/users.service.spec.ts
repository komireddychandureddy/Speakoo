import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

const mockRepo = {
  findById: jest.fn(),
  updateProfile: jest.fn(),
  findPublicProfile: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: UsersRepository, useValue: mockRepo }],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('delegates to repository with userId', async () => {
      const user = { id: 'u1', email: 'a@b.com', profile: { displayName: 'Alice' } };
      mockRepo.findById.mockResolvedValue(user);

      const result = await service.getMe('u1');

      expect(mockRepo.findById).toHaveBeenCalledWith('u1');
      expect(result).toBe(user);
    });
  });

  describe('updateProfile', () => {
    it('delegates to repository with userId and dto', async () => {
      const updated = { displayName: 'Bob' };
      mockRepo.updateProfile.mockResolvedValue(updated);

      const result = await service.updateProfile('u1', { displayName: 'Bob' });

      expect(mockRepo.updateProfile).toHaveBeenCalledWith('u1', { displayName: 'Bob' });
      expect(result).toBe(updated);
    });
  });

  describe('getPublicProfile', () => {
    it('delegates to repository with userId', async () => {
      const profile = { id: 'u1', role: 'learner', profile: { displayName: 'Alice' } };
      mockRepo.findPublicProfile.mockResolvedValue(profile);

      const result = await service.getPublicProfile('u1');

      expect(mockRepo.findPublicProfile).toHaveBeenCalledWith('u1');
      expect(result).toBe(profile);
    });
  });
});
