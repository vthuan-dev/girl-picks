/**
 * Format time to relative time (e.g., "1 giờ trước", "2 ngày trước")
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Vừa xong';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} năm trước`;
}

/**
 * Get notification title based on type
 */
export function getNotificationTitle(type: string): string {
  const titleMap: Record<string, string> = {
    POST_APPROVED: 'Bài viết đã được duyệt',
    POST_REJECTED: 'Bài viết bị từ chối',
    REVIEW_APPROVED: 'Đánh giá đã được duyệt',
    REVIEW_REJECTED: 'Đánh giá bị từ chối',
    NEW_MESSAGE: 'Tin nhắn mới',
    VERIFICATION_APPROVED: 'Xác thực đã được duyệt',
    VERIFICATION_REJECTED: 'Xác thực bị từ chối',
    BOOKING_CREATED: 'Booking mới',
    BOOKING_CONFIRMED: 'Booking đã được xác nhận',
    BOOKING_REJECTED: 'Booking bị từ chối',
    BOOKING_CANCELLED: 'Booking đã bị hủy',
    BOOKING_COMPLETED: 'Booking đã hoàn thành',
    BOOKING_REMINDER: 'Nhắc nhở booking',
    PAYMENT_RECEIVED: 'Thanh toán đã nhận',
    PAYMENT_FAILED: 'Thanh toán thất bại',
    REPORT_PROCESSED: 'Báo cáo đã được xử lý',
    COMMENT_REPLY: 'Có người trả lời comment',
  };

  return titleMap[type] || 'Thông báo mới';
}

