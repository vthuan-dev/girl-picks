'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/admin/Button';
import IconButton from '@/components/admin/IconButton';

export default function AdminGirlsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [verificationFilter, setVerificationFilter] = useState('Tất cả');

  const girls = [
    {
      id: '1',
      name: 'Nguyễn Thị A',
      email: 'nguyenthia@example.com',
      phone: '0901234567',
      status: 'active',
      verified: true,
      rating: 4.8,
      totalBookings: 45,
      createdAt: '2024-01-15',
      avatar: null,
    },
    {
      id: '2',
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
      phone: '0902345678',
      status: 'active',
      verified: false,
      rating: 4.5,
      totalBookings: 32,
      createdAt: '2024-02-20',
      avatar: null,
    },
    {
      id: '3',
      name: 'Lê Thị C',
      email: 'lethic@example.com',
      phone: '0903456789',
      status: 'inactive',
      verified: true,
      rating: 4.9,
      totalBookings: 67,
      createdAt: '2024-03-10',
      avatar: null,
    },
  ];

  const statuses = ['Tất cả', 'active', 'inactive', 'pending'];
  const verifications = ['Tất cả', 'verified', 'unverified'];

  const filteredGirls = girls.filter(girl => {
    const matchesSearch = girl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         girl.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         girl.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'Tất cả' || girl.status === statusFilter;
    const matchesVerification = verificationFilter === 'Tất cả' || 
                                (verificationFilter === 'verified' && girl.verified) ||
                                (verificationFilter === 'unverified' && !girl.verified);
    return matchesSearch && matchesStatus && matchesVerification;
  });

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
          <p className="text-2xl font-bold text-text">{girls.length}</p>
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
          <p className="text-2xl font-bold text-text">{girls.filter(g => g.verified).length}</p>
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
          <p className="text-2xl font-bold text-text">{girls.filter(g => g.status === 'active').length}</p>
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
          <p className="text-2xl font-bold text-text">{girls.filter(g => g.status === 'pending').length}</p>
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
                {status === 'active' ? 'Hoạt động' : status === 'inactive' ? 'Tạm khóa' : status === 'pending' ? 'Chờ duyệt' : status}
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
                {verification === 'verified' ? 'Đã xác thực' : verification === 'unverified' ? 'Chưa xác thực' : verification}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Girls Table */}
      <div className="bg-background-light rounded-xl border border-secondary/30 overflow-hidden">
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
                  Đặt lịch
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
              {filteredGirls.map((girl) => (
                <tr key={girl.id} className="hover:bg-background transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-pink-500 font-bold">
                          {girl.name.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-text truncate">{girl.name}</p>
                        <p className="text-sm text-text-muted truncate">{girl.email}</p>
                        <p className="text-xs text-text-muted">{girl.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {girl.verified ? (
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
                      <span className="text-sm font-medium text-text">{girl.rating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-text">{girl.totalBookings}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        girl.status === 'active'
                          ? 'bg-green-500/20 text-green-500'
                          : girl.status === 'inactive'
                          ? 'bg-gray-500/20 text-gray-400'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}
                    >
                      {girl.status === 'active' ? 'Hoạt động' : girl.status === 'inactive' ? 'Tạm khóa' : 'Chờ duyệt'}
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
                      <IconButton variant="default" title="Chỉnh sửa">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </IconButton>
                      <IconButton variant="danger" title="Xóa">
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
      </div>
    </div>
  );
}

