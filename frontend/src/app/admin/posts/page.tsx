'use client';

import { useState } from 'react';
import Button from '@/components/admin/Button';
import IconButton from '@/components/admin/IconButton';

export default function AdminPostsPage() {
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const posts = [
    {
      id: '1',
      title: 'Bài viết giới thiệu dịch vụ mới',
      author: 'Nguyễn Thị A',
      status: 'pending',
      views: 1234,
      likes: 56,
      comments: 12,
      createdAt: '2024-12-06T10:00:00',
    },
    {
      id: '2',
      title: 'Chia sẻ kinh nghiệm làm việc',
      author: 'Trần Thị B',
      status: 'approved',
      views: 5678,
      likes: 234,
      comments: 45,
      createdAt: '2024-12-05T14:30:00',
    },
    {
      id: '3',
      title: 'Cập nhật thông tin dịch vụ',
      author: 'Lê Thị C',
      status: 'rejected',
      views: 890,
      likes: 12,
      comments: 3,
      createdAt: '2024-12-04T09:15:00',
    },
  ];

  const statuses = ['Tất cả', 'pending', 'approved', 'rejected'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'rejected':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'pending':
        return 'Chờ duyệt';
      case 'rejected':
        return 'Từ chối';
      default:
        return status;
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'Tất cả' || post.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Quản lý Bài viết</h1>
          <p className="text-text-muted">Duyệt và quản lý bài viết trong hệ thống</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-light rounded-xl border border-secondary/30 p-5 hover:border-primary/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Tổng bài viết</p>
            <div className="w-8 h-8 bg-blue-500/20 rounded-xl flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{posts.length}</p>
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
          <p className="text-2xl font-bold text-text">{posts.filter(p => p.status === 'pending').length}</p>
        </div>
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-text-muted">Đã duyệt</p>
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text">{posts.filter(p => p.status === 'approved').length}</p>
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
              placeholder="Tìm kiếm theo tiêu đề, tác giả..."
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
                {status === 'Tất cả' ? status : getStatusText(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-background-light rounded-xl border border-secondary/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-background border-b border-secondary/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Tiêu đề
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Tác giả
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Tương tác
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary/30">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-background/50 transition-colors duration-150">
                  <td className="px-6 py-4">
                    <p className="font-medium text-text">{post.title}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="text-text">{post.author}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {post.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.834a1 1 0 001.8.6l2.7-3.6-2.7-3.6a1 1 0 00-1.8.6zM14 10.333v5.834a1 1 0 001.8.6l2.7-3.6-2.7-3.6a1 1 0 00-1.8.6z" />
                        </svg>
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        {post.comments}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusColor(post.status)}`}>
                      {getStatusText(post.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">
                    {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <IconButton variant="default" title="Xem chi tiết">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </IconButton>
                      {post.status === 'pending' && (
                        <>
                          <Button variant="success" size="sm">
                            Duyệt
                          </Button>
                          <Button variant="danger" size="sm">
                            Từ chối
                          </Button>
                        </>
                      )}
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

