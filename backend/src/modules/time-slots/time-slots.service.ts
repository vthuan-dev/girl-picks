import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';

@Injectable()
export class TimeSlotsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createTimeSlotDto: CreateTimeSlotDto) {
    // Get girl from user
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl) {
      throw new ForbiddenException('Only girls can create time slots');
    }

    // Validate time range
    const [startHours, startMinutes] = createTimeSlotDto.startTime.split(':').map(Number);
    const [endHours, endMinutes] = createTimeSlotDto.endTime.split(':').map(Number);
    const startTotal = startHours * 60 + startMinutes;
    const endTotal = endHours * 60 + endMinutes;

    if (endTotal <= startTotal) {
      throw new BadRequestException('End time must be after start time');
    }

    // Check for overlapping time slots on the same day
    const existingSlots = await this.prisma.timeSlot.findMany({
      where: {
        girlId: girl.id,
        dayOfWeek: createTimeSlotDto.dayOfWeek,
        isAvailable: true,
      },
    });

    for (const slot of existingSlots) {
      const [existingStartHours, existingStartMinutes] = slot.startTime.split(':').map(Number);
      const [existingEndHours, existingEndMinutes] = slot.endTime.split(':').map(Number);
      const existingStartTotal = existingStartHours * 60 + existingStartMinutes;
      const existingEndTotal = existingEndHours * 60 + existingEndMinutes;

      // Check for overlap
      if (
        (startTotal >= existingStartTotal && startTotal < existingEndTotal) ||
        (endTotal > existingStartTotal && endTotal <= existingEndTotal) ||
        (startTotal <= existingStartTotal && endTotal >= existingEndTotal)
      ) {
        throw new BadRequestException('Time slot overlaps with existing slot');
      }
    }

    return this.prisma.timeSlot.create({
      data: {
        ...createTimeSlotDto,
        girlId: girl.id,
      },
    });
  }

  async findAll(girlId?: string, isAvailable?: boolean) {
    const where: any = {};

    if (girlId) {
      where.girlId = girlId;
    }

    if (isAvailable !== undefined) {
      where.isAvailable = isAvailable;
    }

    return this.prisma.timeSlot.findMany({
      where,
      include: {
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async findOne(id: string) {
    const timeSlot = await this.prisma.timeSlot.findUnique({
      where: { id },
      include: {
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!timeSlot) {
      throw new NotFoundException('Time slot not found');
    }

    return timeSlot;
  }

  async update(id: string, userId: string, updateTimeSlotDto: UpdateTimeSlotDto) {
    const timeSlot = await this.findOne(id);

    // Check if user is the girl who owns this time slot
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl || girl.id !== timeSlot.girlId) {
      throw new ForbiddenException('You can only update your own time slots');
    }

    // Validate time range if both times are provided
    if (updateTimeSlotDto.startTime && updateTimeSlotDto.endTime) {
      const [startHours, startMinutes] = updateTimeSlotDto.startTime.split(':').map(Number);
      const [endHours, endMinutes] = updateTimeSlotDto.endTime.split(':').map(Number);
      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;

      if (endTotal <= startTotal) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    return this.prisma.timeSlot.update({
      where: { id },
      data: updateTimeSlotDto,
    });
  }

  async remove(id: string, userId: string) {
    const timeSlot = await this.findOne(id);

    // Check if user is the girl who owns this time slot
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl || girl.id !== timeSlot.girlId) {
      throw new ForbiddenException('You can only delete your own time slots');
    }

    return this.prisma.timeSlot.delete({
      where: { id },
    });
  }
}

