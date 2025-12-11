'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/admin/Button';
import IconButton from '@/components/admin/IconButton';
import { usersApi, User } from '@/modules/admin/api/users.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminUsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('Tất cả');
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'CUSTOMER' as 'ADMIN' | 'GIRL' | 'CUSTOMER' | 'STAFF_UPLOAD',
    avatarUrl: '',
  });

  // Only show CUSTOMER + GIRL in listing/filter by default
  const roles = ['Tất cả', 'CUSTOMER', 'GIRL'];

  useEffect(() => {
    // Apply filters from query params (role & isActive) for deep-link
    const roleParam = searchParams.get('role');
    const isActiveParam = searchParams.get('isActive');
    if (roleParam && roles.includes(roleParam)) {
      setSelectedRole(roleParam);
    }
    if (isActiveParam === 'true') setIsActiveFilter(true);
    if (isActiveParam === 'false') setIsActiveFilter(false);
    // Reset to page 1 when query changes
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    loadUsers();
  }, [selectedRole, page, isActiveFilter, searchQuery]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const role = selectedRole === 'Tất cả' ? undefined : selectedRole;
      const search = searchQuery.trim() || undefined;
      const response = await usersApi.getAll(role, isActiveFilter, page, 20, search);
      setUsers(response.data || []);
      setTotalPages(response.totalPages || 1);
      setTotal(response.total || 0);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách người dùng');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!formData.email || !formData.password || !formData.fullName) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        setIsSubmitting(false);
        return;
      }

      await usersApi.create({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        phone: formData.phone || undefined,
        role: formData.role,
        avatarUrl: formData.avatarUrl || undefined,
      });

      toast.success('Tạo người dùng thành công');
      setIsCreateModalOpen(false);
      setFormData({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: 'CUSTOMER',
        avatarUrl: '',
      });
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tạo người dùng');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await usersApi.activate(id);
      toast.success('Kích hoạt người dùng thành công');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể kích hoạt người dùng');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await usersApi.deactivate(id);
      toast.success('Vô hiệu hóa người dùng thành công');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể vô hiệu hóa người dùng');
    }
  };

  const handleApproveGirl = async (id: string) => {
    try {
      await usersApi.approveGirl(id);
      toast.success('Đã duyệt và kích hoạt tài khoản GIRL');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể duyệt tài khoản');
    }
  };

  const handleRejectGirl = async (id: string) => {
    try {
      await usersApi.rejectGirl(id);
      toast.success('Đã đánh dấu từ chối tài khoản GIRL');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể từ chối tài khoản');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    try {
      await usersApi.delete(id);
      toast.success('Xóa người dùng thành công');
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa người dùng');
    }
  };

  // Search is now handled by backend, so we just use users directly
  const filteredUsers = users.filter((user) => {
    // Exclude ADMIN/STAFF_UPLOAD from default view
    const isVisibleRole =
      selectedRole === 'Tất cả'
        ? user.role === 'GIRL' || user.role === 'CUSTOMER'
        : user.role === selectedRole;
    return isVisibleRole;
  });

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      setPage(value);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Quản lý người dùng</h1>
          <p className="text-text-muted">Quản lý tất cả người dùng trong hệ thống</p>
        </div>
        <Button 
          variant="primary" 
          size="md"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm người dùng
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-background-light rounded-2xl border border-secondary/30 p-5 shadow-lg shadow-black/10">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
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
                placeholder="Tìm kiếm theo tên, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 cursor-text shadow-sm"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {roles.map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    setSelectedRole(role);
                    setPage(1);
                  }}
                  className={`
                    px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border
                    ${
                      selectedRole === role
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/25'
                        : 'bg-background border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                    }
                  `}
                >
                  {role}
                </button>
              ))}
              <button
                onClick={() => {
                  setIsActiveFilter(isActiveFilter === undefined ? true : isActiveFilter === true ? false : undefined);
                  setPage(1);
                }}
                className={`
                  px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border
                  ${
                    isActiveFilter === true
                      ? 'bg-green-500 text-white border-green-500 shadow-md shadow-green-500/25'
                      : isActiveFilter === false
                      ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/25'
                      : 'bg-background border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50'
                  }
                `}
              >
                {isActiveFilter === undefined ? 'Tất cả trạng thái' : isActiveFilter ? 'Hoạt động' : 'Tạm khóa'}
              </button>
              <button
                onClick={() => {
                  setSelectedRole('GIRL');
                  setIsActiveFilter(false);
                  setPage(1);
                }}
                className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer border bg-primary/10 text-primary border-primary/40 hover:bg-primary/20 hover:border-primary/60"
              >
                Chờ duyệt (GIRL)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-background-light rounded-xl border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-secondary/30">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/30">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-text-muted">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Đang tải danh sách...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 0h6m-6 0a2 2 0 01-2-2v-6a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2m-6 0h6M9 7h6" />
                        </svg>
                      </div>
                      <p className="font-semibold text-text">Chưa có người dùng</p>
                      <p className="text-xs text-text-muted">Hãy thêm người dùng mới hoặc thay đổi bộ lọc</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-background/50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                          {user.avatarUrl ? (
                            <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-primary font-bold text-sm">
                              {user.fullName.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-text truncate">{user.fullName}</p>
                          <p className="text-sm text-text-muted truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-blue-500/20 text-blue-500 rounded-lg text-xs font-semibold">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                          user.isActive
                            ? 'bg-green-500/20 text-green-500'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {user.isActive
                          ? 'Hoạt động'
                          : user.role === 'GIRL'
                            ? 'Chờ duyệt'
                            : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                      {format(new Date(user.createdAt), 'dd/MM/yyyy', { locale: vi })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton 
                          variant="default" 
                          title="Xem chi tiết"
                          onClick={() => window.location.href = `/admin/users/${user.id}`}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </IconButton>
                        {user.role === 'GIRL' && !user.isActive ? (
                          <>
                            <IconButton
                              variant="default"
                              title="Duyệt & kích hoạt"
                              onClick={() => handleApproveGirl(user.id)}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </IconButton>
                            <IconButton
                              variant="danger"
                              title="Từ chối"
                              onClick={() => handleRejectGirl(user.id)}
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            </IconButton>
                          </>
                        ) : user.isActive ? (
                          <IconButton
                            variant="default"
                            title="Vô hiệu hóa"
                            onClick={() => handleDeactivate(user.id)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </IconButton>
                        ) : (
                          <IconButton
                            variant="default"
                            title="Kích hoạt"
                            onClick={() => handleActivate(user.id)}
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </IconButton>
                        )}
                        <IconButton 
                          variant="danger" 
                          title="Xóa"
                          onClick={() => handleDelete(user.id)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-secondary/30 bg-background">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="text-sm text-text-muted">
                Hiển thị <span className="font-semibold text-text">{(page - 1) * 20 + 1}</span> - <span className="font-semibold text-text">{Math.min(page * 20, total)}</span> trong tổng số <span className="font-semibold text-text">{total}</span> người dùng
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded-lg bg-background border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Trước
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted">Trang</span>
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={page}
                    onChange={handlePageInputChange}
                    className="w-16 px-2 py-1 rounded-lg bg-background border border-secondary/50 text-text text-center focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  />
                  <span className="text-sm text-text-muted">/ {totalPages}</span>
                </div>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded-lg bg-background border border-secondary/50 text-text hover:bg-primary/10 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  Sau
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background-light rounded-2xl border border-secondary/30 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-primary/20 to-primary/10 border-b border-secondary/30 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text">Tạo người dùng mới</h2>
                  <p className="text-sm text-text-muted">Thêm người dùng mới vào hệ thống</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-background hover:bg-secondary/30 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="user@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số"
                />
                <p className="mt-1 text-xs text-text-muted">Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số</p>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="0123456789"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Vai trò <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                  className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                >
                  <option value="CUSTOMER">CUSTOMER</option>
                  <option value="GIRL">GIRL</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="STAFF_UPLOAD">STAFF_UPLOAD</option>
                </select>
              </div>

              {/* Avatar URL */}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={formData.avatarUrl}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary/30">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-background border border-secondary/50 text-text hover:bg-secondary/30 transition-all duration-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tạo...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Tạo người dùng</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
