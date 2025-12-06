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
    <div className="bg-background-light rounded-lg border border-secondary/30 p-6 hover:border-primary/50 transition-all">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Left: Customer/Girl Info */}
        <div className="flex items-center gap-4 flex-1">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary font-bold text-lg">
              {booking.customerName.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-text mb-1 truncate">
              {view === 'girl' ? booking.customerName : 'Gái gọi #123'}
            </h3>
            <p className="text-sm text-text-muted truncate">
              {booking.service} • {booking.duration} giờ
            </p>
          </div>
        </div>

        {/* Center: Booking Details */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(booking.date).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{booking.time}</span>
            </div>
            <div className="flex items-center gap-2 text-text-muted">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{booking.location}</span>
            </div>
          </div>
          {booking.notes && (
            <p className="text-sm text-text-muted italic">📝 {booking.notes}</p>
          )}
        </div>

        {/* Right: Status & Actions */}
        <div className="flex flex-col lg:items-end gap-3">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-lg text-sm font-medium flex items-center gap-1 ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
            <span className="text-lg font-bold text-primary">
              {booking.price.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex gap-2">
            {booking.status === 'pending' && view === 'girl' && (
              <>
                <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
                  Xác nhận
                </button>
                <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm">
                  Từ chối
                </button>
              </>
            )}
            {booking.status === 'confirmed' && (
              <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm">
                Xem chi tiết
              </button>
            )}
            {booking.status === 'completed' && (
              <button className="px-4 py-2 bg-background border border-secondary/50 text-text rounded-lg hover:bg-background-light transition-colors text-sm">
                Đánh giá
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

