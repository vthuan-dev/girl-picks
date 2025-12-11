'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { albumCategoriesApi, AlbumCategory } from '@/modules/albums/api/albumCategories.api';

type CreateCatForm = {
  name: string;
  slug?: string;
  description?: string;
  order?: number;
  isActive?: boolean;
};

export default function AlbumCategoriesAdminPage() {
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateCatForm>({
    defaultValues: {
      isActive: true,
      order: 0,
    },
  });
  const [categories, setCategories] = useState<AlbumCategory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await albumCategoriesApi.getAll(true);
      setCategories(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không tải được danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (values: CreateCatForm) => {
    try {
      await albumCategoriesApi.create({
        name: values.name,
        slug: values.slug,
        description: values.description,
        order: values.order ? Number(values.order) : 0,
        isActive: values.isActive,
      });
      toast.success('Tạo danh mục thành công');
      reset({ name: '', slug: '', description: '', order: 0, isActive: true });
      fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Tạo danh mục thất bại');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-text">Quản lý danh mục Album</h1>
        <p className="text-sm text-text-muted">Tạo danh mục riêng cho album ảnh.</p>
      </div>

      <div className="bg-background-light rounded-2xl border border-secondary/30 p-4 sm:p-6 shadow space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">Tạo danh mục mới</h2>
          <button
            type="submit"
            form="create-cat-form"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo danh mục'}
          </button>
        </div>
        <form id="create-cat-form" onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Tên danh mục</label>
              <input
                {...register('name', { required: true })}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-secondary/50 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="VD: Album Gái xinh"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Slug (tùy chọn)</label>
              <input
                {...register('slug')}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-secondary/50 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                placeholder="album-gai-xinh"
              />
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Mô tả</label>
              <textarea
                {...register('description')}
                className="w-full px-4 py-2.5 rounded-lg bg-background border border-secondary/50 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary min-h-[90px]"
                placeholder="Mô tả ngắn..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3 items-center">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Thứ tự</label>
                <input
                  type="number"
                  {...register('order')}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-secondary/50 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <input type="checkbox" {...register('isActive')} className="w-4 h-4 accent-primary" defaultChecked />
                <span className="text-sm text-text">Kích hoạt</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-background-light rounded-2xl border border-secondary/30 p-4 sm:p-6 shadow">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text">Danh sách danh mục</h2>
          <button onClick={fetchData} className="text-sm text-primary hover:underline">Làm mới</button>
        </div>
        {loading ? (
          <p className="text-text-muted text-sm">Đang tải...</p>
        ) : categories.length === 0 ? (
          <p className="text-text-muted text-sm">Chưa có danh mục nào</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {categories.map((c) => (
              <div key={c.id} className="p-3 rounded-lg border border-secondary/30 bg-background flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-text">{c.name}</p>
                  {c.description && <p className="text-xs text-text-muted">{c.description}</p>}
                  <p className="text-xs text-text-muted">Slug: {c.slug || '—'} • Thứ tự: {c.order}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${c.isActive ? 'bg-green-500/20 text-green-500' : 'bg-secondary/30 text-text-muted'}`}>
                  {c.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

