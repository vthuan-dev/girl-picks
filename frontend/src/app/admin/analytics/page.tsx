'use client';

import { useState } from 'react';

export default function AdminAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7days');

  const timeRanges = [
    { value: '7days', label: '7 ngày' },
    { value: '30days', label: '30 ngày' },
    { value: '90days', label: '90 ngày' },
    { value: '1year', label: '1 năm' },
  ];

  const metrics = [
    {
      label: 'Tổng lượt truy cập',
      value: '12,345',
      change: '+12.5%',
      trend: 'up',
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
      value: '234',
      change: '+8.2%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-green-500/20 text-green-500',
    },
    {
      label: 'Đặt lịch',
      value: '1,234',
      change: '+23.1%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-purple-500/20 text-purple-500',
    },
    {
      label: 'Doanh thu',
      value: '125.5M',
      change: '+15.3%',
      trend: 'up',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-500/20 text-yellow-500',
    },
  ];

  const topPages = [
    { page: '/', views: 5432, change: '+12%' },
    { page: '/girls', views: 4321, change: '+8%' },
    { page: '/search', views: 3210, change: '+15%' },
    { page: '/gai-goi', views: 2109, change: '+5%' },
  ];

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
                px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                ${
                  timeRange === range.value
                    ? 'bg-primary text-white'
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-background-light rounded-lg border border-secondary/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${metric.color}`}>
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <div className="bg-background-light rounded-lg border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-4">Lượt truy cập</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-secondary/30 rounded-lg">
            <p className="text-text-muted">Biểu đồ sẽ được tích hợp sau</p>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="bg-background-light rounded-lg border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-4">Doanh thu</h2>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-secondary/30 rounded-lg">
            <p className="text-text-muted">Biểu đồ sẽ được tích hợp sau</p>
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="bg-background-light rounded-lg border border-secondary/30 p-6">
        <h2 className="text-lg font-bold text-text mb-4">Trang được truy cập nhiều nhất</h2>
        <div className="space-y-3">
          {topPages.map((page, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-background rounded-lg border border-secondary/30">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-text">{page.page}</p>
                  <p className="text-sm text-text-muted">{page.views.toLocaleString('vi-VN')} lượt xem</p>
                </div>
              </div>
              <span className="text-sm font-medium text-green-500">{page.change}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

