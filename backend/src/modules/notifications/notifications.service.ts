import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    type: NotificationType,
    message: string,
    data?: any,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        message,
        data: data || {},
      },
    });
  }

  async findAll(userId: string, isRead?: boolean) {
    const where: any = { userId };

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.notification.findUnique({
      where: { id },
    });
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.findOne(id);

    if (!notification || notification.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  // Booking-specific notification helpers
  async notifyBookingCreated(
    bookingId: string,
    customerId: string,
    girlId: string,
  ) {
    // Notify girl
    const girl = await this.prisma.girl.findUnique({
      where: { id: girlId },
      include: { user: true },
    });

    if (girl) {
      await this.create(
        girl.userId,
        NotificationType.BOOKING_CREATED,
        'Bạn có một booking mới',
        { bookingId, customerId },
      );
    }

    // Notify customer
    await this.create(
      customerId,
      NotificationType.BOOKING_CREATED,
      'Booking của bạn đã được tạo thành công',
      { bookingId, girlId },
    );
  }

  async notifyBookingConfirmed(
    bookingId: string,
    customerId: string,
    girlId: string,
  ) {
    await this.create(
      customerId,
      NotificationType.BOOKING_CONFIRMED,
      'Booking của bạn đã được xác nhận',
      { bookingId, girlId },
    );
  }

  async notifyBookingRejected(
    bookingId: string,
    customerId: string,
    reason: string,
  ) {
    await this.create(
      customerId,
      NotificationType.BOOKING_REJECTED,
      `Booking của bạn đã bị từ chối: ${reason}`,
      { bookingId, reason },
    );
  }

  async notifyBookingCancelled(
    bookingId: string,
    customerId: string,
    girlId: string,
    cancelledBy: string,
  ) {
    const isCustomer = cancelledBy === customerId;
    const targetUserId = isCustomer ? girlId : customerId;
    const message = isCustomer
      ? 'Customer đã hủy booking'
      : 'Girl đã hủy booking';

    const girl = await this.prisma.girl.findUnique({
      where: { id: girlId },
      include: { user: true },
    });

    if (girl) {
      await this.create(
        isCustomer ? girl.userId : customerId,
        NotificationType.BOOKING_CANCELLED,
        message,
        { bookingId, cancelledBy },
      );
    }
  }

  async notifyBookingCompleted(bookingId: string, customerId: string) {
    await this.create(
      customerId,
      NotificationType.BOOKING_COMPLETED,
      'Booking của bạn đã hoàn thành. Vui lòng đánh giá dịch vụ.',
      { bookingId },
    );
  }

  async notifyPaymentReceived(
    bookingId: string,
    paymentId: string,
    amount: number,
    userId: string,
  ) {
    await this.create(
      userId,
      NotificationType.PAYMENT_RECEIVED,
      `Thanh toán ${amount.toLocaleString('vi-VN')} VNĐ đã được nhận`,
      { bookingId, paymentId, amount },
    );
  }

  async notifyPaymentFailed(
    bookingId: string,
    paymentId: string,
    userId: string,
  ) {
    await this.create(
      userId,
      NotificationType.PAYMENT_FAILED,
      'Thanh toán thất bại. Vui lòng thử lại.',
      { bookingId, paymentId },
    );
  }
}
