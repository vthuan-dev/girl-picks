'use client';

import { useState, useRef, useEffect } from 'react';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const notifications = [
    {
      id: '2',
      title: 'Tin nhắn mới',
      message: 'Trần Thị B đã gửi tin nhắn cho bạn',
      time: '1 giờ trước',
      isRead: false,
    },
    {
      id: '3',
      title: 'Đánh giá mới',
      message: 'Bạn có một đánh giá mới',
      time: '2 giờ trước',
      isRead: true,
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        {unreadNotifications > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-medium flex items-center justify-center">
            {unreadNotifications}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background-light rounded-lg border border-secondary/30 shadow-xl z-50">
          <div className="p-4 border-b border-secondary/30 flex items-center justify-between">
            <h3 className="font-bold text-text">Thông báo</h3>
            {unreadNotifications > 0 && (
              <button className="text-sm text-primary hover:underline">
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-text-muted">Không có thông báo nào</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`
                    p-4 border-b border-secondary/30 hover:bg-background transition-colors cursor-pointer
                    ${!notification.isRead ? 'bg-primary/5' : ''}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notification.isRead ? 'bg-primary' : 'bg-transparent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text mb-1">{notification.title}</p>
                      <p className="text-sm text-text-muted mb-1">{notification.message}</p>
                      <p className="text-xs text-text-muted">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="p-4 border-t border-secondary/30">
            <button className="w-full text-center text-sm text-primary hover:underline">
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

