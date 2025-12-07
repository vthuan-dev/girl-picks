'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/admin/Button';
import IconButton from '@/components/admin/IconButton';
import { reportsApi, Report, ReportStatus, ReportReason } from '@/modules/admin/api/reports.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminReportsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('Tất cả');
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
  });

  const statuses: (string | ReportStatus)[] = ['Tất cả', 'PENDING', 'RESOLVED', 'DISMISSED'];

  useEffect(() => {
    loadReports();
  }, [statusFilter, page]);

  const loadReports = async () => {
    setIsLoading(true);
    try {
      const status = statusFilter === 'Tất cả' ? undefined : statusFilter as ReportStatus;
      const response = await reportsApi.getAll(status, page, 20);
      
      const reportsData = Array.isArray(response.data) ? response.data : [];
      setReports(reportsData);
      setTotalPages(response.meta?.totalPages || 1);

      // Calculate stats
      const total = reportsData.length;
      const pending = reportsData.filter(r => r.status === 'PENDING').length;
      const resolved = reportsData.filter(r => r.status === 'RESOLVED').length;
      setStats({ total, pending, resolved });
    } catch (error: any) {
      console.error('Error loading reports:', error);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách báo cáo');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = async (id: string, action: 'RESOLVED' | 'DISMISSED') => {
    const notes = action === 'RESOLVED' 
      ? prompt('Nhập ghi chú xử lý (tùy chọn):') || undefined
      : prompt('Nhập lý do bỏ qua (tùy chọn):') || undefined;

    try {
      await reportsApi.process(id, action, notes);
      toast.success(action === 'RESOLVED' ? 'Xử lý báo cáo thành công' : 'Bỏ qua báo cáo thành công');
      loadReports();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xử lý báo cáo');
    }
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'RESOLVED':
        return 'bg-green-500/20 text-green-500';
      case 'PENDING':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'DISMISSED':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: ReportStatus) => {
    switch (status) {
      case 'RESOLVED':
        return 'Đã xử lý';
      case 'PENDING':
        return 'Chờ xử lý';
      case 'DISMISSED':
        return 'Đã bỏ qua';
      default:
        return status;
    }
  };

  const getTypeColor = (reason: ReportReason) => {
    switch (reason) {
      case 'INAPPROPRIATE_CONTENT':
        return 'bg-red-500/20 text-red-500';
      case 'SPAM':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'HARASSMENT':
        return 'bg-orange-500/20 text-orange-500';
      case 'FAKE_PROFILE':
        return 'bg-purple-500/20 text-purple-500';
      case 'SCAM':
        return 'bg-pink-500/20 text-pink-500';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeText = (reason: ReportReason) => {
    switch (reason) {
      case 'INAPPROPRIATE_CONTENT':
        return 'Nội dung không phù hợp';
      case 'SPAM':
        return 'Spam';
      case 'HARASSMENT':
        return 'Quấy rối';
      case 'FAKE_PROFILE':
        return 'Hồ sơ giả';
      case 'SCAM':
        return 'Lừa đảo';
      case 'OTHER':
        return 'Khác';
      default:
        return reason;
    }
  };

  const getReportedItemInfo = (report: Report) => {
    if (report.reportedPostId) {
      return { type: 'Bài viết', id: report.reportedPostId };
    }
    if (report.reportedReviewId) {
      return { type: 'Đánh giá', id: report.reportedReviewId };
    }
    if (report.reportedUserId) {
      return { type: 'Người dùng', id: report.reportedUserId };
    }
    return null;
  };

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
        <div className="bg-background-light rounded-xl border border-secondary/30 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Tổng báo cáo</p>
            <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-background-light rounded-xl border border-secondary/30 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Chờ xử lý</p>
            <div className="w-10 h-10 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.pending}</p>
        </div>
        <div className="bg-background-light rounded-xl border border-secondary/30 p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Đã xử lý</p>
            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.resolved}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background-light rounded-xl border border-secondary/30 p-5">
        <div className="flex gap-2 flex-wrap">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`
                px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                ${
                  statusFilter === status
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-background border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                }
              `}
            >
              {status === 'Tất cả' ? status : getStatusText(status as ReportStatus)}
            </button>
          ))}
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-background-light rounded-xl border border-secondary/30 p-12 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-text-muted">Đang tải...</span>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-background-light rounded-xl border border-secondary/30 p-12 text-center">
            <p className="text-text-muted">Không có báo cáo nào</p>
          </div>
        ) : (
          reports.map((report) => {
            const reportedItem = getReportedItemInfo(report);
            return (
              <div
                key={report.id}
                className={`bg-background-light rounded-xl border p-6 hover:border-primary/50 transition-colors ${
                  report.status === 'PENDING' 
                    ? 'border-red-500/30' 
                    : report.status === 'RESOLVED'
                    ? 'border-green-500/30'
                    : 'border-secondary/30'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getTypeColor(report.reason)}`}>
                        {getTypeText(report.reason)}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>
                    <div className="mb-3 space-y-1.5">
                      <p className="text-sm text-text-muted">
                        <span className="font-medium text-text">Người báo cáo:</span> {report.reporter.fullName}
                      </p>
                      {report.reportedUser && (
                        <p className="text-sm text-text-muted">
                          <span className="font-medium text-text">Người bị báo cáo:</span> {report.reportedUser.fullName}
                        </p>
                      )}
                      {reportedItem && (
                        <p className="text-sm text-text-muted">
                          <span className="font-medium text-text">Đối tượng:</span> {reportedItem.type} (ID: {reportedItem.id.slice(0, 8)}...)
                        </p>
                      )}
                      <p className="text-sm text-text-muted">
                        <span className="font-medium text-text">Lý do:</span> {getTypeText(report.reason)}
                      </p>
                    </div>
                    <p className="text-text mb-3 bg-background p-3 rounded-lg border border-secondary/30">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-text-muted">
                      <span>
                        {format(new Date(report.createdAt), 'HH:mm:ss dd/MM/yyyy', { locale: vi })}
                      </span>
                      {report.reviewedBy && (
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Xử lý bởi: {report.reviewedBy.fullName}
                        </span>
                      )}
                    </div>
                  </div>
                  {report.status === 'PENDING' && (
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleProcess(report.id, 'RESOLVED')}
                      >
                        Xử lý
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleProcess(report.id, 'DISMISSED')}
                      >
                        Bỏ qua
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Trước
          </Button>
          <span className="text-text-muted text-sm">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}
