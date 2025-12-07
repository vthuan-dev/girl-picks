'use client';

interface Booking {
  id: string;
  customerName: string;
  customerAvatar: string | null;
  date: string;
  time: string;
  duration: number;
  service: string;
  price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  location: string;
  notes: string;
}

interface BookingCardProps {
  booking: Booking;
  view: 'girl' | 'customer';
}

export default function BookingCard({ booking, view }: BookingCardProps) {
  const statusConfig = {
    pending: {
      label: 'Đang chờ',
      color: 'bg-accent/20 text-accent',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    confirmed: {
      label: 'Đã xác nhận',
      color: 'bg-green-500/20 text-green-500',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    },
    completed: {
      label: 'Đã hoàn thành',
      color: 'bg-blue-500/20 text-blue-500',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    cancelled: {
      label: 'Đã hủy',
      color: 'bg-red-500/20 text-red-500',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
    },
  };

  const status = statusConfig[booking.status];

  return (
    <div className="group relative bg-background-light rounded-xl border border-secondary/30 p-5 sm:p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/3 group-hover:to-primary/0 transition-all duration-500 pointer-events-none" />
      
      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
          {/* Left: Customer/Girl Info */}
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/30 group-hover:border-primary/50 group-hover:scale-110 transition-all duration-300">
                <span className="text-primary font-bold text-lg sm:text-xl">
                  {booking.customerName.charAt(0)}
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-text mb-1 truncate text-base sm:text-lg group-hover:text-primary transition-colors">
                {view === 'girl' ? booking.customerName : 'Gái gọi #123'}
              </h3>
              <p className="text-xs sm:text-sm text-text-muted truncate flex items-center gap-2">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {booking.service}
                </span>
                <span className="text-text-muted/50">•</span>
                <span>{booking.duration} giờ</span>
              </p>
            </div>
          </div>

          {/* Center: Booking Details */}
          <div className="flex-1 space-y-2.5 lg:px-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-1.5 text-text-muted bg-background/50 px-2.5 py-1.5 rounded-lg border border-secondary/20">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="whitespace-nowrap">{new Date(booking.date).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted bg-background/50 px-2.5 py-1.5 rounded-lg border border-secondary/20">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="whitespace-nowrap">{booking.time}</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted bg-background/50 px-2.5 py-1.5 rounded-lg border border-secondary/20 min-w-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="truncate">{booking.location}</span>
              </div>
            </div>
            {booking.notes && (
              <div className="flex items-start gap-2 text-xs sm:text-sm text-text-muted bg-background/30 px-3 py-2 rounded-lg border border-secondary/10">
                <span className="text-base">📝</span>
                <p className="italic flex-1">{booking.notes}</p>
              </div>
            )}
          </div>

          {/* Right: Status & Actions */}
          <div className="flex flex-col sm:flex-row lg:flex-col lg:items-end gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 border ${status.color} shadow-sm`}>
                {status.icon}
                <span className="hidden sm:inline">{status.label}</span>
                <span className="sm:hidden">{status.label.split(' ')[0]}</span>
              </span>
              <div className="text-right">
                <span className="text-base sm:text-lg font-bold text-primary block">
                  {booking.price.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-xs text-text-muted hidden sm:block">Tổng cộng</span>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {booking.status === 'pending' && view === 'girl' && (
                <>
                  <button className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 active:scale-95 transition-all text-xs sm:text-sm font-medium shadow-md shadow-green-500/20 hover:shadow-lg hover:shadow-green-500/30">
                    Xác nhận
                  </button>
                  <button className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 active:scale-95 transition-all text-xs sm:text-sm font-medium shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30">
                    Từ chối
                  </button>
                </>
              )}
              {booking.status === 'confirmed' && (
                <button className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all text-xs sm:text-sm font-medium shadow-md shadow-primary/20">
                  Xem chi tiết
                </button>
              )}
              {booking.status === 'completed' && (
                <button className="flex-1 sm:flex-none px-4 py-2 bg-background border border-secondary/50 text-text rounded-lg hover:bg-background-light hover:border-primary/50 active:scale-95 transition-all text-xs sm:text-sm font-medium">
                  Đánh giá
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

