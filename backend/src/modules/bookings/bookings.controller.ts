import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  NotImplementedException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ConfirmBookingDto } from './dto/confirm-booking.dto';
import { RejectBookingDto } from './dto/reject-booking.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';
import { AvailableSlotsDto } from './dto/available-slots.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole, BookingStatus } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

type BookingQueryFilters = {
  customerId?: string;
  girlId?: string;
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
};

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiResponse({ status: 201, description: 'Booking created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({
    status: 404,
    description: 'Girl or service package not found',
  })
  create(
    @CurrentUser('id') userId: string,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return this.bookingsService.create(userId, createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bookings with filters' })
  @ApiResponse({ status: 200, description: 'List of bookings' })
  findAll(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
    @Query('status') status?: BookingStatus,
    @Query('customerId') customerId?: string,
    @Query('girlId') girlId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    // Customers can only see their own bookings
    // Girls can only see their own bookings
    // Admins can see all
    const filters: BookingQueryFilters = {};

    if (userRole === UserRole.CUSTOMER) {
      filters.customerId = userId;
    } else if (userRole === UserRole.GIRL) {
      // Get girl ID from user
      filters.girlId = girlId; // Will need to get from girl relation
    }

    if (status) {
      filters.status = status;
    }

    if (customerId && userRole === UserRole.ADMIN) {
      filters.customerId = customerId;
    }

    if (girlId && (userRole === UserRole.ADMIN || userRole === UserRole.GIRL)) {
      filters.girlId = girlId;
    }

    if (startDate) {
      filters.startDate = new Date(startDate);
    }

    if (endDate) {
      filters.endDate = new Date(endDate);
    }

    return this.bookingsService.findAll(filters);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get current user bookings' })
  @ApiResponse({ status: 200, description: 'List of user bookings' })
  findMyBookings(
    @CurrentUser('id') userId: string,
    @CurrentUser('role') userRole: UserRole,
  ) {
    const filters: BookingQueryFilters = {};

    if (userRole === UserRole.CUSTOMER) {
      filters.customerId = userId;
    } else if (userRole === UserRole.GIRL) {
      filters.girlId = userId; // This will need adjustment to get girl.id from user
    }

    return this.bookingsService.findAll(filters);
  }

  @Get('girl/:girlId')
  @ApiOperation({ summary: 'Get bookings for a specific girl' })
  @ApiResponse({ status: 200, description: 'List of bookings for girl' })
  findGirlBookings(@Param('girlId') girlId: string) {
    return this.bookingsService.findAll({ girlId });
  }

  @Get('available-slots')
  @ApiOperation({ summary: 'Get available time slots for a girl' })
  @ApiResponse({ status: 200, description: 'List of available time slots' })
  getAvailableSlots(@Query() query: AvailableSlotsDto) {
    return this.bookingsService.getAvailableSlots(
      query.girlId,
      query.startDate,
      query.endDate,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  @ApiResponse({ status: 200, description: 'Booking details' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking (only pending bookings)' })
  @ApiResponse({ status: 200, description: 'Booking updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    return this.bookingsService.update(id, userId, updateBookingDto);
  }

  @Post(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiOperation({ summary: 'Confirm booking (Girl only)' })
  @ApiResponse({ status: 200, description: 'Booking confirmed' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  confirm(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() confirmDto: ConfirmBookingDto,
  ) {
    return this.bookingsService.confirm(id, userId, confirmDto.notes);
  }

  @Post(':id/reject')
  @UseGuards(RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiOperation({ summary: 'Reject booking (Girl only)' })
  @ApiResponse({ status: 200, description: 'Booking rejected' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  reject(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() rejectDto: RejectBookingDto,
  ) {
    return this.bookingsService.reject(id, userId, rejectDto.reason);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel booking (Customer or Girl)' })
  @ApiResponse({ status: 200, description: 'Booking cancelled' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  cancel(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() cancelDto: CancelBookingDto,
  ) {
    return this.bookingsService.cancel(id, userId, cancelDto.reason);
  }

  @Post(':id/complete')
  @UseGuards(RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiOperation({ summary: 'Mark booking as completed (Girl only)' })
  @ApiResponse({ status: 200, description: 'Booking completed' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  complete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.bookingsService.complete(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete booking (only pending bookings)' })
  @ApiResponse({ status: 200, description: 'Booking deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string): never {
    throw new NotImplementedException(
      `Delete not implemented for booking ${id} (user ${userId}). Use cancel instead.`,
    );
  }
}
