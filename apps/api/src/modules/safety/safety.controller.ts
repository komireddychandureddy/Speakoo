import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateIncidentReportDto } from './dto/create-incident-report.dto';
import { QueryIncidentsDto } from './dto/query-incidents.dto';
import { TriageIncidentDto } from './dto/triage-incident.dto';
import { SafetyService } from './safety.service';

@Controller('safety/incidents')
export class SafetyController {
  constructor(private readonly safetyService: SafetyService) {}

  @Post()
  createIncident(@CurrentUser() user: User, @Body() dto: CreateIncidentReportDto) {
    return this.safetyService.createIncident(user.id, dto);
  }

  @Get('me')
  getMyIncidents(@CurrentUser() user: User) {
    return this.safetyService.getMyIncidents(user.id);
  }

  @Roles('admin')
  @Get()
  listIncidents(
    @Query() query: QueryIncidentsDto,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.safetyService.listIncidentsForAdmin({ ...query, page, limit });
  }

  @Roles('admin')
  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.safetyService.getIncidentById(id);
  }

  @Roles('admin')
  @Patch(':id/triage')
  triageIncident(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() dto: TriageIncidentDto,
  ) {
    return this.safetyService.triageIncident(id, user.id, dto);
  }
}
