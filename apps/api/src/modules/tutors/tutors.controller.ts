import { Controller, Post, Get, Body, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { TutorsService } from './tutors.service';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { SearchTutorsDto } from './dto/search-tutors.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { User } from '@prisma/client';

@Controller('tutors')
export class TutorsController {
  constructor(private readonly tutorsService: TutorsService) {}

  @Public()
  @Get()
  search(@Query() dto: SearchTutorsDto) {
    return this.tutorsService.searchTutors(dto);
  }

  @Public()
  @Get(':id')
  getPublicProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.tutorsService.getPublicTutorProfile(id);
  }

  @Roles('tutor')
  @Post('profile')
  upsertProfile(@CurrentUser() user: User, @Body() dto: CreateTutorProfileDto) {
    return this.tutorsService.upsertProfile(user.id, dto);
  }

  @Roles('tutor')
  @Get('profile')
  getMyProfile(@CurrentUser() user: User) {
    return this.tutorsService.getMyProfile(user.id);
  }

  @Roles('tutor')
  @Post('slots')
  createSlot(@CurrentUser() user: User, @Body() dto: CreateAvailabilitySlotDto) {
    return this.tutorsService.createSlot(user.id, dto);
  }

  @Roles('tutor')
  @Get('slots')
  getMySlots(@CurrentUser() user: User) {
    return this.tutorsService.getMySlots(user.id);
  }
}
