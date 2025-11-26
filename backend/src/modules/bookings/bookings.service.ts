import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingStatus, PaymentStatus } from '@prisma/client';
import moment from 'moment';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createBookingDto: CreateBookingDto) {
    const { girlId, bookingDate, duration, servicePackageId } = createBookingDto;

    // Check if girl exists
    const girl = await this.prisma.girl.findUnique({
      where: { id: girlId },
      include: { user: true },
    });

    if (!girl) {
      throw new NotFoundException('Girl not found');
    }

    if (!girl.user.isActive) {
      throw new BadRequestException('Girl is not active');
    }

    // Check if service package exists and belongs to girl
    if (servicePackageId) {
      const servicePackage = await this.prisma.servicePackage.findFirst({
        where: {
          id: servicePackageId,
          girlId: girlId,
          isActive: true,
        },
      });

      if (!servicePackage) {
        throw new NotFoundException('Service package not found or inactive');
      }
    }

    // Check for time conflicts
    const bookingDateTime = new Date(bookingDate);
    const endDateTime = new Date(bookingDateTime.getTime() + duration * 60 * 60 * 1000);

    const conflictingBooking = await this.prisma.booking.findFirst({
      where: {
        girlId: girlId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
        bookingDate: {
          lte: endDateTime,
        },
        OR: [
          {
            bookingDate: {
              gte: bookingDateTime,
              lte: endDateTime,
            },
          },
          {
            bookingDate: {
              lte: bookingDateTime,
            },
            // Check if existing booking ends after new booking starts
            // This requires calculating end time from duration
          },
        ],
      },
    });

    if (conflictingBooking) {
      throw new BadRequestException('Time slot is already booked');
    }

    // Check if date is blocked
    const blockedDate = await this.prisma.blockedDate.findFirst({
      where: {
        girlId: girlId,
        date: {
          gte: new Date(bookingDateTime.setHours(0, 0, 0, 0)),
          lt: new Date(bookingDateTime.setHours(23, 59, 59, 999)),
        },
      },
    });

    if (blockedDate) {
      throw new BadRequestException('This date is blocked by the girl');
    }

    // Create booking
    const booking = await this.prisma.booking.create({
      data: {
        ...createBookingDto,
        customerId: userId,
        bookingDate: bookingDateTime,
        status: BookingStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        servicePackage: true,
      },
    });

    // Create booking history
    await this.prisma.bookingHistory.create({
      data: {
        bookingId: booking.id,
        status: BookingStatus.PENDING,
        changedBy: userId,
        notes: 'Booking created',
      },
    });

    // Send notifications
    try {
      await this.notificationsService.notifyBookingCreated(booking.id, userId, girlId);
    } catch (error) {
      // Log error but don't fail booking creation
      console.error('Failed to send booking created notification:', error);
    }

    return booking;
  }

  async findAll(filters?: {
    customerId?: string;
    girlId?: string;
    status?: BookingStatus;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.customerId) {
      where.customerId = filters.customerId;
    }

    if (filters?.girlId) {
      where.girlId = filters.girlId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.bookingDate = {};
      if (filters.startDate) {
        where.bookingDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.bookingDate.lte = filters.endDate;
      }
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        servicePackage: true,
      },
      orderBy: {
        bookingDate: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        servicePackage: true,
        bookingHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
        payments: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async update(id: string, userId: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.findOne(id);

    // Only customer can update, and only if status is PENDING
    if (booking.customerId !== userId) {
      throw new ForbiddenException('You can only update your own bookings');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only update pending bookings');
    }

    return this.prisma.booking.update({
      where: { id },
      data: updateBookingDto,
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        servicePackage: true,
      },
    });
  }

  async confirm(id: string, userId: string, notes?: string) {
    const booking = await this.findOne(id);

    // Only girl can confirm
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl || girl.id !== booking.girlId) {
      throw new ForbiddenException('Only the girl can confirm bookings');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only confirm pending bookings');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CONFIRMED,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        servicePackage: true,
      },
    });

    // Create booking history
    await this.prisma.bookingHistory.create({
      data: {
        bookingId: id,
        status: BookingStatus.CONFIRMED,
        changedBy: userId,
        notes: notes || 'Booking confirmed',
      },
    });

    // Send notification
    try {
      await this.notificationsService.notifyBookingConfirmed(id, booking.customerId, booking.girlId);
    } catch (error) {
      console.error('Failed to send booking confirmed notification:', error);
    }

    return updated;
  }

  async reject(id: string, userId: string, reason: string) {
    const booking = await this.findOne(id);

    // Only girl can reject
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl || girl.id !== booking.girlId) {
      throw new ForbiddenException('Only the girl can reject bookings');
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException('Can only reject pending bookings');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.REJECTED,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        servicePackage: true,
      },
    });

    // Create booking history
    await this.prisma.bookingHistory.create({
      data: {
        bookingId: id,
        status: BookingStatus.REJECTED,
        changedBy: userId,
        notes: `Rejected: ${reason}`,
      },
    });

    // Send notification
    try {
      await this.notificationsService.notifyBookingRejected(id, booking.customerId, reason);
    } catch (error) {
      console.error('Failed to send booking rejected notification:', error);
    }

    return updated;
  }

  async cancel(id: string, userId: string, reason?: string) {
    const booking = await this.findOne(id);

    // Customer or Girl can cancel
    const isCustomer = booking.customerId === userId;
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });
    const isGirl = girl && girl.id === booking.girlId;

    if (!isCustomer && !isGirl) {
      throw new ForbiddenException('You can only cancel your own bookings');
    }

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel this booking');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        cancellationReason: reason,
        cancelledAt: new Date(),
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        servicePackage: true,
      },
    });

    // Create booking history
    await this.prisma.bookingHistory.create({
      data: {
        bookingId: id,
        status: BookingStatus.CANCELLED,
        changedBy: userId,
        notes: reason || 'Booking cancelled',
      },
    });

    // Send notification
    try {
      const girl = await this.prisma.girl.findUnique({
        where: { id: booking.girlId },
        include: { user: true },
      });
      await this.notificationsService.notifyBookingCancelled(
        id,
        booking.customerId,
        booking.girlId,
        userId,
      );
    } catch (error) {
      console.error('Failed to send booking cancelled notification:', error);
    }

    return updated;
  }

  async complete(id: string, userId: string) {
    const booking = await this.findOne(id);

    // Only girl can mark as completed
    const girl = await this.prisma.girl.findUnique({
      where: { userId },
    });

    if (!girl || girl.id !== booking.girlId) {
      throw new ForbiddenException('Only the girl can mark bookings as completed');
    }

    if (booking.status !== BookingStatus.CONFIRMED) {
      throw new BadRequestException('Can only complete confirmed bookings');
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.COMPLETED,
      },
      include: {
        customer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        girl: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
        },
        servicePackage: true,
      },
    });

    // Create booking history
    await this.prisma.bookingHistory.create({
      data: {
        bookingId: id,
        status: BookingStatus.COMPLETED,
        changedBy: userId,
        notes: 'Booking completed',
      },
    });

    // Send notification
    try {
      await this.notificationsService.notifyBookingCompleted(id, booking.customerId);
    } catch (error) {
      console.error('Failed to send booking completed notification:', error);
    }

    return updated;
  }

  async getAvailableSlots(girlId: string, startDate: string, endDate: string) {
    // Get girl's time slots
    const timeSlots = await this.prisma.timeSlot.findMany({
      where: {
        girlId: girlId,
        isAvailable: true,
      },
    });

    // Get blocked dates
    const blockedDates = await this.prisma.blockedDate.findMany({
      where: {
        girlId: girlId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    const blockedDateStrings = blockedDates.map((bd) => bd.date.toISOString().split('T')[0]);

    // Get existing bookings
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        girlId: girlId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
        },
        bookingDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    // Generate available slots
    const slots: Array<{ date: string; startTime: string; endTime: string; available: boolean }> = [];
    const start = moment(startDate);
    const end = moment(endDate);

    for (let date = start.clone(); date.isSameOrBefore(end); date.add(1, 'day')) {
      const dateString = date.format('YYYY-MM-DD');
      const dayOfWeek = date.day(); // 0 = Sunday, 6 = Saturday

      // Check if date is blocked
      if (blockedDateStrings.includes(dateString)) {
        continue;
      }

      // Get time slots for this day of week
      const dayTimeSlots = timeSlots.filter((ts) => ts.dayOfWeek === dayOfWeek);

      for (const timeSlot of dayTimeSlots) {
        const slotDateTime = moment(`${dateString} ${timeSlot.startTime}`);
        const slotEndDateTime = moment(`${dateString} ${timeSlot.endTime}`);

        // Check if slot conflicts with existing bookings
        const hasConflict = existingBookings.some((booking) => {
          const bookingStart = moment(booking.bookingDate);
          const bookingEnd = moment(bookingStart).add(booking.duration, 'hours');

          return (
            (slotDateTime.isSameOrAfter(bookingStart) && slotDateTime.isBefore(bookingEnd)) ||
            (slotEndDateTime.isAfter(bookingStart) && slotEndDateTime.isSameOrBefore(bookingEnd)) ||
            (slotDateTime.isBefore(bookingStart) && slotEndDateTime.isAfter(bookingEnd))
          );
        });

        slots.push({
          date: dateString,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          available: !hasConflict,
        });
      }
    }

    return slots;
  }
}

