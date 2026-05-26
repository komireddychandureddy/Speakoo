import { Controller, Get, Post, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { PracticeService } from './practice.service';
import { CreatePracticeSessionDto } from './dto/create-practice-session.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('practice-sessions')
export class PracticeController {
  constructor(private readonly practiceService: PracticeService) {}

  @Get()
  list(@Query('language') language?: string) {
    return this.practiceService.list(language);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.practiceService.getById(id);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreatePracticeSessionDto) {
    return this.practiceService.create(user.id, dto);
  }

  @Post(':id/join')
  join(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.practiceService.join(id, user.id);
  }

  @Delete(':id/leave')
  leave(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.practiceService.leave(id, user.id);
  }
}
