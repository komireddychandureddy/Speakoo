import { Module } from '@nestjs/common';
import { SafetyController } from './safety.controller';
import { SafetyRepository } from './safety.repository';
import { SafetyService } from './safety.service';

@Module({
  controllers: [SafetyController],
  providers: [SafetyService, SafetyRepository],
})
export class SafetyModule {}
