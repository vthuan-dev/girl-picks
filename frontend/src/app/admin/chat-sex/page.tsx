'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/admin/Button';
import IconButton from '@/components/admin/IconButton';
import { chatSexApi, ChatSexGirl, CreateChatSexGirlDto } from '@/modules/admin/api/chat-sex.api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import Modal from '@/components/common/Modal';

export default function AdminChatSexPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả');
  const [girls, setGirls] = useState<ChatSexGirl[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedGirl, setSelectedGirl] = useState<ChatSexGirl | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [form, setForm] = useState<CreateChatSexGirlDto>({
    name: '',
    title: '',
    age: undefined,
    bio: '',
    phone: '',
    zalo: '',
    telegram: '',
    location: '',
    province: '',
    address: '',
    price: '',
    services: [],
    workingHours: '',
    images: [],
    coverImage: '',
    tags: [],
    isVerified: false,
    isFeatured: false,
    isActive: true,
    isAvailable: true,
    rating: undefined,
    sourceUrl: '',
  });

  useEffect(() => {
    loadGirls();
  }, [statusFilter, page, searchQuery]);

  const loadGirls = async () => {
    setIsLoading(true);
    try {
      const isActive =
        statusFilter === 'Tất cả'
          ? undefined
          : statusFilter === 'Hoạt động'
            ? true
            : false;

      const response = await chatSexApi.getAll({
        search: searchQuery || undefined,
        isActive,
        page,
        limit: 20,
      });

      setGirls(response.data);
      setTotalPages(response.meta.totalPages);
      setTotal(response.meta.total);
    } catch (error: any) {
      toast.error('Không thể tải danh sách');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = async (id: string) => {
    setIsLoadingDetail(true);
    setViewModalOpen(true);
    try {
      const girl = await chatSexApi.getById(id);
      setSelectedGirl(girl);
    } catch (error: any) {
      toast.error('Không thể tải chi tiết');
      setViewModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleEdit = async (id: string) => {
    setIsLoadingDetail(true);
    setEditModalOpen(true);
    try {
      const girl = await chatSexApi.getById(id);
      setSelectedGirl(girl);
      setForm({
        name: girl.name || '',
        title: girl.title || '',
        age: girl.age,
        bio: girl.bio || '',
        phone: girl.phone || '',
        zalo: girl.zalo || '',
        telegram: girl.telegram || '',
        location: girl.location || '',
        province: girl.province || '',
        address: girl.address || '',
        price: girl.price || '',
        services: girl.services || [],
        workingHours: girl.workingHours || '',
        images: girl.images || [],
        coverImage: girl.coverImage || '',
        tags: girl.tags || [],
        isVerified: girl.isVerified || false,
        isFeatured: girl.isFeatured || false,
        isActive: girl.isActive,
        isAvailable: girl.isAvailable,
        rating: girl.rating,
        sourceUrl: girl.sourceUrl || '',
      });
    } catch (error: any) {
      toast.error('Không thể tải chi tiết');
      setEditModalOpen(false);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSave = async () => {
    if (!selectedGirl) return;

    setIsSaving(true);
    try {
      await chatSexApi.update(selectedGirl.id, form);
      toast.success('Cập nhật thành công');
      setEditModalOpen(false);
      await loadGirls();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên');
      return;
    }

    setIsSaving(true);
    try {
      await chatSexApi.create(form);
      toast.success('Tạo thành công');
      setCreateModalOpen(false);
      setForm({
        name: '',
        title: '',
        age: undefined,
        bio: '',
        phone: '',
        zalo: '',
        telegram: '',
        location: '',
        province: '',
        address: '',
        price: '',
        services: [],
        workingHours: '',
        images: [],
        coverImage: '',
        tags: [],
        isVerified: false,
        isFeatured: false,
        isActive: true,
        isAvailable: true,
        rating: undefined,
        sourceUrl: '',
      });
      await loadGirls();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể tạo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedGirl) return;

    setIsDeleting(true);
    try {
      await chatSexApi.delete(selectedGirl.id);
      toast.success('Xóa thành công');
      setDeleteModalOpen(false);
      await loadGirls();
    } catch (error: any) {
      toast.error('Không thể xóa');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text">Quản lý Gái Chat Sex</h1>
          <p className="text-text-muted mt-1">Tổng: {total} gái chat sex</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          + Thêm mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-secondary/30 rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-secondary/30 rounded-lg bg-background text-text focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option>Tất cả</option>
          <option>Hoạt động</option>
          <option>Tạm khóa</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-background-light rounded-lg border border-secondary/30 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-text-muted">Đang tải...</div>
        ) : girls.length === 0 ? (
          <div className="p-8 text-center text-text-muted">Không có dữ liệu</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-background border-b border-secondary/30">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text">Tên</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text">Phone</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text">Zalo</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text">Giá</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text">Trạng thái</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text">Lượt xem</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-text">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/30">
                {girls.map((girl) => (
                  <tr key={girl.id} className="hover:bg-background/50">
                    <td className="px-4 py-3 text-text">{girl.name}</td>
                    <td className="px-4 py-3 text-text-muted">{girl.phone || '-'}</td>
                    <td className="px-4 py-3 text-text-muted">{girl.zalo || '-'}</td>
                    <td className="px-4 py-3 text-text-muted">{girl.price || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          girl.isActive
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}
                      >
                        {girl.isActive ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{girl.viewCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <IconButton
                          onClick={() => handleView(girl.id)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          👁️
                        </IconButton>
                        <IconButton
                          onClick={() => handleEdit(girl.id)}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          ✏️
                        </IconButton>
                        <IconButton
                          onClick={() => {
                            setSelectedGirl(girl);
                            setDeleteModalOpen(true);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          🗑️
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Trước
          </Button>
          <span className="px-4 py-2 text-text">
            Trang {page} / {totalPages}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Sau
          </Button>
        </div>
      )}

      {/* View Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Chi tiết Gái Chat Sex"
        size="lg"
      >
        {isLoadingDetail ? (
          <div className="p-8 text-center">Đang tải...</div>
        ) : selectedGirl ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-text-muted">Tên</label>
              <p className="text-text font-medium">{selectedGirl.name}</p>
            </div>
            <div>
              <label className="text-sm text-text-muted">Phone</label>
              <p className="text-text">{selectedGirl.phone || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-text-muted">Zalo</label>
              <p className="text-text">{selectedGirl.zalo || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-text-muted">Telegram</label>
              <p className="text-text">{selectedGirl.telegram || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-text-muted">Giá</label>
              <p className="text-text">{selectedGirl.price || '-'}</p>
            </div>
            <div>
              <label className="text-sm text-text-muted">Ảnh</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {selectedGirl.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${selectedGirl.name} ${idx + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Chỉnh sửa Gái Chat Sex"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">Tên *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/30 rounded bg-background text-text"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/30 rounded bg-background text-text"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Zalo</label>
            <input
              type="text"
              value={form.zalo}
              onChange={(e) => setForm({ ...form, zalo: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/30 rounded bg-background text-text"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Telegram</label>
            <input
              type="text"
              value={form.telegram}
              onChange={(e) => setForm({ ...form, telegram: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/30 rounded bg-background text-text"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Giá</label>
            <input
              type="text"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/30 rounded bg-background text-text"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Ảnh (URLs, cách nhau bởi dấu phẩy)</label>
            <textarea
              value={form.images?.join(', ') || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  images: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              className="w-full px-3 py-2 border border-secondary/30 rounded bg-background text-text"
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="mr-2"
            />
            <label className="text-text">Hoạt động</label>
          </div>
          <div className="flex gap-2">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="mr-2"
            />
            <label className="text-text">Featured</label>
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setEditModalOpen(false)} variant="secondary">
              Hủy
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Thêm Gái Chat Sex"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">Tên *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/30 rounded bg-background text-text"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/30 rounded bg-background text-text"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Zalo</label>
            <input
              type="text"
              value={form.zalo}
              onChange={(e) => setForm({ ...form, zalo: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/30 rounded bg-background text-text"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Telegram</label>
            <input
              type="text"
              value={form.telegram}
              onChange={(e) => setForm({ ...form, telegram: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/30 rounded bg-background text-text"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Giá</label>
            <input
              type="text"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-3 py-2 border border-secondary/30 rounded bg-background text-text"
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-1">Ảnh (URLs, cách nhau bởi dấu phẩy)</label>
            <textarea
              value={form.images?.join(', ') || ''}
              onChange={(e) =>
                setForm({
                  ...form,
                  images: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                })
              }
              className="w-full px-3 py-2 border border-secondary/30 rounded bg-background text-text"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button onClick={() => setCreateModalOpen(false)} variant="secondary">
              Hủy
            </Button>
            <Button onClick={handleCreate} disabled={isSaving}>
              {isSaving ? 'Đang tạo...' : 'Tạo'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Xóa Gái Chat Sex"
      >
        <p className="text-text mb-4">
          Bạn có chắc muốn xóa <strong>{selectedGirl?.name}</strong>?
        </p>
        <div className="flex justify-end gap-2">
          <Button onClick={() => setDeleteModalOpen(false)} variant="secondary">
            Hủy
          </Button>
          <Button onClick={handleDelete} disabled={isDeleting} variant="danger">
            {isDeleting ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

