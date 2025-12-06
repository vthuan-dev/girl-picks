import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBlockedDateDto } from './dto/create-blocked-date.dto';

@Injectable()
export class BlockedDatesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBlockedDateDto: CreateBlockedDateDto) {
    // Get girl from user
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl) {
      throw new ForbiddenException('Only girls can block dates');
    }

    const blockDate = new Date(createBlockedDateDto.date);
    blockDate.setHours(0, 0, 0, 0);

    // Check if date is already blocked
    const existing = await this.prisma.blockedDate.findUnique({
      where: {
        girlId_date: {
          girlId: girl.id,
          date: blockDate,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Date is already blocked');
    }

    // Check if there are any confirmed bookings on this date
    const startOfDay = new Date(blockDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(blockDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingBookings = await this.prisma.booking.findFirst({
      where: {
        girlId: girl.id,
        status: {
          in: ['PENDING', 'CONFIRMED'],
        },
        bookingDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingBookings) {
      throw new BadRequestException('Cannot block date with existing bookings');
    }

    return this.prisma.blockedDate.create({
      data: {
        girlId: girl.id,
        date: blockDate,
        reason: createBlockedDateDto.reason,
      },
    });
  }

  async findAll(girlId?: string) {
    const where: Prisma.BlockedDateWhereInput = {};

    if (girlId) {
      where.girlId = girlId;
    }

    return this.prisma.blockedDate.findMany({
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
      orderBy: {
        date: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const blockedDate = await this.prisma.blockedDate.findUnique({
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

    if (!blockedDate) {
      throw new NotFoundException('Blocked date not found');
    }

    return blockedDate;
  }

  async remove(id: string, userId: string) {
    const blockedDate = await this.findOne(id);

    // Check if user is the girl who owns this blocked date
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl || girl.id !== blockedDate.girlId) {
      throw new ForbiddenException(
        'You can only delete your own blocked dates',
      );
    }

    return this.prisma.blockedDate.delete({
      where: { id },
    });
  }
}
