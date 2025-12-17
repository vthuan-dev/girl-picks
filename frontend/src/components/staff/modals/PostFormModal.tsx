'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { postsApi, Post } from '@/modules/admin/api/posts.api';
import { girlsApi } from '@/modules/admin/api/girls.api';
import toast from 'react-hot-toast';

const postSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  content: z.string().optional(),
  images: z.array(z.string()).optional(),
  girlId: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  videoUrl: z.string().optional(),
});

type PostFormData = z.infer<typeof postSchema>;

interface PostFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  post?: Post | null;
}

export default function PostFormModal({ isOpen, onClose, onSuccess, post }: PostFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [girls, setGirls] = useState<{ id: string; name: string }[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isEditMode = !!post;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      images: [],
      girlId: '',
      status: 'APPROVED',
    },
  });

  useEffect(() => {
    if (isOpen) {
      loadGirls();
      if (post) {
        // Handle images - can be JSON string or array
        let images: string[] = [];
        if (post.images) {
          if (typeof post.images === 'string') {
            try {
              images = JSON.parse(post.images);
            } catch {
              images = [post.images];
            }
          } else if (Array.isArray(post.images)) {
            images = post.images;
          }
        }

        reset({
          title: post.title,
          content: post.content || '',
          images: images,
          girlId: post.girl?.id || '',
          status: post.status,
          videoUrl: post.videoUrl || '',
        });
        setImageUrls(images);
        setVideoUrl(post.videoUrl || '');
      } else {
        reset({
          title: '',
          content: '',
          images: [],
          girlId: '',
          status: 'APPROVED',
          videoUrl: '',
        });
        setImageUrls([]);
        setVideoUrl('');
      }
    }
  }, [isOpen, post, reset]);

  const loadGirls = async () => {
    try {
      const response = await girlsApi.getAllAdmin({ limit: 100 });
      const girlsList = (response.data || []).map((girl: any) => ({
        id: girl.id,
        name: girl.name || girl.user?.fullName || 'Unknown',
      }));
      setGirls(girlsList);
    } catch (error) {
      console.error('Failed to load girls:', error);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      const newImages = [...imageUrls, newImageUrl.trim()];
      setImageUrls(newImages);
      setNewImageUrl('');
      setValue('images', newImages);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImages);
    setValue('images', newImages);
  };

  const handleVideoUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Vui lòng chọn file video hợp lệ (mp4, webm, ...)');
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

      const data = await res.json();
      if (!res.ok || !data?.url) {
        throw new Error(data?.error || data?.message || 'Không thể upload video');
      }

      setVideoUrl(data.url);
      setValue('videoUrl', data.url);
      toast.success('Tải video lên thành công');
    } catch (error: any) {
      console.error('Video upload error:', error);
      toast.error(error.message || 'Không thể tải video lên');
    } finally {
      setIsUploadingVideo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (data: PostFormData) => {
    setIsLoading(true);
    try {
      if (isEditMode && post) {
        await postsApi.updateAdmin(post.id, {
          title: data.title,
          content: data.content,
          images: data.images,
          girlId: data.girlId || undefined,
          status: data.status,
          videoUrl: data.videoUrl || videoUrl || undefined,
        });
        toast.success('Cập nhật phim thành công');
      } else {
        await postsApi.createAdmin({
          title: data.title,
          content: data.content,
          images: data.images,
          girlId: data.girlId || undefined,
          status: data.status,
          videoUrl: data.videoUrl || videoUrl || undefined,
        });
        toast.success('Tạo phim thành công');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
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
              {isEditMode ? 'Chỉnh sửa Phim' : 'Thêm Phim mới'}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {isEditMode ? 'Cập nhật thông tin phim' : 'Tạo phim mới'}
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
              placeholder="Tiêu đề phim"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Nội dung</label>
            <textarea
              {...register('content')}
              rows={6}
              className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Mô tả phim..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Girl Selection */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Gái gọi (tùy chọn)</label>
              <select
                {...register('girlId')}
                className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="">-- Chọn gái gọi --</option>
                {girls.map((girl) => (
                  <option key={girl.id} value={girl.id}>
                    {girl.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
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

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Hình ảnh</label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddImage())}
                  className="flex-1 px-4 py-2 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Nhập URL hình ảnh và nhấn Enter"
                />
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  Thêm
                </button>
              </div>
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Image ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-secondary/30"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Video (tùy chọn)</label>
            <div className="space-y-3">
              {videoUrl ? (
                <div className="bg-background rounded-xl border border-secondary/40 p-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="w-full sm:w-40 rounded-lg overflow-hidden bg-black/60 border border-secondary/40">
                    <video
                      src={videoUrl}
                      controls
                      className="w-full h-28 object-cover bg-black"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-text-muted break-all mb-2">
                      {videoUrl}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setVideoUrl('');
                          setValue('videoUrl', '');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-background border border-secondary/40 text-xs text-text hover:bg-background-light transition-colors cursor-pointer"
                      >
                        Xóa video
                      </button>
                    </div>
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
                        Hỗ trợ file <span className="font-medium">video/mp4</span>, tối đa <span className="font-medium">100MB</span>.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isUploadingVideo}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-2 rounded-lg bg-primary text-white text-xs sm:text-sm font-medium hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isUploadingVideo ? 'Đang tải...' : 'Chọn video'}
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    handleVideoUpload(file);
                  }
                }}
              />
            </div>
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

