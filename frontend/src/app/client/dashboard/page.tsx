'use client';

import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';
import StatsCard from '@/components/dashboard/StatsCard';

export default function ClientDashboard() {
  const { user } = useAuthStore();

  const stats = [
    {
      title: 'Tin nhắn',
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
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="space-y-5 sm:space-y-6 lg:space-y-8">
        {/* Header with gradient text */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-3xl opacity-50" />
          <div className="relative">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2 sm:mb-3 bg-gradient-to-r from-text via-text to-primary bg-clip-text text-transparent">
              Chào mừng, {user?.fullName || 'Khách hàng'}! 👋
            </h1>
            <p className="text-sm sm:text-base text-text-muted">
              Tìm kiếm và đặt lịch với gái gọi yêu thích của bạn
            </p>
          </div>
        </div>

        {/* Stats Grid - Responsive với gap tốt hơn */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {stats.map((stat, index) => (
            <div 
              key={index}
              className="animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <StatsCard {...stat} />
            </div>
          ))}
        </div>

        {/* Quick Actions - Cải thiện với gradient và hover effects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link
            href="/girls"
            className="group relative p-5 sm:p-6 bg-background-light rounded-xl border border-secondary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/10 group-hover:via-primary/5 group-hover:to-primary/10 transition-all duration-500" />
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-primary/10">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-text mb-2 text-base sm:text-lg group-hover:text-primary transition-colors">Tìm Gái gọi</h3>
              <p className="text-xs sm:text-sm text-text-muted">Khám phá hàng ngàn profile gái gọi</p>
            </div>
          </Link>


          <Link
            href="/customer/messages"
            className="group relative p-5 sm:p-6 bg-background-light rounded-xl border border-secondary/30 hover:border-green-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-green-500/20 overflow-hidden cursor-pointer sm:col-span-2 lg:col-span-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 via-green-500/0 to-green-500/0 group-hover:from-green-500/10 group-hover:via-green-500/5 group-hover:to-green-500/10 transition-all duration-500" />
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-green-500/10">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-bold text-text mb-2 text-base sm:text-lg group-hover:text-green-400 transition-colors">Tin nhắn</h3>
              <p className="text-xs sm:text-sm text-text-muted">Chat với gái gọi</p>
            </div>
          </Link>
        </div>

        {/* Recent Messages - Cải thiện responsive */}
        <div className="bg-background-light rounded-xl border border-secondary/30 p-4 sm:p-5 lg:p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text">Tin nhắn gần đây</h2>
            <Link 
              href="/messages" 
              className="text-primary hover:text-primary-hover text-sm font-medium flex items-center gap-1.5 group cursor-pointer w-fit"
            >
              Xem tất cả
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="space-y-2.5 sm:space-y-3">
            <div className="text-center py-8 text-text-muted">
              <svg className="w-12 h-12 mx-auto mb-3 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
              <p className="text-sm">Chưa có tin nhắn nào</p>
              </div>
          </div>
        </div>

        {/* Featured Girls - Cải thiện với card đẹp hơn */}
        <div className="bg-background-light rounded-xl border border-secondary/30 p-4 sm:p-5 lg:p-6 hover:border-primary/30 transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-text">Gái gọi nổi bật</h2>
            <Link 
              href="/girls" 
              className="text-primary hover:text-primary-hover text-sm font-medium flex items-center gap-1.5 group cursor-pointer w-fit"
            >
              Xem tất cả
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[1, 2, 3].map((item) => (
              <Link
                key={item}
                href={`/girls/${item}`}
                className="group relative bg-background rounded-xl border border-secondary/20 hover:border-primary/50 transition-all duration-300 overflow-hidden hover:shadow-xl hover:shadow-primary/20 cursor-pointer"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-primary/30 via-primary/20 to-accent/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-background/20 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center text-4xl sm:text-5xl group-hover:scale-110 transition-transform duration-300">
                      👩
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10">
                    <button 
                      className="p-2 sm:p-2.5 bg-background/90 backdrop-blur-sm rounded-full hover:bg-primary hover:text-white transition-all duration-300 shadow-lg group-hover:scale-110"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-text group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3">
                    <span className="px-2 sm:px-2.5 py-1 bg-primary/90 backdrop-blur-sm text-white text-xs sm:text-sm font-semibold rounded-lg shadow-lg">
                      Online
                    </span>
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-bold text-text mb-1 text-sm sm:text-base group-hover:text-primary transition-colors">Gái gọi #{item}</h3>
                  <p className="text-xs sm:text-sm text-text-muted mb-2 sm:mb-3 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Hồ Chí Minh
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-xs sm:text-sm font-semibold text-text">4.8</span>
                      <span className="text-xs text-text-muted">(120)</span>
                    </div>
                    <span className="text-primary font-bold text-sm sm:text-base">500K/giờ</span>
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

