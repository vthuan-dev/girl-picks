import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentStatus, PaymentMethod } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => NotificationsService))
    private notificationsService: NotificationsService,
  ) {}

  async create(userId: string, createPaymentDto: CreatePaymentDto) {
    const { bookingId, amount, paymentMethod } = createPaymentDto;

    // Check if booking exists
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    // Only customer can create payment for their booking
    if (booking.customerId !== userId) {
      throw new ForbiddenException(
        'You can only create payments for your own bookings',
      );
    }

    // Check if booking is confirmed
    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestException('Can only pay for confirmed bookings');
    }

    // Check if payment amount is valid
    const totalPaid = await this.getTotalPaid(bookingId);
    const remainingAmount = booking.totalPrice - totalPaid;

    if (amount > remainingAmount) {
      throw new BadRequestException(
        `Payment amount exceeds remaining balance. Remaining: ${remainingAmount}`,
      );
    }

    // Create payment
    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        userId,
        amount,
        paymentMethod,
        paymentStatus:
          paymentMethod === PaymentMethod.CASH
            ? PaymentStatus.COMPLETED
            : PaymentStatus.PENDING,
        paymentDate: paymentMethod === PaymentMethod.CASH ? new Date() : null,
      },
    });

    // Create payment history
    await this.prisma.paymentHistory.create({
      data: {
        paymentId: payment.id,
        status: payment.paymentStatus,
        amount: payment.amount,
        notes: 'Payment created',
      },
    });

    // Update booking payment status
    const newTotalPaid = totalPaid + amount;
    let bookingPaymentStatus: PaymentStatus = PaymentStatus.PENDING;

    if (newTotalPaid >= booking.totalPrice) {
      bookingPaymentStatus = PaymentStatus.COMPLETED;
    } else if (newTotalPaid >= booking.depositAmount) {
      bookingPaymentStatus = PaymentStatus.PROCESSING;
    }

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: bookingPaymentStatus,
      },
    });

    // Send notification if payment is completed (cash)
    if (payment.paymentStatus === PaymentStatus.COMPLETED) {
      try {
        await this.notificationsService.notifyPaymentReceived(
          bookingId,
          payment.id,
          amount,
          userId,
        );
      } catch (error) {
        console.error('Failed to send payment received notification:', error);
      }
    }

    return payment;
  }

  async findAll(bookingId?: string, userId?: string) {
    const where: any = {};

    if (bookingId) {
      where.bookingId = bookingId;
    }

    if (userId) {
      where.userId = userId;
    }

    return this.prisma.payment.findMany({
      where,
      include: {
        booking: {
          select: {
            id: true,
            bookingDate: true,
            totalPrice: true,
            status: true,
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        paymentHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                email: true,
                phone: true,
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
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        paymentHistory: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async processPayment(
    id: string,
    transactionId: string,
    status: PaymentStatus,
  ) {
    const payment = await this.findOne(id);

    if (payment.paymentStatus === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment already completed');
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        paymentStatus: status,
        transactionId,
        paymentDate:
          status === PaymentStatus.COMPLETED ? new Date() : payment.paymentDate,
      },
    });

    // Create payment history
    await this.prisma.paymentHistory.create({
      data: {
        paymentId: id,
        status: status,
        amount: payment.amount,
        notes: `Payment ${status.toLowerCase()}`,
      },
    });

    // Update booking payment status if payment completed
    if (status === PaymentStatus.COMPLETED) {
      const totalPaid = await this.getTotalPaid(payment.bookingId);
      const booking = await this.prisma.booking.findUnique({
        where: { id: payment.bookingId },
      });

      if (booking) {
        let bookingPaymentStatus: PaymentStatus = PaymentStatus.PROCESSING;

        if (totalPaid >= booking.totalPrice) {
          bookingPaymentStatus = PaymentStatus.COMPLETED;
        }

        await this.prisma.booking.update({
          where: { id: payment.bookingId },
          data: {
            paymentStatus: bookingPaymentStatus,
          },
        });

        // Send notification
        try {
          await this.notificationsService.notifyPaymentReceived(
            payment.bookingId,
            id,
            payment.amount,
            payment.userId,
          );
        } catch (error) {
          console.error('Failed to send payment received notification:', error);
        }
      }
    } else if (status === PaymentStatus.FAILED) {
      // Send notification for failed payment
      try {
        await this.notificationsService.notifyPaymentFailed(
          payment.bookingId,
          id,
          payment.userId,
        );
      } catch (error) {
        console.error('Failed to send payment failed notification:', error);
      }
    }

    return updated;
  }

  async refund(
    id: string,
    refundAmount: number,
    reason: string,
    userId: string,
  ) {
    const payment = await this.findOne(id);

    if (payment.paymentStatus !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Can only refund completed payments');
    }

    if (refundAmount > payment.amount) {
      throw new BadRequestException(
        'Refund amount cannot exceed payment amount',
      );
    }

    const updated = await this.prisma.payment.update({
      where: { id },
      data: {
        paymentStatus: PaymentStatus.REFUNDED,
        refundAmount,
        refundReason: reason,
      },
    });

    // Create payment history
    await this.prisma.paymentHistory.create({
      data: {
        paymentId: id,
        status: PaymentStatus.REFUNDED,
        amount: -refundAmount,
        notes: `Refunded: ${reason}`,
      },
    });

    return updated;
  }

  async getTotalPaid(bookingId: string): Promise<number> {
    const payments = await this.prisma.payment.findMany({
      where: {
        bookingId,
        paymentStatus: PaymentStatus.COMPLETED,
      },
    });

    return payments.reduce((total, payment) => total + payment.amount, 0);
  }
}
