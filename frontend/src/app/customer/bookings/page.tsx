'use client';

import { useState } from 'react';
import BookingCard from '@/components/bookings/BookingCard';

export default function CustomerBookingsPage() {
  const [selectedStatus, setSelectedStatus] = useState('Tất cả');

  const bookings = [
    {
      id: '1',
      customerName: 'Nguyễn Văn A',
      customerAvatar: null,
      date: '2024-12-07',
      time: '20:00',
      duration: 2,
      service: 'Đi chơi',
      price: 600000,
      status: 'pending',
      location: 'Quán cà phê ABC',
      notes: '',
    },
    {
      id: '2',
      customerName: 'Trần Thị B',
      customerAvatar: null,
      date: '2024-12-08',
      time: '19:00',
      duration: 3,
      service: 'Đi ăn tối',
      price: 900000,
      status: 'confirmed',
      location: 'Nhà hàng XYZ',
      notes: '',
    },
  ];

  const bookingStatuses = ['Tất cả', 'Đang chờ', 'Đã xác nhận', 'Đã hoàn thành', 'Đã hủy'];

  const filteredBookings = selectedStatus === 'Tất cả'
    ? bookings
    : bookings.filter(b => {
        const statusMap: Record<string, string> = {
          'Đang chờ': 'pending',
          'Đã xác nhận': 'confirmed',
          'Đã hoàn thành': 'completed',
          'Đã hủy': 'cancelled',
        };
        return b.status === statusMap[selectedStatus];
      });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Đặt lịch của tôi</h1>
        <p className="text-text-muted">Quản lý các đặt lịch của bạn</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {bookingStatuses.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${
                selectedStatus === status
                  ? 'bg-primary text-white'
                  : 'bg-background-light border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
              }
            `}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-background-light rounded-lg border border-secondary/30 p-12 text-center">
            <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-text-muted">Chưa có đặt lịch nào</p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} view="customer" />
          ))
        )}
      </div>
    </div>
  );
}

