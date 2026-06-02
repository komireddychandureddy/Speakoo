import { Injectable } from '@nestjs/common';
import { TutorsRepository } from './tutors.repository';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { SearchTutorsDto } from './dto/search-tutors.dto';

@Injectable()
export class TutorsService {
  constructor(private readonly tutorsRepository: TutorsRepository) {}

  private toTimezoneIso(date: Date, timezone?: string): string {
    if (!timezone) return date.toISOString();
    try {
      const local = new Intl.DateTimeFormat('sv-SE', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(date);
      return local.replace(' ', 'T');
    } catch {
      return date.toISOString();
    }
  }

  private mapSlotsWithTimezone<T extends { startTime: Date; endTime: Date }>(
    slots: T[],
    timezone?: string,
  ) {
    return slots.map((slot) => ({
      ...slot,
      startTimeLocal: this.toTimezoneIso(slot.startTime, timezone),
      endTimeLocal: this.toTimezoneIso(slot.endTime, timezone),
      timezone: timezone ?? 'UTC',
    }));
  }

  upsertProfile(userId: string, dto: CreateTutorProfileDto) {
    return this.tutorsRepository.upsertProfile(userId, dto);
  }

  getMyProfile(userId: string) {
    return this.tutorsRepository.findProfileByUserId(userId);
  }

  createSlot(userId: string, dto: CreateAvailabilitySlotDto) {
    return this.tutorsRepository.createSlot(userId, dto);
  }

  async getMySlots(userId: string, timezone?: string) {
    const slots = await this.tutorsRepository.findAvailableSlots(userId);
    return this.mapSlotsWithTimezone(slots, timezone);
  }

  searchTutors(dto: SearchTutorsDto) {
    return this.tutorsRepository.searchTutors(dto);
  }

  getPublicTutorProfile(userId: string) {
    return this.tutorsRepository.findPublicTutorProfile(userId);
  }

  async getPublicSlots(userId: string, timezone?: string) {
    const slots = await this.tutorsRepository.findPublicSlots(userId);
    return this.mapSlotsWithTimezone(slots, timezone);
  }
}
