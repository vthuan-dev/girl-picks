'use client';

import { useState, useEffect } from 'react';
import { analyticsApi, AnalyticsData } from '@/modules/admin/api/analytics.api';
import toast from 'react-hot-toast';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7days' | '30days' | '90days' | '1year'>('7days');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const timeRanges = [
    { value: '7days' as const, label: '7 ngày' },
    { value: '30days' as const, label: '30 ngày' },
    { value: '90days' as const, label: '90 ngày' },
    { value: '1year' as const, label: '1 năm' },
  ];

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsApi.getAnalytics(timeRange);
      setAnalyticsData(data);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast.error(error.response?.data?.message || 'Không thể tải dữ liệu analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString('vi-VN');
  };

  const metrics = analyticsData ? [
    {
      label: 'Tổng lượt truy cập',
      value: formatNumber(analyticsData.metrics.totalVisits),
      change: `+${analyticsData.metrics.visitsChange?.toFixed(1) || 0}%`,
      trend: 'up' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      color: 'bg-blue-500/20 text-blue-500',
    },
    {
      label: 'Người dùng mới',
      value: formatNumber(analyticsData.metrics.newUsers),
      change: `+${analyticsData.metrics.usersChange?.toFixed(1) || 0}%`,
      trend: 'up' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-green-500/20 text-green-500',
    },
    {
      label: 'Đặt lịch',
      value: formatNumber(analyticsData.metrics.bookings),
      change: `+${analyticsData.metrics.bookingsChange?.toFixed(1) || 0}%`,
      trend: 'up' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-purple-500/20 text-purple-500',
    },
    {
      label: 'Doanh thu',
      value: `${formatNumber(analyticsData.metrics.revenue)} VNĐ`,
      change: `+${analyticsData.metrics.revenueChange?.toFixed(1) || 0}%`,
      trend: 'up' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-500/20 text-yellow-500',
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Analytics</h1>
          <p className="text-text-muted">Phân tích và thống kê hệ thống</p>
        </div>
        <div className="flex gap-2">
          {timeRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                ${
                  timeRange === range.value
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-background border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                }
              `}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-background-light rounded-xl border border-secondary/30 p-6">
              <div className="animate-pulse">
                <div className="h-12 bg-secondary/30 rounded-lg mb-4"></div>
                <div className="h-4 bg-secondary/30 rounded w-2/3 mb-2"></div>
                <div className="h-8 bg-secondary/30 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-background-light rounded-xl border border-secondary/30 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${metric.color}`}>
                  {metric.icon}
                </div>
                <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {metric.change}
                </span>
              </div>
              <p className="text-sm text-text-muted mb-1">{metric.label}</p>
              <p className="text-2xl font-bold text-text">{metric.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-4">Lượt truy cập</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-secondary/30 rounded-lg">
            <p className="text-text-muted">Biểu đồ sẽ được tích hợp sau</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-4">Doanh thu</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-secondary/30 rounded-lg">
            <p className="text-text-muted">Biểu đồ sẽ được tích hợp sau</p>
          </div>
        </div>
      </div>

      {/* Top Pages */}
      {isLoading ? (
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-4">Trang được truy cập nhiều nhất</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-secondary/30 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-4">Trang được truy cập nhiều nhất</h2>
          <div className="space-y-3">
            {analyticsData?.topPages?.map((page, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-background rounded-xl border border-secondary/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-text">{page.page}</p>
                    <p className="text-sm text-text-muted">{page.views.toLocaleString('vi-VN')} lượt xem</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-500">+{page.change}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
