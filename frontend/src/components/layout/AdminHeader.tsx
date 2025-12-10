'use client';

import { useAuthStore } from '@/store/auth.store';
import { useState, memo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/modules/admin/api/admin.api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SearchResult {
  type: 'user' | 'girl' | 'post' | 'review';
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  href?: string;
}

function AdminHeader() {
  // Optimize: chỉ subscribe những fields cần thiết
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setIsLoadingNotifications(true);
      const [notifs, count] = await Promise.all([
        adminApi.getNotifications(true, 10),
        adminApi.getUnreadCount(),
      ]);
      setNotifications(notifs || []);
      setUnreadCount(count || 0);
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      // Silent fail for notifications
    } finally {
      setIsLoadingNotifications(false);
    }
  }, []);

  // Load notifications on mount and periodically
  useEffect(() => {
    // Only load if component is mounted
    if (typeof window !== 'undefined') {
      loadNotifications();
      const interval = setInterval(loadNotifications, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [loadNotifications]);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    // Only search on client side
    if (typeof window === 'undefined') return;

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await adminApi.search(searchQuery.trim());
        
        // Transform results to SearchResult format
        const transformedResults: SearchResult[] = [];
        
        if (results.users && Array.isArray(results.users)) {
          results.users.forEach((u: any) => {
            transformedResults.push({
              type: 'user',
              id: u.id,
              title: u.fullName || u.email,
              subtitle: u.email,
              href: `/admin/users?id=${u.id}`,
            });
          });
        }
        
        if (results.girls && Array.isArray(results.girls)) {
          results.girls.forEach((g: any) => {
            transformedResults.push({
              type: 'girl',
              id: g.id,
              title: g.name || g.user?.fullName,
              subtitle: g.user?.email,
              href: `/admin/girls?id=${g.id}`,
            });
          });
        }
        
        if (results.posts && Array.isArray(results.posts)) {
          results.posts.forEach((p: any) => {
            transformedResults.push({
              type: 'post',
              id: p.id,
              title: p.title,
              subtitle: p.author?.fullName || p.girl?.user?.fullName,
              href: `/admin/posts?id=${p.id}`,
            });
          });
        }
        
        if (results.reviews && Array.isArray(results.reviews)) {
          results.reviews.forEach((r: any) => {
            transformedResults.push({
              type: 'review',
              id: r.id,
              title: r.title || r.content?.substring(0, 50),
              subtitle: r.customer?.fullName,
              href: `/admin/reviews?id=${r.id}`,
            });
          });
        }
        
        setSearchResults(transformedResults.slice(0, 10)); // Limit to 10 results
        setShowSearchResults(transformedResults.length > 0);
      } catch (error: any) {
        console.error('Search error:', error);
        setSearchResults([]);
        setShowSearchResults(false);
      } finally {
        setIsSearching(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await adminApi.markAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }
    
    if (notification.href) {
      router.push(notification.href);
    }
    setShowNotifications(false);
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await adminApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('Đã đánh dấu tất cả là đã đọc');
    } catch (error: any) {
      toast.error('Không thể đánh dấu tất cả là đã đọc');
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-background-light border-b border-secondary/30 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
        {/* Left: Search & Actions */}
        <div className="flex items-center gap-4 flex-1">
          {/* Search Bar */}
          <div className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                {isSearching ? (
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm người dùng, gái gọi, bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-secondary/50 rounded-lg text-sm text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
              
              {/* Search Results Dropdown */}
              {showSearchResults && searchResults.length > 0 && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowSearchResults(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-2 bg-background-light rounded-xl border border-secondary/30 shadow-2xl z-20 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      {searchResults.map((result) => (
                        <Link
                          key={`${result.type}-${result.id}`}
                          href={result.href}
                          onClick={() => {
                            setShowSearchResults(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-background transition-colors cursor-pointer group"
                        >
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            result.type === 'user' ? 'bg-blue-500/20 text-blue-500' :
                            result.type === 'girl' ? 'bg-pink-500/20 text-pink-500' :
                            result.type === 'post' ? 'bg-green-500/20 text-green-500' :
                            'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {result.type === 'user' && (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                            {result.type === 'girl' && (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            )}
                            {result.type === 'post' && (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            )}
                            {result.type === 'review' && (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-text truncate group-hover:text-primary transition-colors">
                              {result.title}
                            </p>
                            {result.subtitle && (
                              <p className="text-xs text-text-muted truncate">{result.subtitle}</p>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: User Menu & Notifications */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) {
                  loadNotifications();
                }
              }}
              className="relative p-2 text-text-muted hover:text-text hover:bg-background rounded-lg transition-colors"
            >
              {isLoadingNotifications ? (
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              )}
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-background-light rounded-xl border border-secondary/30 shadow-2xl z-20 overflow-hidden">
                  {/* Header */}
                  <div className="p-4 border-b border-secondary/30 flex items-center justify-between">
                    <h3 className="font-bold text-text">Thông báo</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-xs text-primary hover:text-primary-hover transition-colors"
                      >
                        Đánh dấu tất cả đã đọc
                      </button>
                    )}
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-text-muted">
                        <svg className="w-12 h-12 mx-auto mb-3 text-text-muted/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p>Không có thông báo mới</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-secondary/30">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full text-left p-4 hover:bg-background transition-colors ${
                              !notification.isRead ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                !notification.isRead ? 'bg-primary' : 'bg-transparent'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm mb-1 ${
                                  !notification.isRead ? 'text-text' : 'text-text-muted'
                                }`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-text-muted line-clamp-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-text-muted mt-2">
                                  {notification.createdAt ? (() => {
                                    try {
                                      const date = new Date(notification.createdAt);
                                      if (isNaN(date.getTime())) return 'Vừa xong';
                                      return formatDistanceToNow(date, {
                                        addSuffix: true,
                                        locale: vi,
                                      });
                                    } catch {
                                      return 'Vừa xong';
                                    }
                                  })() : 'Vừa xong'}
                                </p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-secondary/30 text-center">
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs text-primary hover:text-primary-hover transition-colors"
                      >
                        Xem tất cả thông báo
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-background transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {user?.fullName?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-text">{user?.fullName || 'Admin'}</p>
                <p className="text-xs text-text-muted">{user?.email || 'admin@example.com'}</p>
              </div>
              <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-background-light rounded-xl border border-secondary/30 shadow-2xl z-20 overflow-hidden">
                  <div className="p-4 border-b border-secondary/30">
                    <p className="text-sm font-medium text-text">{user?.fullName || 'Admin'}</p>
                    <p className="text-xs text-text-muted truncate">{user?.email || 'admin@example.com'}</p>
                  </div>
                  <div className="p-2">
                    <Link
                      href="/admin/settings"
                      prefetch={true}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text hover:bg-background transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Cài đặt
                    </Link>
                    <Link
                      href="/"
                      prefetch={true}
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text hover:bg-background transition-colors cursor-pointer"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Về trang chủ
                    </Link>
                  </div>
                  <div className="p-2 border-t border-secondary/30">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Memoize component để tránh re-render không cần thiết
export default memo(AdminHeader);

