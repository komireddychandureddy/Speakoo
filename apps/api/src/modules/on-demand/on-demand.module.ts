import { Module } from '@nestjs/common';
import { OnDemandController } from './on-demand.controller';
import { OnDemandService } from './on-demand.service';

@Module({
  controllers: [OnDemandController],
  providers: [OnDemandService],
})
export class OnDemandModule {}
