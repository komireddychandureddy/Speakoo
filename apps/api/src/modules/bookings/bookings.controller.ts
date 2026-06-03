import { Controller, Post, Get, Delete, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { User } from '@prisma/client';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Roles('learner')
  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateBookingDto) {
    return this.bookingsService.createBooking(user.id, dto);
  }

  @Get()
  @SkipThrottle()
  getMyBookings(@CurrentUser() user: User) {
    const role = user.role === 'tutor' ? 'tutor' : 'learner';
    return this.bookingsService.getMyBookings(user.id, role);
  }

  @Get(':id')
  @SkipThrottle()
  getById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.bookingsService.getBookingById(id, user.id, user.role);
  }

  @Roles('learner')
  @Delete(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.bookingsService.cancelBooking(id, user.id);
  }
}
