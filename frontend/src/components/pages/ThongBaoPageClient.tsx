'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import AuthGuard from '@/components/auth/AuthGuard';
import { UserRole } from '@/types/auth';
import { notificationsApi, type Notification } from '@/modules/notifications/api/notifications.api';
import { formatRelativeTime, getNotificationTitle } from '@/utils/time-format';

type FilterKey = 'all' | 'unread' | 'read';

function resolveNotificationHref(notification: Notification): string | null {
  const data = notification.data || {};

  if (notification.type === 'GIRL_PENDING_APPROVAL') {
    return '/admin/users?role=GIRL&isActive=false';
  }

  if (typeof data?.href === 'string') return data.href;
  if (typeof data?.url === 'string') return data.url;

  // Posts notifications
  if (typeof data?.postId === 'string') {
    // Safe route: /posts/:id exists and redirects to SEO slug route if needed
    return `/posts/${data.postId}`;
  }

  // Reviews notifications: we don't have a stable public URL for a single review, fallback to /reviews
  if (typeof data?.reviewId === 'string') {
    return '/reviews';
  }

  return null;
}

function EmptyState({ filter }: { filter: FilterKey }) {
  return (
    <div className="bg-background-light rounded-2xl border border-secondary/30 p-6 sm:p-10 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
        <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </div>
      <h2 className="text-lg sm:text-xl font-bold text-text mb-2">Không có thông báo</h2>
      <p className="text-text-muted text-sm sm:text-base">
        {filter === 'unread'
          ? 'Bạn không có thông báo chưa đọc.'
          : filter === 'read'
            ? 'Chưa có thông báo nào đã đọc.'
            : 'Khi có cập nhật, thông báo sẽ hiển thị ở đây.'}
      </p>
    </div>
  );
}

function SkeletonList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-background-light rounded-2xl border border-secondary/30 p-4 sm:p-5 animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-secondary/40 mt-2" />
            <div className="flex-1">
              <div className="h-4 bg-secondary/30 rounded w-1/2 mb-2" />
              <div className="h-3 bg-secondary/30 rounded w-5/6 mb-2" />
              <div className="h-3 bg-secondary/20 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ThongBaoPageClient() {
  const router = useRouter();
  const [filter, setFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const counts = useMemo(() => {
    const unread = notifications.filter((n) => !n.isRead).length;
    const read = notifications.length - unread;
    return { all: notifications.length, unread, read };
  }, [notifications]);

  const fetchNotifications = useCallback(async (nextFilter: FilterKey, opts?: { silent?: boolean }) => {
    const isReadParam = nextFilter === 'all' ? undefined : nextFilter === 'read';
    try {
      if (!opts?.silent) setLoading(true);
      const data = await notificationsApi.getAll(isReadParam);
      setNotifications(data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
      toast.error('Không thể tải thông báo');
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(filter);
  }, [filter, fetchNotifications]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchNotifications(filter, { silent: true });
    } finally {
      setRefreshing(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error('Failed to mark as read:', error);
      toast.error('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Không thể đánh dấu tất cả');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationsApi.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Không thể xóa thông báo');
    }
  };

  const handleOpen = async (n: Notification) => {
    if (!n.isRead) {
      await handleMarkAsRead(n.id);
    }
    const href = resolveNotificationHref(n);
    if (href) {
      router.push(href);
    }
  };

  const filters: Array<{ key: FilterKey; label: string; count: number }> = [
    { key: 'all', label: 'Tất cả', count: counts.all },
    { key: 'unread', label: 'Chưa đọc', count: counts.unread },
    { key: 'read', label: 'Đã đọc', count: counts.read },
  ];

  return (
    <AuthGuard
      allowedRoles={[UserRole.CUSTOMER, UserRole.GIRL, UserRole.ADMIN, UserRole.STAFF_UPLOAD]}
      redirectTo="/auth/login"
    >
      <div className="min-h-[calc(100vh-64px)] bg-background">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text">Thông báo</h1>
              <p className="text-text-muted mt-1 text-sm sm:text-base">
                Quản lý thông báo, đánh dấu đã đọc và dọn dẹp nhanh.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center gap-2 px-3 py-2 bg-background-light border border-secondary/30 rounded-xl text-sm text-text hover:border-secondary/50 hover:bg-background transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {refreshing ? (
                  <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v6h6M20 20v-6h-6M5 19a9 9 0 0114-7M19 5a9 9 0 00-14 7" />
                  </svg>
                )}
                Làm mới
              </button>

              {counts.unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-xl text-sm hover:bg-primary/90 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Đã đọc hết
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 p-1 bg-background-light rounded-2xl border border-secondary/30 mb-5 overflow-x-auto scrollbar-hide">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  filter === f.key
                    ? 'bg-primary text-white shadow-md shadow-primary/20'
                    : 'text-text-muted hover:text-text hover:bg-background'
                }`}
              >
                <span>{f.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                    filter === f.key ? 'bg-white/20 text-white' : 'bg-secondary/20 text-text'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <SkeletonList />
          ) : notifications.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => {
                const href = resolveNotificationHref(n);
                const isClickable = Boolean(href) || !n.isRead;
                return (
                  <div
                    key={n.id}
                    className={`bg-background-light rounded-2xl border border-secondary/30 p-4 sm:p-5 transition-colors ${
                      !n.isRead ? 'ring-1 ring-primary/30 bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!n.isRead ? 'bg-primary' : 'bg-secondary/30'}`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => isClickable && handleOpen(n)}
                            className={`text-left min-w-0 ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                            title={href ? 'Mở thông báo' : 'Thông báo'}
                          >
                            <p className="font-bold text-text leading-snug line-clamp-1">
                              {getNotificationTitle(n.type)}
                            </p>
                            <p className="text-sm text-text-muted mt-1 leading-relaxed whitespace-pre-wrap break-words">
                              {n.message}
                            </p>
                          </button>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!n.isRead && (
                              <button
                                type="button"
                                onClick={() => handleMarkAsRead(n.id)}
                                className="p-2 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors"
                                title="Đánh dấu đã đọc"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDelete(n.id)}
                              className="p-2 rounded-lg hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-colors"
                              title="Xóa"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-text-muted">
                            {formatRelativeTime(n.createdAt)}
                          </span>

                          {href && (
                            <Link
                              href={href}
                              onClick={async (e) => {
                                e.preventDefault();
                                await handleOpen(n);
                              }}
                              className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                            >
                              Xem chi tiết
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer hint */}
          <div className="mt-8 text-center text-xs text-text-muted">
            Mẹo: Bạn có thể xem nhanh thông báo mới từ biểu tượng chuông trên header.
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}


