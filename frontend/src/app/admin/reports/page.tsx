'use client';

import { useState } from 'react';

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState('Tất cả');

  const reports = [
    {
      id: '1',
      reporterName: 'Nguyễn Văn A',
      reportedName: 'Trần Thị B',
      type: 'inappropriate_content',
      reason: 'Nội dung không phù hợp',
      description: 'Bài viết có nội dung không phù hợp với quy định',
      status: 'pending',
      createdAt: '2024-12-06T10:00:00',
    },
    {
      id: '2',
      reporterName: 'Lê Văn C',
      reportedName: 'Nguyễn Thị D',
      type: 'spam',
      reason: 'Spam',
      description: 'Người dùng này đang spam tin nhắn',
      status: 'resolved',
      createdAt: '2024-12-05T14:30:00',
    },
    {
      id: '3',
      reporterName: 'Phạm Văn E',
      reportedName: 'Hoàng Thị F',
      type: 'harassment',
      reason: 'Quấy rối',
      description: 'Người dùng này đang quấy rối tôi',
      status: 'dismissed',
      createdAt: '2024-12-04T09:15:00',
    },
  ];

  const statuses = ['Tất cả', 'pending', 'resolved', 'dismissed'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'dismissed':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'Đã xử lý';
      case 'pending':
        return 'Chờ xử lý';
      case 'dismissed':
        return 'Đã bỏ qua';
      default:
        return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'inappropriate_content':
        return 'bg-red-500/20 text-red-500';
      case 'spam':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'harassment':
        return 'bg-orange-500/20 text-orange-500';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'inappropriate_content':
        return 'Nội dung không phù hợp';
      case 'spam':
        return 'Spam';
      case 'harassment':
        return 'Quấy rối';
      default:
        return type;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = statusFilter === 'Tất cả' || report.status === statusFilter;
    return matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Quản lý Báo cáo</h1>
          <p className="text-text-muted">Xử lý các báo cáo từ người dùng</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Tổng báo cáo</p>
            <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{reports.length}</p>
        </div>
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Chờ xử lý</p>
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{reports.filter(r => r.status === 'pending').length}</p>
        </div>
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Đã xử lý</p>
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{reports.filter(r => r.status === 'resolved').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
        <div className="flex gap-2 flex-wrap">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                ${
                  statusFilter === status
                    ? 'bg-primary text-white'
                    : 'bg-background border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                }
              `}
            >
              {status === 'Tất cả' ? status : getStatusText(status)}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div
            key={report.id}
            className="bg-background-light rounded-lg border border-secondary/30 p-6 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(report.type)}`}>
                    {getTypeText(report.type)}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                    {getStatusText(report.status)}
                  </span>
                </div>
                <div className="mb-3">
                  <p className="text-sm text-text-muted mb-1">
                    <span className="font-medium text-text">Người báo cáo:</span> {report.reporterName}
                  </p>
                  <p className="text-sm text-text-muted mb-1">
                    <span className="font-medium text-text">Người bị báo cáo:</span> {report.reportedName}
                  </p>
                  <p className="text-sm text-text-muted">
                    <span className="font-medium text-text">Lý do:</span> {report.reason}
                  </p>
                </div>
                <p className="text-text mb-3 bg-background p-3 rounded-lg border border-secondary/30">
                  {report.description}
                </p>
                <p className="text-xs text-text-muted">
                  {new Date(report.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              {report.status === 'pending' && (
                <div className="flex flex-col gap-2">
                  <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm cursor-pointer">
                    Xử lý
                  </button>
                  <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm cursor-pointer">
                    Bỏ qua
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

