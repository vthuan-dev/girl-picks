'use client';

import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import StatsCard from '@/components/dashboard/StatsCard';

export default function ClientDashboard() {
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Đặt lịch đã tạo',
      value: '8',
      change: '+3',
      trend: 'up' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'primary' as const,
    },
    {
      title: 'Đang chờ xác nhận',
      value: '2',
      change: '0',
      trend: 'up' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'accent' as const,
    },
    {
      title: 'Yêu thích',
      value: '15',
      change: '+5',
      trend: 'up' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      color: 'yellow' as const,
    },
    {
      title: 'Tin nhắn chưa đọc',
      value: '5',
      change: '+2',
      trend: 'up' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      color: 'green' as const,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">
            Chào mừng, {user?.fullName || 'Khách hàng'}! 👋
          </h1>
          <p className="text-text-muted">
            Tìm kiếm và đặt lịch với gái gọi yêu thích của bạn
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/girls"
            className="p-6 bg-background-light rounded-lg border border-secondary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 group"
          >
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/30 transition-colors">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-text mb-2">Tìm Gái gọi</h3>
            <p className="text-sm text-text-muted">Khám phá hàng ngàn profile gái gọi</p>
          </Link>

          <Link
            href="/customer/bookings"
            className="p-6 bg-background-light rounded-lg border border-secondary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 group"
          >
            <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
              <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-text mb-2">Đặt lịch của tôi</h3>
            <p className="text-sm text-text-muted">Xem và quản lý các đặt lịch</p>
          </Link>

          <Link
            href="/customer/messages"
            className="p-6 bg-background-light rounded-lg border border-secondary/30 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10 group"
          >
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="font-bold text-text mb-2">Tin nhắn</h3>
            <p className="text-sm text-text-muted">Chat với gái gọi</p>
          </Link>
        </div>

        {/* Recent Bookings */}
        <div className="bg-background-light rounded-lg border border-secondary/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text">Đặt lịch gần đây</h2>
            <Link href="/customer/bookings" className="text-primary hover:text-primary-hover text-sm font-medium">
              Xem tất cả
            </Link>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between p-4 bg-background rounded-lg border border-secondary/20 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">GG</span>
                  </div>
                  <div>
                    <p className="font-medium text-text">Gái gọi #{item}</p>
                    <p className="text-sm text-text-muted">Ngày mai, 20:00</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-sm font-medium">
                    Đang chờ
                  </span>
                  <Link
                    href={`/customer/bookings/${item}`}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Girls */}
        <div className="bg-background-light rounded-lg border border-secondary/30 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text">Gái gọi nổi bật</h2>
            <Link href="/girls" className="text-primary hover:text-primary-hover text-sm font-medium">
              Xem tất cả
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((item) => (
              <Link
                key={item}
                href={`/girls/${item}`}
                className="bg-background rounded-lg border border-secondary/20 hover:border-primary/50 transition-all overflow-hidden group"
              >
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl">👩</span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <button className="p-2 bg-background/80 rounded-full hover:bg-primary transition-colors">
                      <svg className="w-5 h-5 text-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-text mb-1">Gái gọi #{item}</h3>
                  <p className="text-sm text-text-muted mb-2">Hồ Chí Minh</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm font-medium text-text">4.8</span>
                    </div>
                    <span className="text-primary font-bold">500K/giờ</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

