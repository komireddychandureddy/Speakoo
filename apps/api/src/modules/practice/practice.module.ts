import { Module } from '@nestjs/common';
import { PracticeController } from './practice.controller';
import { PracticeService } from './practice.service';
import { PracticeRepository } from './practice.repository';

@Module({
  controllers: [PracticeController],
  providers: [PracticeService, PracticeRepository],
  exports: [PracticeService],
})
export class PracticeModule {}
