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
} from '@nestjs/common';
import { TimeSlotsService } from './time-slots.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Time Slots')
@ApiBearerAuth()
@Controller('time-slots')
@UseGuards(JwtAuthGuard)
export class TimeSlotsController {
  constructor(private readonly timeSlotsService: TimeSlotsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiOperation({ summary: 'Create a new time slot (Girl only)' })
  @ApiResponse({ status: 201, description: 'Time slot created' })
  @ApiResponse({
    status: 400,
    description: 'Bad request - overlapping or invalid time',
  })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createTimeSlotDto: CreateTimeSlotDto,
  ) {
    return this.timeSlotsService.create(userId, createTimeSlotDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all time slots' })
  @ApiResponse({ status: 200, description: 'List of time slots' })
  findAll(
    @Query('girlId') girlId?: string,
    @Query('isAvailable') isAvailable?: string,
  ) {
    return this.timeSlotsService.findAll(
      girlId,
      isAvailable === 'true'
        ? true
        : isAvailable === 'false'
          ? false
          : undefined,
    );
  }

  @Get('girl/:girlId')
  @ApiOperation({ summary: 'Get time slots by girl ID' })
  @ApiResponse({ status: 200, description: 'List of time slots for girl' })
  findGirlTimeSlots(@Param('girlId') girlId: string) {
    return this.timeSlotsService.findAll(girlId, true);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get time slot by ID' })
  @ApiResponse({ status: 200, description: 'Time slot details' })
  @ApiResponse({ status: 404, description: 'Time slot not found' })
  findOne(@Param('id') id: string) {
    return this.timeSlotsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiOperation({ summary: 'Update time slot (Girl only)' })
  @ApiResponse({ status: 200, description: 'Time slot updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateTimeSlotDto: UpdateTimeSlotDto,
  ) {
    return this.timeSlotsService.update(id, userId, updateTimeSlotDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.GIRL)
  @ApiOperation({ summary: 'Delete time slot (Girl only)' })
  @ApiResponse({ status: 200, description: 'Time slot deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.timeSlotsService.remove(id, userId);
  }
}
