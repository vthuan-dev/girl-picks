'use client';

import { useState, useEffect } from 'react';
import { girlsApi, Girl } from '@/modules/admin/api/girls.api';
import { getPaginatedData } from '@/lib/api/response-helper';
import toast from 'react-hot-toast';
import Button from '@/components/admin/Button';
import GirlFormModal from './modals/GirlFormModal';

export default function GirlsManagement() {
  const [girls, setGirls] = useState<Girl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGirl, setEditingGirl] = useState<Girl | null>(null);

  useEffect(() => {
    loadGirls();
  }, [page, searchQuery]);

  const loadGirls = async () => {
    setIsLoading(true);
    try {
      const response = await girlsApi.getAllAdmin({
        search: searchQuery || undefined,
        page,
        limit: 20,
      });
      setGirls(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể tải danh sách gái gọi');
      setGirls([]);
    } finally {
      setIsLoading(false);
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể xóa gái gọi');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-text">Quản lý Gái gọi</h2>
          <p className="text-text-muted text-sm">Tạo, chỉnh sửa và xóa gái gọi</p>
        </div>
        <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm gái gọi
        </Button>
      </div>

      {/* Search */}
      <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
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
            placeholder="Tìm kiếm theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-secondary/50 rounded-lg text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Girls List */}
      <div className="bg-background-light rounded-lg border border-secondary/30 overflow-hidden">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Tên</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase">Đánh giá</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary/30">
                  {girls.map((girl) => (
                    <tr key={girl.id} className="hover:bg-background transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                            <span className="text-pink-500 font-bold">
                              {girl.name?.charAt(0) || 'G'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-text">{girl.name || 'N/A'}</p>
                            {girl.user && (
                              <p className="text-sm text-text-muted">{girl.user.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm font-medium text-text">
                            {girl.ratingAverage?.toFixed(1) || '0.0'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingGirl(girl)}
                            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                            title="Chỉnh sửa"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(girl.id)}
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
      <GirlFormModal
        isOpen={showCreateModal || !!editingGirl}
        onClose={() => {
          setShowCreateModal(false);
          setEditingGirl(null);
        }}
        onSuccess={() => {
          loadGirls();
          setShowCreateModal(false);
          setEditingGirl(null);
        }}
        girl={editingGirl}
      />
    </div>
  );
}

