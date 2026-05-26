import { Controller, Get, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { CommunityService } from './community.service';
import { CreateThreadDto } from './dto/create-thread.dto';
import { CreateReplyDto } from './dto/create-reply.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@prisma/client';

@Controller('community/threads')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  list(@Query('language') language?: string, @Query('category') category?: string) {
    return this.communityService.listThreads(language, category);
  }

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateThreadDto) {
    return this.communityService.createThread(user.id, dto);
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.communityService.getThread(id);
  }

  @Post(':id/replies')
  addReply(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: CreateReplyDto,
  ) {
    return this.communityService.addReply(id, user.id, dto);
  }

  @Post(':id/like')
  like(@Param('id', ParseUUIDPipe) id: string) {
    return this.communityService.likeThread(id);
  }
}
