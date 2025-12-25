'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { moviesApi, type Movie } from '@/modules/movies/api/movies.api';
import { categoriesApi, type Category } from '@/modules/categories/api/categories.api';

const movieSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  description: z.string().optional(),
  videoUrl: z.string().min(1, 'Vui lòng upload video'),
  poster: z.string().optional(),
  thumbnail: z.string().optional(),
  duration: z.string().optional(),
  categoryId: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

type MovieFormData = z.infer<typeof movieSchema>;

interface MovieFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  movie?: Movie | null;
}

export default function MovieFormModal({ isOpen, onClose, onSuccess, movie }: MovieFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);

  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const posterInputRef = useRef<HTMLInputElement | null>(null);

  const isEditMode = !!movie;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<MovieFormData>({
    resolver: zodResolver(movieSchema),
    defaultValues: {
      title: '',
      description: '',
      videoUrl: '',
      poster: '',
      thumbnail: '',
      duration: '',
      categoryId: '',
      status: 'APPROVED',
    },
  });

  const videoUrl = watch('videoUrl');
  const poster = watch('poster');
  const durationValue = watch('duration');

  // Helper: format seconds -> HH:MM:SS or MM:SS
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // Auto-detect duration from uploaded video if chưa nhập thủ công
  useEffect(() => {
    if (!videoUrl) return;
    if (durationValue) return; // giữ giá trị người dùng đã nhập

    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = videoUrl;

    const onLoaded = () => {
      if (!isNaN(video.duration)) {
        const formatted = formatDuration(video.duration);
        setValue('duration', formatted, { shouldValidate: false });
      }
    };

    const onError = () => {
      console.warn('Không thể đọc metadata video để lấy duration');
    };

    video.addEventListener('loadedmetadata', onLoaded);
    video.addEventListener('error', onError);

    return () => {
      video.removeEventListener('loadedmetadata', onLoaded);
      video.removeEventListener('error', onError);
      video.src = '';
    };
  }, [videoUrl, durationValue, setValue]);

  useEffect(() => {
    if (!isOpen) return;

    const loadCategories = async () => {
      try {
        const data = await categoriesApi.getAll();
        setCategories(data || []);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setCategories([]);
      }
    };

    loadCategories();

    if (movie) {
      reset({
        title: movie.title,
        description: movie.description || '',
        videoUrl: movie.videoUrl,
        poster: movie.poster || '',
        thumbnail: movie.thumbnail || '',
        duration: movie.duration || '',
        categoryId: movie.categoryId || '',
        status: movie.status,
      });
    } else {
      reset({
        title: '',
        description: '',
        videoUrl: '',
        poster: '',
        thumbnail: '',
        duration: '',
        categoryId: '',
        status: 'APPROVED',
      });
    }
  }, [isOpen, movie, reset]);

  const handleUploadVideo = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      toast.error('Vui lòng chọn file video hợp lệ');
      return;
    }

    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error(`File quá lớn. Kích thước tối đa: ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
      return;
    }

    setIsUploadingVideo(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });

      // Check if response is JSON or HTML (error page)
      const contentType = res.headers.get('content-type');
      let data;
      
      if (contentType?.includes('application/json')) {
        data = await res.json();
      } else {
        // Server returned HTML (likely error page)
        const text = await res.text();
        console.error('Server returned HTML instead of JSON:', text.substring(0, 200));
        
        if (res.status === 413) {
          throw new Error('File quá lớn. Vui lòng chọn file nhỏ hơn 100MB');
        } else {
          throw new Error(`Lỗi upload: ${res.status} ${res.statusText}`);
        }
      }

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || data?.message || 'Không thể upload video');
      }
      
      setValue('videoUrl', data.url, { shouldValidate: true });
      toast.success('Upload video thành công');
    } catch (error: any) {
      console.error('Upload video error:', error);
      const errorMessage = error.message || 'Không thể upload video';
      toast.error(errorMessage);
    } finally {
      setIsUploadingVideo(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  };

  const handleUploadPoster = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file hình ảnh');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(`File quá lớn. Kích thước tối đa: ${(maxSize / 1024 / 1024).toFixed(0)}MB`);
      return;
    }

    setIsUploadingPoster(true);

    try {
      // Use FormData instead of base64 for better compatibility
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload/poster', {
        method: 'POST',
        body: formData,
      });

      // Check if response is JSON or HTML (error page)
      const contentType = res.headers.get('content-type');
      let data;
      
      if (contentType?.includes('application/json')) {
        data = await res.json();
      } else {
        // Server returned HTML (likely error page)
        const text = await res.text();
        console.error('Server returned HTML instead of JSON:', text.substring(0, 200));
        
        if (res.status === 413) {
          throw new Error('File quá lớn. Vui lòng chọn file nhỏ hơn 5MB');
        } else {
          throw new Error(`Lỗi upload: ${res.status} ${res.statusText}`);
        }
      }

      if (!res.ok || !data?.url) {
        throw new Error(data?.error || data?.message || 'Không thể upload poster');
      }
      
      setValue('poster', data.url);
      setValue('thumbnail', data.url);
      toast.success('Upload poster thành công');
    } catch (error: any) {
      console.error('Upload poster error:', error);
      const errorMessage = error.message || 'Không thể upload poster';
      toast.error(errorMessage);
    } finally {
      setIsUploadingPoster(false);
      if (posterInputRef.current) posterInputRef.current.value = '';
    }
  };

  const onSubmit = async (data: MovieFormData) => {
    setIsLoading(true);
    try {
      if (isEditMode && movie) {
        await moviesApi.updateAdmin(movie.id, {
          title: data.title,
          description: data.description,
          videoUrl: data.videoUrl,
          poster: data.poster,
          thumbnail: data.thumbnail,
          duration: data.duration,
          categoryId: data.categoryId || undefined,
          status: data.status,
        });
        toast.success('Cập nhật phim thành công');
      } else {
        await moviesApi.createAdmin({
          title: data.title,
          description: data.description,
          videoUrl: data.videoUrl,
          poster: data.poster,
          thumbnail: data.thumbnail,
          duration: data.duration,
          categoryId: data.categoryId || undefined,
          status: data.status,
        });
        toast.success('Tạo phim sex mới thành công');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Save movie error:', error);
      toast.error(error.response?.data?.message || error.message || 'Có lỗi xảy ra');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-background-light rounded-2xl border border-secondary/30 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background-light border-b border-secondary/30 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-2xl font-bold text-text">
              {isEditMode ? 'Chỉnh sửa Phim sex' : 'Upload Phim sex mới'}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {isEditMode ? 'Cập nhật thông tin phim sex' : 'Tải video và nhập thông tin phim sex'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-background rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Tiêu đề phim sex"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Mô tả</label>
            <textarea
              {...register('description')}
              rows={4}
              className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Mô tả ngắn về phim sex..."
            />
          </div>

          {/* Video & Poster */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Video */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Video <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {videoUrl ? (
                  <div className="bg-background rounded-xl border border-secondary/40 p-3">
                    <video src={videoUrl} controls className="w-full rounded-lg bg-black mb-2" />
                    <p className="text-xs text-text-muted break-all mb-2">{videoUrl}</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setValue('videoUrl', '', { shouldValidate: true });
                        }}
                        className="px-3 py-1.5 rounded-lg bg-background border border-secondary/40 text-xs text-text hover:bg-background-light transition-colors cursor-pointer"
                      >
                        Xóa video
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 bg-background rounded-xl border border-dashed border-secondary/40 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-xs sm:text-sm">
                        <p className="font-medium text-text">Chưa có video</p>
                        <p className="text-text-muted">
                          Hỗ trợ video/mp4, tối đa <span className="font-medium">100MB</span>.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isUploadingVideo}
                      onClick={() => videoInputRef.current?.click()}
                      className="px-3 py-2 rounded-lg bg-primary text-white text-xs sm:text-sm font-medium hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isUploadingVideo ? 'Đang tải...' : 'Chọn video'}
                    </button>
                  </div>
                )}
                {errors.videoUrl && (
                  <p className="mt-1 text-sm text-red-500">{errors.videoUrl.message}</p>
                )}

                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadVideo(file);
                  }}
                />
              </div>
            </div>

            {/* Poster */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Poster (ảnh bìa)</label>
              <div className="space-y-3">
                {poster ? (
                  <div className="bg-background rounded-xl border border-secondary/40 p-3 flex gap-3 items-center">
                    <div className="w-24 h-32 rounded-lg overflow-hidden bg-secondary/30 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={poster} alt="Poster" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-text-muted break-all mb-2">{poster}</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setValue('poster', '');
                            setValue('thumbnail', '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-background border border-secondary/40 text-xs text-text hover:bg-background-light transition-colors cursor-pointer"
                        >
                          Xóa poster
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 bg-background rounded-xl border border-dashed border-secondary/40 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-xs sm:text-sm">
                        <p className="font-medium text-text">Chưa có poster</p>
                        <p className="text-text-muted">
                          Khuyến khích upload poster để hiển thị đẹp ở trang danh sách.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isUploadingPoster}
                      onClick={() => posterInputRef.current?.click()}
                      className="px-3 py-2 rounded-lg bg-background border border-secondary/40 text-xs sm:text-sm font-medium text-text hover:bg-background-light disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isUploadingPoster ? 'Đang tải...' : 'Chọn poster'}
                    </button>
                  </div>
                )}

                <input
                  ref={posterInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadPoster(file);
                  }}
                />
              </div>
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text mb-2">Danh mục</label>
              <select
                {...register('categoryId')}
                className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">Trạng thái</label>
              <select
                {...register('status')}
                className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="APPROVED">Đã duyệt</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Thời lượng (tùy chọn)</label>
            <input
              {...register('duration')}
              className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder='Ví dụ: "10:30"'
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-secondary/30">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-background border border-secondary/50 text-text rounded-xl hover:bg-background-light transition-colors font-medium cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors font-medium shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Đang xử lý...' : isEditMode ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


