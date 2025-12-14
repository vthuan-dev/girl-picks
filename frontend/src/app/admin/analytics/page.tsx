'use client';

import { useState, useEffect } from 'react';
import { analyticsApi, AnalyticsData } from '@/modules/admin/api/analytics.api';
import toast from 'react-hot-toast';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

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
      console.log('Analytics data loaded:', data);
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

  const formatChartDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      if (timeRange === '7days') {
        return format(date, 'EEE', { locale: vi });
      } else if (timeRange === '30days') {
        return format(date, 'dd/MM', { locale: vi });
      } else if (timeRange === '90days') {
        return format(date, 'dd/MM', { locale: vi });
      } else {
        return format(date, 'MM/yyyy', { locale: vi });
      }
    } catch {
      return dateString;
    }
  };

  const formatTooltipDate = (dateString: string): string => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Prepare chart data
  const trafficChartData = analyticsData?.trafficData?.map((item) => ({
    date: formatChartDate(item.date),
    fullDate: item.date,
    visits: item.visits || 0,
  })) || [];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background-light border border-secondary/50 rounded-lg p-3 shadow-lg">
          <p className="text-text-muted text-sm mb-1">
            {formatTooltipDate(data.fullDate)}
          </p>
          <p className="text-text font-semibold">
            Lượt truy cập: <span className="text-blue-500">{formatNumber(payload[0].value)}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const metrics = analyticsData?.metrics ? [
    {
      label: 'Tổng lượt truy cập',
      value: formatNumber(analyticsData.metrics.totalVisits || 0),
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
      value: formatNumber(analyticsData.metrics.newUsers || 0),
      change: `+${analyticsData.metrics.usersChange?.toFixed(1) || 0}%`,
      trend: 'up' as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-green-500/20 text-green-500',
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
      <div className="grid grid-cols-1 gap-6">
        {/* Traffic Chart */}
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-4">Lượt truy cập</h2>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span className="text-text-muted">Đang tải...</span>
              </div>
            </div>
          ) : trafficChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={256}>
              <AreaChart data={trafficChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tick={{ fill: '#9ca3af' }}
                  tickFormatter={(value) => formatNumber(value)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="visits"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorVisits)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-secondary/30 rounded-lg">
              <p className="text-text-muted">Không có dữ liệu</p>
            </div>
          )}
        </div>
      </div>

      {/* Top Girls Section */}
      {isLoading ? (
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-4">Gái gọi được xem nhiều nhất</h2>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-secondary/30 rounded-lg"></div>
              </div>
            ))}
          </div>
        </div>
      ) : analyticsData?.topGirls && analyticsData.topGirls.length > 0 ? (
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-4">Gái gọi được xem nhiều nhất</h2>
          <div className="space-y-3">
            {analyticsData.topGirls.map((girl, index) => (
              <div key={girl.id} className="flex items-center justify-between p-4 bg-background rounded-xl border border-secondary/30 hover:border-primary/50 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-sm">{index + 1}</span>
                  </div>
                  {girl.avatar ? (
                    <img
                      src={girl.avatar}
                      alt={girl.name}
                      className="w-12 h-12 rounded-lg object-cover border border-secondary/30"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center">
                      <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-text truncate">{girl.name}</p>
                    <p className="text-sm text-text-muted">{girl.views.toLocaleString('vi-VN')} lượt xem</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-green-500 ml-4">+{girl.change}%</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

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
      ) : analyticsData?.topPages && analyticsData.topPages.length > 0 ? (
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-4">Trang được truy cập nhiều nhất</h2>
          <div className="space-y-3">
            {analyticsData.topPages.map((page, index) => (
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
      ) : (
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-4">Trang được truy cập nhiều nhất</h2>
          <div className="flex items-center justify-center py-12">
            <p className="text-text-muted">Không có dữ liệu</p>
          </div>
        </div>
      )}
    </div>
  );
}
