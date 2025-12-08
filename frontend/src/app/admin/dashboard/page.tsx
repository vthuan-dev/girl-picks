'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/admin/Button';
import { adminApi, DashboardStats } from '@/modules/admin/api/admin.api';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import toast from 'react-hot-toast';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingPosts, setPendingPosts] = useState<any[]>([]);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, postsRes, reviewsRes, verificationsRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getPendingPosts(1, 5),
        adminApi.getPendingReviews(1, 5),
        adminApi.getPendingVerifications(1, 5),
      ]);

      setStats(statsRes);
      setPendingPosts(postsRes.data || []);
      setPendingReviews(reviewsRes.data || []);
      setPendingVerifications(verificationsRes.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải dữ liệu dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  if (!stats || !stats.overview) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      label: 'Tổng người dùng',
      value: formatNumber(stats.overview.totalUsers || 0),
      change: '+12%', // TODO: Calculate from trends
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-blue-500/20 text-blue-500',
    },
    {
      label: 'Tổng gái gọi',
      value: formatNumber(stats.overview.totalGirls || 0),
      change: '+8%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-pink-500/20 text-pink-500',
    },
    {
      label: 'Chờ duyệt',
      value: formatNumber(
        (stats.pending.posts || 0) + 
        (stats.pending.reviews || 0) + 
        (stats.pending.verifications || 0) + 
        (stats.pending.reports || 0)
      ),
      change: '-5%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-yellow-500/20 text-yellow-500',
    },
  ];

  const quickActions = [
    {
      href: '/admin/posts',
      label: 'Duyệt bài viết',
      count: stats.pending.posts || 0,
      icon: (
        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-primary/20 text-primary hover:bg-primary/5 hover:border-primary/50',
    },
    {
      href: '/admin/reviews',
      label: 'Duyệt đánh giá',
      count: stats.pending.reviews || 0,
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/5 hover:border-yellow-500/50',
    },
    {
      href: '/admin/girls',
      label: 'Xác thực',
      count: stats.pending.verifications || 0,
      icon: (
        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      color: 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/5 hover:border-blue-500/50',
    },
    {
      href: '/admin/reports',
      label: 'Báo cáo',
      count: stats.pending.reports || 0,
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'bg-red-500/20 text-red-500 hover:bg-red-500/5 hover:border-red-500/50',
    },
  ];

  const getPendingItemTitle = (item: any, type: string) => {
    if (type === 'post') {
      return `Bài viết mới từ ${item.author?.fullName || item.girl?.user?.fullName || 'Người dùng'}`;
    } else if (type === 'review') {
      return `Đánh giá mới từ ${item.customer?.fullName || 'Người dùng'}`;
    } else if (type === 'verification') {
      return `Yêu cầu xác thực từ ${item.user?.fullName || 'Người dùng'}`;
    }
    return 'Mục chờ xử lý';
  };

  const getPendingItemHref = (item: any, type: string) => {
    if (type === 'post') return `/admin/posts?id=${item.id}`;
    if (type === 'review') return `/admin/reviews?id=${item.id}`;
    if (type === 'verification') return `/admin/girls?id=${item.id}`;
    return '#';
  };

  const allPendingItems = [
    ...pendingPosts.map(p => ({ ...p, type: 'post' })),
    ...pendingReviews.map(r => ({ ...r, type: 'review' })),
    ...pendingVerifications.map(v => ({ ...v, type: 'verification' })),
  ].sort((a, b) => new Date(b.createdAt || b.verificationRequestedAt).getTime() - new Date(a.createdAt || a.verificationRequestedAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Dashboard</h1>
        <p className="text-text-muted">Tổng quan về hệ thống</p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-background-light rounded-xl border border-secondary/30 p-6 animate-pulse">
              <div className="h-12 w-12 bg-secondary/20 rounded-xl mb-4"></div>
              <div className="h-4 bg-secondary/20 rounded w-24 mb-2"></div>
              <div className="h-8 bg-secondary/20 rounded w-16"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => (
          <div 
            key={index} 
            className="bg-background-light rounded-xl border border-secondary/30 p-6 hover:border-primary/30 transition-all duration-200 hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} shadow-sm`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-semibold px-2 py-1 rounded-md ${
                stat.change.startsWith('+') 
                  ? 'text-green-600 bg-green-500/10' 
                  : 'text-red-600 bg-red-500/10'
              }`}>
                {stat.change}
              </span>
            </div>
            <p className="text-sm text-text-muted mb-1.5">{stat.label}</p>
            <p className="text-2xl font-bold text-text">{stat.value}</p>
          </div>
        ))}
        </div>
      )}

      {/* Quick Actions & Pending Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-5">Thao tác nhanh</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action, index) => (
              <Link 
                key={index}
                href={action.href}
                className={`group p-4 bg-background border border-secondary/50 rounded-xl ${action.color} transition-all duration-200 text-left cursor-pointer`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${action.color.split(' ')[0]} rounded-xl flex items-center justify-center group-hover:opacity-80 transition-colors`}>
                    {action.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-text text-sm">{action.label}</p>
                    <p className="text-xs text-text-muted mt-0.5">{action.count} chờ duyệt</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Pending Items */}
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-5">Chờ xử lý</h2>
          <div className="space-y-3">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-background border border-secondary/50 rounded-xl animate-pulse">
                  <div className="h-4 bg-secondary/20 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-secondary/20 rounded w-1/2"></div>
                </div>
              ))
            ) : allPendingItems.length === 0 ? (
              <p className="text-text-muted text-center py-4">Không có mục nào chờ xử lý</p>
            ) : (
              allPendingItems.map((item, index) => {
                const time = formatDistanceToNow(
                  new Date(item.createdAt || item.verificationRequestedAt),
                  { addSuffix: true, locale: vi }
                );
                return (
                  <Link
                    key={index}
                    href={getPendingItemHref(item, item.type)}
                    className="group p-4 bg-background border border-secondary/50 rounded-xl hover:bg-background-light hover:border-primary/30 transition-all duration-200 cursor-pointer block"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-text mb-1 truncate">
                          {getPendingItemTitle(item, item.type)}
                        </p>
                        <p className="text-sm text-text-muted">{time}</p>
                      </div>
                      <Button size="sm" variant="primary" className="flex-shrink-0">
                        Xem
                      </Button>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

