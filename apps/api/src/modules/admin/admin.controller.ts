import {
  Controller,
  Get,
  Patch,
  Param,
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { Roles } from '../auth/decorators/roles.decorator';

@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  listUsers(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.adminService.listUsers(page, limit);
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
