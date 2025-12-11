'use client';

import { useState, useRef, useEffect } from 'react';
import { notificationsApi, Notification } from '@/modules/notifications/api/notifications.api';
import { formatRelativeTime, getNotificationTitle } from '@/utils/time-format';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const data = await notificationsApi.getAll();
      setNotifications(data);
      
      // Update unread count
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setNotifications([]);
    }
  };

  // Fetch unread count only (lighter request)
  const fetchUnreadCount = async () => {
    try {
      const count = await notificationsApi.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Initial load and polling
  useEffect(() => {
    fetchUnreadCount();
    
    // Poll for unread count every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch full notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchNotifications().finally(() => setLoading(false));
    }
  }, [isOpen]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark notification as read
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.markAllAsRead();
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Delete notification
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationsApi.delete(id);
      // Remove from local state
      const deletedNotification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      // Update unread count if deleted notification was unread
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-background-light rounded-lg transition-colors"
      >
        <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-medium flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background-light rounded-lg border border-secondary/30 shadow-xl z-50">
          <div className="p-4 border-b border-secondary/30 flex items-center justify-between">
            <h3 className="font-bold text-text">Thông báo</h3>
            {unreadNotifications > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary hover:underline"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <p className="text-text-muted">Đang tải...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-text-muted">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={(e) => {
                    if (!notification.isRead) {
                      handleMarkAsRead(notification.id, e);
                    }
                    if (notification.type === 'GIRL_PENDING_APPROVAL') {
                      router.push('/admin/users?role=GIRL&isActive=false');
                      setIsOpen(false);
                    }
                  }}
                  className={`
                    p-4 border-b border-secondary/30 hover:bg-background transition-colors cursor-pointer relative group
                    ${!notification.isRead ? 'bg-primary/5' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notification.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text mb-1">
                        {getNotificationTitle(notification.type)}
                      </p>
                      <p className="text-sm text-text-muted mb-1">{notification.message}</p>
                      <p className="text-xs text-text-muted">
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-lg text-text-muted hover:text-red-500 flex-shrink-0"
                      title="Xóa thông báo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-secondary/30">
            <Link
              href="/thong-bao"
              className="block w-full text-center text-sm text-primary hover:underline"
            >
              Xem tất cả thông báo
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

