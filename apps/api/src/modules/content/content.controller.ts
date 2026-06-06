import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ContentService } from './content.service';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Public()
  @Get('faqs')
  listFaqItems() {
    return this.contentService.listFaqItems();
  }

  @Public()
  @Get('resources')
  listResources(@Query('category') category?: string) {
    return this.contentService.listResources(category);
  }

  @Public()
  @Get('practice-readings')
  listPracticeReadings(@Query('level') level?: string) {
    return this.contentService.listPracticeReadings(level);
  }

  @Public()
  @Get('practice-exercises')
  listPracticeExerciseContent(@Query('mode') mode?: string) {
    return this.contentService.listPracticeExerciseContent(mode);
  }
}
