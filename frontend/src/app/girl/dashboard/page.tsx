'use client';

import { useAuthStore } from '@/store/auth.store';
import StatsCard from '@/components/dashboard/StatsCard';

interface Stat {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: 'primary' | 'accent' | 'yellow' | 'green';
}

export default function GirlDashboard() {
  const { user } = useAuthStore();

  const stats: Stat[] = [
    {
      title: 'Tổng đặt lịch',
      value: '24',
      change: '+12%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'primary',
    },
    {
      title: 'Đang chờ xác nhận',
      value: '5',
      change: '+2',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'accent',
    },
    {
      title: 'Đánh giá trung bình',
      value: '4.8',
      change: '+0.2',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: 'yellow',
    },
    {
      title: 'Tổng thu nhập',
      value: '12.5M',
      change: '+15%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">
          Chào mừng, {user?.fullName || 'Gái gọi'}! 👋
        </h1>
        <p className="text-text-muted">
          Quản lý profile, đặt lịch và thu nhập của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-background-light rounded-lg border border-secondary/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text">Đặt lịch gần đây</h2>
          <button className="text-primary hover:text-primary-hover text-sm font-medium">
            Xem tất cả
          </button>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="flex items-center justify-between p-4 bg-background rounded-lg border border-secondary/20 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">KH</span>
                </div>
                <div>
                  <p className="font-medium text-text">Khách hàng #{item}</p>
                  <p className="text-sm text-text-muted">Hôm nay, 14:30</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-sm font-medium">
                  Đang chờ
                </span>
                <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm">
                  Xem chi tiết
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-6 bg-background-light rounded-lg border border-secondary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 text-left group">
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="font-bold text-text mb-2">Cập nhật Profile</h3>
          <p className="text-sm text-text-muted">Chỉnh sửa thông tin và ảnh của bạn</p>
        </button>

        <button className="p-6 bg-background-light rounded-lg border border-secondary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 text-left group">
          <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-text mb-2">Quản lý Gói dịch vụ</h3>
          <p className="text-sm text-text-muted">Thiết lập giá và dịch vụ của bạn</p>
        </button>

        <button className="p-6 bg-background-light rounded-lg border border-secondary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 text-left group">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-yellow-500/30 transition-colors">
            <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="font-bold text-text mb-2">Xem Thống kê</h3>
          <p className="text-sm text-text-muted">Theo dõi hiệu suất và thu nhập</p>
        </button>
      </div>
    </div>
  );
}

