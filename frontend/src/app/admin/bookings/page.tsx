'use client';

import { useState } from 'react';

export default function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [dateFilter, setDateFilter] = useState('Hôm nay');

  const bookings = [
    {
      id: '1',
      customerName: 'Nguyễn Văn A',
      girlName: 'Trần Thị B',
      service: 'Dịch vụ cơ bản',
      date: '2024-12-07',
      time: '14:00',
      status: 'confirmed',
      amount: 500000,
      createdAt: '2024-12-06T10:00:00',
    },
    {
      id: '2',
      customerName: 'Lê Văn C',
      girlName: 'Nguyễn Thị D',
      service: 'Dịch vụ VIP',
      date: '2024-12-07',
      time: '16:00',
      status: 'pending',
      amount: 1000000,
      createdAt: '2024-12-06T11:30:00',
    },
    {
      id: '3',
      customerName: 'Phạm Văn E',
      girlName: 'Hoàng Thị F',
      service: 'Dịch vụ cơ bản',
      date: '2024-12-08',
      time: '10:00',
      status: 'completed',
      amount: 500000,
      createdAt: '2024-12-05T09:00:00',
    },
    {
      id: '4',
      customerName: 'Vũ Văn G',
      girlName: 'Đỗ Thị H',
      service: 'Dịch vụ đặc biệt',
      date: '2024-12-08',
      time: '18:00',
      status: 'cancelled',
      amount: 1500000,
      createdAt: '2024-12-06T14:00:00',
    },
  ];

  const statuses = ['Tất cả', 'pending', 'confirmed', 'completed', 'cancelled'];
  const dates = ['Hôm nay', 'Ngày mai', 'Tuần này', 'Tháng này', 'Tất cả'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-500/20 text-blue-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'completed':
        return 'bg-green-500/20 text-green-500';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Đã xác nhận';
      case 'pending':
        return 'Chờ xác nhận';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = statusFilter === 'Tất cả' || booking.status === statusFilter;
    return matchesStatus;
  });

  const stats = [
    { label: 'Tổng đặt lịch', value: bookings.length, color: 'bg-blue-500/20 text-blue-500' },
    { label: 'Chờ xác nhận', value: bookings.filter(b => b.status === 'pending').length, color: 'bg-yellow-500/20 text-yellow-500' },
    { label: 'Đã xác nhận', value: bookings.filter(b => b.status === 'confirmed').length, color: 'bg-green-500/20 text-green-500' },
    { label: 'Hoàn thành', value: bookings.filter(b => b.status === 'completed').length, color: 'bg-purple-500/20 text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Quản lý Đặt lịch</h1>
          <p className="text-text-muted">Quản lý tất cả đặt lịch trong hệ thống</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-background-light rounded-lg border border-secondary/30 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-text-muted">{stat.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex gap-2 flex-wrap">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${
                    statusFilter === status
                      ? 'bg-primary text-white'
                      : 'bg-background border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                  }
                `}
              >
                {status === 'Tất cả' ? status : getStatusText(status)}
              </button>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            {dates.map((date) => (
              <button
                key={date}
                onClick={() => setDateFilter(date)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                  ${
                    dateFilter === date
                      ? 'bg-primary text-white'
                      : 'bg-background border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                  }
                `}
              >
                {date}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-background-light rounded-lg border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Gái gọi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Dịch vụ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/30">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-background transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-text">{booking.customerName}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-text">{booking.girlName}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-text">{booking.service}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-text">{new Date(booking.date).toLocaleDateString('vi-VN')}</p>
                    <p className="text-sm text-text-muted">{booking.time}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-text">{booking.amount.toLocaleString('vi-VN')} đ</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusText(booking.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-background rounded-lg transition-colors cursor-pointer" title="Xem chi tiết">
                        <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      {booking.status === 'pending' && (
                        <>
                          <button className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm cursor-pointer">
                            Xác nhận
                          </button>
                          <button className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm cursor-pointer">
                            Từ chối
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

