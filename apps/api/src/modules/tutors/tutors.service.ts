import { Injectable } from '@nestjs/common';
import { TutorsRepository } from './tutors.repository';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { SearchTutorsDto } from './dto/search-tutors.dto';

@Injectable()
export class TutorsService {
  constructor(private readonly tutorsRepository: TutorsRepository) {}

  upsertProfile(userId: string, dto: CreateTutorProfileDto) {
    return this.tutorsRepository.upsertProfile(userId, dto);
  }

  getMyProfile(userId: string) {
    return this.tutorsRepository.findProfileByUserId(userId);
  }

  createSlot(userId: string, dto: CreateAvailabilitySlotDto) {
    return this.tutorsRepository.createSlot(userId, dto);
  }

  getMySlots(userId: string) {
    return this.tutorsRepository.findAvailableSlots(userId);
  }

  searchTutors(dto: SearchTutorsDto) {
    return this.tutorsRepository.searchTutors(dto);
  }

  getPublicTutorProfile(userId: string) {
    return this.tutorsRepository.findPublicTutorProfile(userId);
  }
}
