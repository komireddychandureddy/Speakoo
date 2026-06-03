import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  listUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('role') role?: string,
  ) {
    return this.adminService.listUsers(page, limit, role);
  }

  @Get('bookings')
  listBookings(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.adminService.listBookings(page, limit, status);
  }

  @Patch('bookings/:id/status')
  updateBookingStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.adminService.updateBookingStatus(id, dto.status);
  }

  @Patch('tutors/:id/approve')
  approveTutor(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.approveTutor(id);
  }

  @Patch('users/:id/suspend')
  suspendUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.suspendUser(id);
  }

  @Patch('users/:id/unsuspend')
  unsuspendUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.unsuspendUser(id);
  }
}
