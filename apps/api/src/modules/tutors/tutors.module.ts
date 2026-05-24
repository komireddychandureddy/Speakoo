import { Module } from '@nestjs/common';
import { TutorsController } from './tutors.controller';
import { TutorsService } from './tutors.service';
import { TutorsRepository } from './tutors.repository';

@Module({
  controllers: [TutorsController],
  providers: [TutorsService, TutorsRepository],
  exports: [TutorsService],
})
export class TutorsModule {}
