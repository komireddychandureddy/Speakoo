import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { FeedbackRepository } from './feedback.repository';
import { CreateFeedbackDto } from './dto/create-feedback.dto';

const mockRepo = {
  createFeedback: jest.fn(),
  upsertPointsAndAwardBadges: jest.fn(),
};

describe('FeedbackService', () => {
  let service: FeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        { provide: FeedbackRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
    jest.clearAllMocks();
  });

  describe('submitFeedback', () => {
    it('calls createFeedback and upsertPointsAndAwardBadges', async () => {
      const feedback = { id: 'f1', reviewerId: 'l1', bookingId: 'b1', rating: 5 };
      mockRepo.createFeedback.mockResolvedValue(feedback);
      mockRepo.upsertPointsAndAwardBadges.mockResolvedValue({ points: 10, badges: [] });

      const dto: CreateFeedbackDto = { bookingId: 'b1', rating: 5, comment: 'Great session' };
      const result = await service.submitFeedback('l1', dto);

      expect(mockRepo.createFeedback).toHaveBeenCalledWith('l1', dto);
      expect(mockRepo.upsertPointsAndAwardBadges).toHaveBeenCalledWith('l1');
      expect(result).toBe(feedback);
    });

    it('returns feedback from createFeedback', async () => {
      const feedback = { id: 'f2', rating: 4 };
      mockRepo.createFeedback.mockResolvedValue(feedback);
      mockRepo.upsertPointsAndAwardBadges.mockResolvedValue(null);

      const result = await service.submitFeedback('l1', { bookingId: 'b2', rating: 4 });

      expect(result).toBe(feedback);
    });
  });
});
