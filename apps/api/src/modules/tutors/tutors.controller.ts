import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TutorsService } from './tutors.service';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { CreateAvailabilitySlotDto } from './dto/create-availability-slot.dto';
import { SearchTutorsDto } from './dto/search-tutors.dto';
import { SlotsQueryDto } from './dto/slots-query.dto';
import { SubmitKycDto } from './dto/submit-kyc.dto';
import { ListKycDto } from './dto/list-kyc.dto';
import { ReviewKycDto } from './dto/review-kyc.dto';
import { RecommendTutorsDto } from './dto/recommend-tutors.dto';
import { CreatePublicTutorApplicationDto } from './dto/create-public-tutor-application.dto';
import { CreateBulkSlotsDto } from './dto/create-bulk-slots.dto';
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
  @Post('applications')
  submitPublicApplication(@Body() dto: CreatePublicTutorApplicationDto) {
    return this.tutorsService.submitPublicApplication(dto);
  }

  @Roles('learner')
  @Get('recommendations/me')
  getRecommendations(@CurrentUser() user: User, @Query() dto: RecommendTutorsDto) {
    return this.tutorsService.getRecommendationsForLearner(user.id, dto);
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
  @Delete('slots/:id')
  deleteSlot(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.tutorsService.deleteSlot(user.id, id);
  }

  @Roles('tutor')
  @Post('slots/bulk')
  createBulkSlots(@CurrentUser() user: User, @Body() dto: CreateBulkSlotsDto) {
    return this.tutorsService.createBulkSlots(user.id, dto);
  }

  @Roles('tutor')
  @Get('slots')
  getMySlots(@CurrentUser() user: User, @Query() query: SlotsQueryDto) {
    return this.tutorsService.getMySlots(user.id, query.timezone);
  }

  @Roles('tutor')
  @Post('kyc/submissions')
  submitKyc(@CurrentUser() user: User, @Body() dto: SubmitKycDto) {
    return this.tutorsService.submitKyc(user.id, dto);
  }

  @Roles('tutor')
  @Get('kyc/submissions/me')
  getMyKycSubmissions(@CurrentUser() user: User) {
    return this.tutorsService.getMyKycSubmissions(user.id);
  }

  @Roles('admin')
  @Get('kyc/submissions')
  listKycSubmissions(@Query() query: ListKycDto) {
    return this.tutorsService.listKycForAdmin(query);
  }

  @Roles('admin')
  @Post('kyc/submissions/:id/review')
  reviewKycSubmission(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: ReviewKycDto,
  ) {
    return this.tutorsService.reviewKycSubmission(id, user.id, dto);
  }

  @Public()
  @Get(':id/slots')
  getPublicSlots(@Param('id', ParseUUIDPipe) id: string, @Query() query: SlotsQueryDto) {
    return this.tutorsService.getPublicSlots(id, query.timezone);
  }

  @Public()
  @Get(':id')
  getPublicProfile(@Param('id', ParseUUIDPipe) id: string) {
    return this.tutorsService.getPublicTutorProfile(id);
  }
}
