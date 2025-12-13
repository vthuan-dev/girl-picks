'use client';

import Link from 'next/link';
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
          Quản lý profile và thu nhập của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/girl/profile"
          className="p-6 bg-background-light rounded-lg border border-secondary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 text-left group"
        >
          <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="font-bold text-text mb-2">Cập nhật Profile</h3>
          <p className="text-sm text-text-muted">Chỉnh sửa thông tin và ảnh của bạn</p>
        </Link>

        <Link
          href="/girl/pricing"
          className="p-6 bg-background-light rounded-lg border border-secondary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 text-left group"
        >
          <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-text mb-2">Quản lý Giá & Dịch vụ</h3>
          <p className="text-sm text-text-muted">Thiết lập giá và dịch vụ của bạn</p>
        </Link>

        <Link
          href="/girl/posts"
          className="p-6 bg-background-light rounded-lg border border-secondary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 text-left group"
        >
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
            <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="font-bold text-text mb-2">Đăng bài</h3>
          <p className="text-sm text-text-muted">Tạo và quản lý bài viết của bạn</p>
        </Link>

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

