'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/admin/Button';
import IconButton from '@/components/admin/IconButton';
import { girlsApi, Girl } from '@/modules/admin/api/girls.api';
import { adminApi } from '@/modules/admin/api/admin.api';
import toast from 'react-hot-toast';

export default function AdminGirlsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [verificationFilter, setVerificationFilter] = useState('Tất cả');
  const [girls, setGirls] = useState<Girl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    active: 0,
    pending: 0,
  });

  useEffect(() => {
    loadGirls();
    loadStats();
  }, [statusFilter, verificationFilter, page, searchQuery]);

  const loadGirls = async () => {
    setIsLoading(true);
    try {
      const isActive =
        statusFilter === 'Tất cả'
          ? undefined
          : statusFilter === 'Hoạt động'
            ? true
            : statusFilter === 'Tạm khóa'
              ? false
              : undefined;

      const verificationStatus =
        verificationFilter === 'Tất cả'
          ? undefined
          : verificationFilter === 'Đã xác thực'
            ? 'VERIFIED'
            : verificationFilter === 'Chưa xác thực'
              ? 'PENDING'
              : undefined;

      const response = await girlsApi.getAllAdmin({
        search: searchQuery || undefined,
        isActive,
        verificationStatus,
        page,
        limit: 20,
      });

      // Ensure response is properly formatted
      if (response && Array.isArray(response.data)) {
        setGirls(response.data);
        setTotalPages(response.totalPages || 1);
      } else {
        console.error('Invalid response format:', response);
        setGirls([]);
        setTotalPages(1);
        toast.error('Dữ liệu không đúng định dạng');
      }
    } catch (error: any) {
      console.error('Error loading girls:', error);
      setGirls([]);
      setTotalPages(1);
      toast.error(error.response?.data?.message || 'Không thể tải danh sách gái gọi');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const dashboardStats = await adminApi.getDashboardStats();
      // Calculate stats from girls data
      const allGirlsResponse = await girlsApi.getAllAdmin({ limit: 1000 });
      const allGirls = (allGirlsResponse?.data && Array.isArray(allGirlsResponse.data)) 
        ? allGirlsResponse.data 
        : [];
      
      setStats({
        total: allGirls.length,
        verified: allGirls.filter((g) => g.verificationStatus === 'VERIFIED').length,
        active: allGirls.filter((g) => g.isActive).length,
        pending: dashboardStats.pending?.verifications || 0,
      });
    } catch (error: any) {
      console.error('Error loading stats:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa gái gọi này?')) {
      return;
    }

    try {
      await girlsApi.deleteAdmin(id);
      toast.success('Xóa gái gọi thành công');
      loadGirls();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa gái gọi');
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await girlsApi.updateStatus(id, isActive);
      toast.success(isActive ? 'Kích hoạt thành công' : 'Tạm khóa thành công');
      loadGirls();
      loadStats();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái');
    }
  };

  const statuses = ['Tất cả', 'Hoạt động', 'Tạm khóa'];
  const verifications = ['Tất cả', 'Đã xác thực', 'Chưa xác thực'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Quản lý Gái gọi</h1>
          <p className="text-text-muted">Quản lý tất cả gái gọi trong hệ thống</p>
        </div>
        <Button variant="primary" size="md">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm gái gọi
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-background-light rounded-xl border border-secondary/30 p-5 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Tổng số</p>
            <div className="w-8 h-8 bg-pink-500/20 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.total}</p>
        </div>
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Đã xác thực</p>
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.verified}</p>
        </div>
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Đang hoạt động</p>
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.active}</p>
        </div>
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Chờ duyệt</p>
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{stats.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-background-light rounded-xl border border-secondary/30 p-5">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 cursor-text"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                  ${
                    statusFilter === status
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-background border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                  }
                `}
              >
                {status}
              </button>
            ))}
            {verifications.map((verification) => (
              <button
                key={verification}
                onClick={() => setVerificationFilter(verification)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                  ${
                    verificationFilter === verification
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-background border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                  }
                `}
              >
                {verification}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Girls Table */}
      <div className="bg-background-light rounded-xl border border-secondary/30 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-text-muted">Đang tải...</p>
          </div>
        ) : girls.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-muted">Không có gái gọi nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-secondary/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Gái gọi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Xác thực
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Đánh giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/30">
                  {girls.map((girl) => (
                    <tr key={girl.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                            {girl.images && Array.isArray(girl.images) && girl.images.length > 0 ? (
                              <img
                                src={girl.images[0]}
                                alt={girl.name || 'Girl'}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-pink-500 font-bold">
                                {girl.name?.charAt(0) || 'G'}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-text truncate">{girl.name || 'N/A'}</p>
                            {girl.user && (
                              <>
                                <p className="text-sm text-text-muted truncate">{girl.user.email}</p>
                                {girl.user.phone && (
                                  <p className="text-xs text-text-muted">{girl.user.phone}</p>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {girl.verificationStatus === 'VERIFIED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-500 rounded text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Đã xác thực
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded text-xs font-medium">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Chưa xác thực
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-text">
                            {girl.ratingAverage?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            girl.isActive
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {girl.isActive ? 'Hoạt động' : 'Tạm khóa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/girls/${girl.id}`}>
                            <IconButton variant="default" title="Xem chi tiết">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </IconButton>
                          </Link>
                          <IconButton
                            variant="default"
                            title={girl.isActive ? 'Tạm khóa' : 'Kích hoạt'}
                            onClick={() => handleToggleStatus(girl.id, !girl.isActive)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </IconButton>
                          <IconButton
                            variant="danger"
                            title="Xóa"
                            onClick={() => handleDelete(girl.id)}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-secondary/30 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-background border border-secondary/50 text-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10"
                >
                  Trước
                </button>
                <span className="text-text-muted">
                  Trang {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-background border border-secondary/50 text-text disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/10"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
