'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/admin/Button';

export default function AdminDashboardPage() {
  const stats = [
    {
      label: 'Tổng người dùng',
      value: '1,234',
      change: '+12%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'bg-blue-500/20 text-blue-500',
    },
    {
      label: 'Tổng gái gọi',
      value: '456',
      change: '+8%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'bg-pink-500/20 text-pink-500',
    },
    {
      label: 'Đặt lịch hôm nay',
      value: '89',
      change: '+23%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'bg-green-500/20 text-green-500',
    },
    {
      label: 'Chờ duyệt',
      value: '23',
      change: '-5%',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'bg-yellow-500/20 text-yellow-500',
    },
  ];

  const pendingItems = [
    { type: 'post', title: 'Bài viết mới từ Nguyễn Thị A', time: '2 giờ trước' },
    { type: 'review', title: 'Đánh giá mới từ Trần Văn B', time: '3 giờ trước' },
    { type: 'verification', title: 'Yêu cầu xác thực từ Lê Thị C', time: '5 giờ trước' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Dashboard</h1>
        <p className="text-text-muted">Tổng quan về hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
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

      {/* Quick Actions & Pending Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-5">Thao tác nhanh</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/admin/posts"
              className="group p-4 bg-background border border-secondary/50 rounded-xl hover:bg-primary/5 hover:border-primary/50 transition-all duration-200 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text text-sm">Duyệt bài viết</p>
                  <p className="text-xs text-text-muted mt-0.5">12 chờ duyệt</p>
                </div>
              </div>
            </Link>
            <Link 
              href="/admin/reviews"
              className="group p-4 bg-background border border-secondary/50 rounded-xl hover:bg-yellow-500/5 hover:border-yellow-500/50 transition-all duration-200 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text text-sm">Duyệt đánh giá</p>
                  <p className="text-xs text-text-muted mt-0.5">8 chờ duyệt</p>
                </div>
              </div>
            </Link>
            <Link 
              href="/admin/girls"
              className="group p-4 bg-background border border-secondary/50 rounded-xl hover:bg-blue-500/5 hover:border-blue-500/50 transition-all duration-200 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text text-sm">Xác thực</p>
                  <p className="text-xs text-text-muted mt-0.5">5 chờ duyệt</p>
                </div>
              </div>
            </Link>
            <Link 
              href="/admin/reports"
              className="group p-4 bg-background border border-secondary/50 rounded-xl hover:bg-red-500/5 hover:border-red-500/50 transition-all duration-200 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-text text-sm">Báo cáo</p>
                  <p className="text-xs text-text-muted mt-0.5">3 chờ xử lý</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Pending Items */}
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6">
          <h2 className="text-lg font-bold text-text mb-5">Chờ xử lý</h2>
          <div className="space-y-3">
            {pendingItems.map((item, index) => (
              <div
                key={index}
                className="group p-4 bg-background border border-secondary/50 rounded-xl hover:bg-background-light hover:border-primary/30 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-text mb-1 truncate">{item.title}</p>
                    <p className="text-sm text-text-muted">{item.time}</p>
                  </div>
                  <Button size="sm" variant="primary" className="flex-shrink-0">
                    Xem
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

