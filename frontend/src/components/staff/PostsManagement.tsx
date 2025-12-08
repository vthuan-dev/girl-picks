'use client';

import { useState, useEffect } from 'react';
import { postsApi, Post } from '@/modules/admin/api/posts.api';
import { getPaginatedData } from '@/lib/api/response-helper';
import toast from 'react-hot-toast';
import Button from '@/components/admin/Button';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import PostFormModal from './modals/PostFormModal';

export default function PostsManagement() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Tất cả');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    loadPosts();
  }, [page, searchQuery, statusFilter]);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const status = statusFilter === 'Tất cả' ? undefined : statusFilter;
      const response = await postsApi.getAllAdmin({
        search: searchQuery || undefined,
        status,
        page,
        limit: 20,
      });
      setPosts(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách phim');
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phim này?')) {
      return;
    }

    try {
      await postsApi.deleteAdmin(id);
      toast.success('Xóa phim thành công');
      loadPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa phim');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await postsApi.approve(id);
      toast.success('Duyệt phim thành công');
      loadPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể duyệt phim');
    }
  };

  const statuses = ['Tất cả', 'PENDING', 'APPROVED', 'REJECTED'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text">Quản lý Phim</h2>
          <p className="text-text-muted text-sm">Tạo, chỉnh sửa và xóa phim</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm phim
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-background-light rounded-lg border border-secondary/30 p-4 space-y-4">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-secondary/50 rounded-lg text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-background border border-secondary/50 text-text hover:bg-primary/10'
              }`}
            >
              {status === 'PENDING' ? 'Chờ duyệt' :
               status === 'APPROVED' ? 'Đã duyệt' :
               status === 'REJECTED' ? 'Từ chối' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="bg-background-light rounded-lg border border-secondary/30 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-text-muted">Đang tải...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-text-muted">Không có phim nào</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background border-b border-secondary/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Tiêu đề</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Ngày tạo</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/30">
                  {posts.map((post) => (
                    <tr key={post.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-text">{post.title}</p>
                          {post.author && (
                            <p className="text-sm text-text-muted">Bởi {post.author.fullName}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            post.status === 'APPROVED'
                              ? 'bg-green-500/20 text-green-500'
                              : post.status === 'PENDING'
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {post.status === 'APPROVED' ? 'Đã duyệt' :
                           post.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-text-muted">
                          {format(new Date(post.createdAt), 'dd/MM/yyyy', { locale: vi })}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {post.status === 'PENDING' && (
                            <button
                              onClick={() => handleApprove(post.id)}
                              className="p-2 text-green-500 hover:bg-green-500/10 rounded-lg transition-colors"
                              title="Duyệt"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                          )}
                          <button
                            onClick={() => setEditingPost(post)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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

      {/* Modals */}
      <PostFormModal
        isOpen={showCreateModal || !!editingPost}
        onClose={() => {
          setShowCreateModal(false);
          setEditingPost(null);
        }}
        onSuccess={() => {
          loadPosts();
          setShowCreateModal(false);
          setEditingPost(null);
        }}
        post={editingPost}
      />
    </div>
  );
}

