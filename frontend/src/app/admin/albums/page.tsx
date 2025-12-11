'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { albumsApi } from '@/modules/albums/api/albums.api';
import { useRouter } from 'next/navigation';
import { albumCategoriesApi, AlbumCategory } from '@/modules/albums/api/albumCategories.api';
import { tagsApi } from '@/modules/tags/api/tags.api';

type CreateAlbumForm = {
  title: string;
  description?: string;
  category?: string;
  tags?: string;
  isPublic?: boolean;
};

export default function AdminAlbumsPage() {
  const router = useRouter();
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<CreateAlbumForm>({
    defaultValues: {
      isPublic: true,
    },
  });
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<AlbumCategory[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [addingImagesFor, setAddingImagesFor] = useState<string | null>(null);
  const [addFiles, setAddFiles] = useState<File[]>([]);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const data = await albumsApi.getAll({ page: 1, limit: 20 });
      setAlbums(Array.isArray(data.data) ? data.data : []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không tải được danh sách album');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, []);

  useEffect(() => {
    const loadMeta = async () => {
      setLoadingMeta(true);
      try {
        const [cats, tgs] = await Promise.all([
          albumCategoriesApi.getAll(true),
          tagsApi.getAllTags().catch(() => []),
        ]);
        setCategories(cats || []);
        setTags(Array.isArray(tgs) ? tgs : []);
      } catch (error: any) {
        console.warn('Load meta failed', error?.message);
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMeta();
  }, []);

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const selected = Array.from(files);
    setImageFiles(selected);
    setPreviews(selected.map((f) => URL.createObjectURL(f)));
  };

  const clearImages = () => {
    previews.forEach((p) => p.startsWith('blob:') && URL.revokeObjectURL(p));
    setPreviews([]);
    setImageFiles([]);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const resp = await fetch('/api/upload/post', { method: 'POST', body: formData });
    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(err.error || 'Tải ảnh thất bại');
    }
    const json = await resp.json();
    return json.url;
  };

  const handleAddImages = async (albumId: string, files: File[]) => {
    if (files.length === 0) return;
    try {
      setAddingImagesFor(albumId);
      const urls = await Promise.all(files.map((f) => uploadFile(f)));
      await albumsApi.addImages(albumId, urls);
      toast.success('Đã thêm ảnh vào album');
      fetchAlbums();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Thêm ảnh thất bại');
    } finally {
      setAddingImagesFor(null);
      setAddFiles([]);
    }
  };

  const handlePickAddImages = (albumId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    handleAddImages(albumId, Array.from(files));
    e.target.value = '';
  };

  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('Xóa album này?')) return;
    try {
      await albumsApi.deleteAlbum(id);
      toast.success('Đã xóa album');
      fetchAlbums();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Xóa album thất bại');
    }
  };

  const onSubmit = async (values: CreateAlbumForm) => {
    try {
      if (imageFiles.length === 0) {
        toast.error('Chọn ít nhất 1 ảnh để tải lên');
        return;
      }

      const imageUrls = await Promise.all(imageFiles.map((f) => uploadFile(f)));

      await albumsApi.create({
        title: values.title,
        description: values.description,
        albumCategoryId: values.category,
        tags: values.tags ? values.tags.split(',').map((t) => t.trim()) : undefined,
        isPublic: values.isPublic,
        images: imageUrls,
      });

      toast.success('Tạo album thành công');
      reset({ title: '', description: '', category: '', tags: '', isPublic: true });
      clearImages();
      fetchAlbums();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Tạo album thất bại');
    }
  };

  const albumList = Array.isArray(albums) ? albums : [];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text">Quản lý Album ảnh</h1>
        <p className="text-text-muted text-sm">Tạo bộ sưu tập mới và xem danh sách gần đây.</p>
      </div>

      <div className="bg-background-light rounded-2xl border border-secondary/30 p-4 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text">Tạo album mới</h2>
            <p className="text-xs text-text-muted">Điền thông tin và chọn ảnh để tải lên.</p>
          </div>
          <button
            type="submit"
            form="create-album-form"
            disabled={isSubmitting}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-60"
          >
            {isSubmitting ? 'Đang tạo...' : 'Tạo album'}
          </button>
        </div>

        <form id="create-album-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Tiêu đề</label>
                <input
                  {...register('title', { required: true })}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-secondary/50 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                  placeholder="Tên album"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Mô tả</label>
                <textarea
                  {...register('description')}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-secondary/50 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary min-h-[90px]"
                  placeholder="Giới thiệu ngắn"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Danh mục</label>
                  <select
                    {...register('category')}
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-secondary/50 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    defaultValue=""
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {loadingMeta && <p className="text-xs text-text-muted mt-1">Đang tải danh mục...</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1">Tags (phân tách bởi dấu phẩy)</label>
                  <input
                    {...register('tags')}
                    list="tag-suggest"
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-secondary/50 text-text focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
                    placeholder="sexy,hot,gxinh"
                  />
                  <datalist id="tag-suggest">
                    {tags.map((t) => (
                      <option key={t} value={t} />
                    ))}
                  </datalist>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.slice(0, 10).map((t) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => {
                            const current = watch('tags') || '';
                            const list = current ? current.split(',').map((s) => s.trim()).filter(Boolean) : [];
                            if (!list.includes(t)) {
                              list.push(t);
                              setValue('tags', list.join(','));
                            }
                          }}
                          className="px-3 py-1 text-xs bg-background border border-secondary/40 rounded-full hover:border-primary hover:text-primary transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('isPublic')} className="w-4 h-4 accent-primary" defaultChecked />
                <span className="text-sm text-text">Công khai</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-text mb-1">Chọn ảnh từ máy</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSelectFiles}
                  className="block w-full text-sm text-text file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer"
                />
                <p className="text-xs text-text-muted mt-1">Chọn nhiều ảnh, ảnh đầu tiên sẽ làm cover.</p>
              </div>
              {previews.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {previews.map((src, idx) => (
                    <div key={src} className="relative aspect-square overflow-hidden rounded-lg border border-secondary/30">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`preview-${idx}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      <div className="bg-background-light rounded-2xl border border-secondary/30 p-4 sm:p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text">Album mới nhất</h2>
          <button
            onClick={fetchAlbums}
            className="text-sm text-primary hover:underline"
          >
            Làm mới
          </button>
        </div>
        {loading ? (
          <p className="text-text-muted text-sm">Đang tải...</p>
        ) : albumList.length === 0 ? (
          <p className="text-text-muted text-sm">Chưa có album nào</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {albumList.map((album) => (
              <div key={album.id} className="bg-background border border-secondary/40 rounded-xl overflow-hidden hover:border-primary/50 transition-all">
                <div className="relative w-full aspect-[4/5] bg-background-light">
                  {album.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={album.coverUrl} alt={album.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">No cover</div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg">
                    {(album._count?.images || 0)} ảnh
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-sm font-semibold text-text line-clamp-2">{album.title}</p>
                  <p className="text-xs text-text-muted">
                    {album.category || 'Chưa phân loại'}
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => router.push(`/anh-sex/${album.id}`)}
                      className="text-xs text-primary hover:underline"
                    >
                      Xem album
                    </button>
                    <label className="text-xs text-primary hover:underline cursor-pointer">
                      Thêm ảnh
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handlePickAddImages(album.id, e)}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={() => handleDeleteAlbum(album.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                  {addingImagesFor === album.id && (
                    <p className="text-xs text-text-muted">Đang thêm ảnh...</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

