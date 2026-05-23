import { Test, TestingModule } from '@nestjs/testing';
import { TutorsService } from './tutors.service';
import { TutorsRepository } from './tutors.repository';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { SearchTutorsDto } from './dto/search-tutors.dto';

const mockRepo = {
  upsertProfile: jest.fn(),
  findProfileByUserId: jest.fn(),
  createSlot: jest.fn(),
  findAvailableSlots: jest.fn(),
  searchTutors: jest.fn(),
  findPublicTutorProfile: jest.fn(),
};

describe('TutorsService', () => {
  let service: TutorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TutorsService,
        { provide: TutorsRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<TutorsService>(TutorsService);
    jest.clearAllMocks();
  });

  it('upsertProfile delegates to repository', async () => {
    const profile = { userId: 'u1', bio: 'Hello' };
    mockRepo.upsertProfile.mockResolvedValue(profile);

    const result = await service.upsertProfile('u1', { bio: 'Hello' } as unknown as CreateTutorProfileDto);

    expect(mockRepo.upsertProfile).toHaveBeenCalledWith('u1', { bio: 'Hello' });
    expect(result).toBe(profile);
  });

  it('getMyProfile delegates to repository', async () => {
    mockRepo.findProfileByUserId.mockResolvedValue({ userId: 'u1' });
    const result = await service.getMyProfile('u1');
    expect(mockRepo.findProfileByUserId).toHaveBeenCalledWith('u1');
    expect(result).toEqual({ userId: 'u1' });
  });

  it('createSlot delegates to repository', async () => {
    const slot = { id: 's1', tutorId: 'u1' };
    mockRepo.createSlot.mockResolvedValue(slot);

    const result = await service.createSlot('u1', { startsAt: new Date() } as unknown as CreateAvailabilitySlotDto);

    expect(mockRepo.createSlot).toHaveBeenCalledWith('u1', { startsAt: expect.any(Date) });
    expect(result).toBe(slot);
  });

  it('getMySlots delegates to repository', async () => {
    const slots = [{ id: 's1' }, { id: 's2' }];
    mockRepo.findAvailableSlots.mockResolvedValue(slots);

    const result = await service.getMySlots('u1');

    expect(mockRepo.findAvailableSlots).toHaveBeenCalledWith('u1');
    expect(result).toBe(slots);
  });

  it('searchTutors delegates to repository', async () => {
    const tutors = [{ id: 'u1' }];
    mockRepo.searchTutors.mockResolvedValue(tutors);

    const dto = { language: 'English', page: 1, limit: 10 } as unknown as SearchTutorsDto;
    const result = await service.searchTutors(dto);

    expect(mockRepo.searchTutors).toHaveBeenCalledWith(dto);
    expect(result).toBe(tutors);
  });

  it('getPublicTutorProfile delegates to repository', async () => {
    const tutorProfile = { userId: 'u1', bio: 'Expert' };
    mockRepo.findPublicTutorProfile.mockResolvedValue(tutorProfile);

    const result = await service.getPublicTutorProfile('u1');

    expect(mockRepo.findPublicTutorProfile).toHaveBeenCalledWith('u1');
    expect(result).toBe(tutorProfile);
  });
});
