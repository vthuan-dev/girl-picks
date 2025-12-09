'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { postsApi } from '@/modules/posts/api/posts.api';
import { useAuthStore } from '@/store/auth.store';
import Link from 'next/link';

const createPostSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200, 'Tiêu đề quá dài'),
  content: z.string().min(1, 'Nội dung không được để trống').max(5000, 'Nội dung quá dài'),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

export default function CreatePostPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
  });

  if (!isAuthenticated || !user) {
    router.push('/auth/login');
    return null;
  }

  const uploadFile = async (file: File, type: 'image' | 'video'): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const endpoint = type === 'video' ? '/api/upload/video' : '/api/upload/post';
    const response = await fetch(endpoint, { method: 'POST', body: formData });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Tải lên thất bại');
    }
    return (await response.json()).url;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files).slice(0, 5 - selectedImages.length);
    setImageFiles([...imageFiles, ...newFiles]);
    setSelectedImages([...selectedImages, ...newFiles.map((f) => URL.createObjectURL(f))]);
  };

  const removeImage = (index: number) => {
    if (selectedImages[index]?.startsWith('blob:')) URL.revokeObjectURL(selectedImages[index]);
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) { toast.error('Video không được vượt quá 100MB'); return; }
    if (!file.type.startsWith('video/')) { toast.error('Vui lòng chọn file video'); return; }
    setVideoFile(file);
    setSelectedVideo(URL.createObjectURL(file));
  };

  const removeVideo = () => {
    if (selectedVideo?.startsWith('blob:')) URL.revokeObjectURL(selectedVideo);
    setSelectedVideo(null);
    setVideoFile(null);
  };

  const onSubmit = async (data: CreatePostFormData) => {
    if (!isAuthenticated || !user) { toast.error('Vui lòng đăng nhập'); router.push('/auth/login'); return; }
    setIsSubmitting(true);
    setUploadingMedia(true);

    try {
      let imageUrls: string[] = [];
      if (imageFiles.length > 0) {
        imageUrls = await Promise.all(imageFiles.map((f) => uploadFile(f, 'image')));
      }
      let videoUrl: string | undefined;
      if (videoFile) {
        videoUrl = await uploadFile(videoFile, 'video');
      }
      await postsApi.create({
        title: data.title,
        content: data.content,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        videoUrl,
      });
      toast.success('Đăng bài thành công! Bài viết đang chờ duyệt.');
      router.push('/posts');
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message || 'Không thể đăng bài');
    } finally {
      setIsSubmitting(false);
      setUploadingMedia(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/posts" className="inline-flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-text">Đăng bài mới</h1>
        <p className="text-text-muted mt-1">Chia sẻ trải nghiệm của bạn</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="bg-background-light rounded-2xl border border-secondary/30 p-5 sm:p-6 space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">Tiêu đề <span className="text-primary">*</span></label>
          <input
            {...register('title')}
            className={`w-full px-4 py-3 bg-background border rounded-xl text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${errors.title ? 'border-red-500' : 'border-secondary/50'}`}
            placeholder="Nhập tiêu đề..."
          />
          {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>}
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">Nội dung <span className="text-primary">*</span></label>
          <textarea
            {...register('content')}
            rows={8}
            className={`w-full px-4 py-3 bg-background border rounded-xl text-text placeholder:text-text-muted resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all ${errors.content ? 'border-red-500' : 'border-secondary/50'}`}
            placeholder="Chia sẻ trải nghiệm..."
          />
          {errors.content && <p className="text-sm text-red-500 mt-1">{errors.content.message}</p>}
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">Hình ảnh (tối đa 5)</label>
          {selectedImages.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
              {selectedImages.map((url, i) => (
                <div key={i} className="relative group aspect-square">
                  <img src={url} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          {selectedImages.length < 5 && (
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-secondary/50 rounded-xl text-text hover:border-primary/50 transition-all cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Chọn ảnh
              <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
            </label>
          )}
        </div>

        {/* Video */}
        <div>
          <label className="block text-sm font-medium text-text mb-2">Video (tối đa 100MB)</label>
          {selectedVideo ? (
            <div className="relative">
              <video src={selectedVideo} controls className="w-full max-h-56 rounded-xl bg-black" />
              <button type="button" onClick={removeVideo} className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              {videoFile && <p className="text-xs text-text-muted mt-2">{videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)</p>}
            </div>
          ) : (
            <label className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-secondary/50 rounded-xl text-text hover:border-primary/50 transition-all cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              Chọn video
              <input type="file" accept="video/*" onChange={handleVideoSelect} className="hidden" />
            </label>
          )}
        </div>

        {/* Info */}
        <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 text-sm text-text-muted">
          <p className="font-medium text-text mb-1">Lưu ý:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Bài viết sẽ được gửi để admin duyệt</li>
            <li>Chỉ bài đã duyệt mới hiển thị công khai</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 bg-background border border-secondary/50 rounded-xl text-text hover:bg-background-light transition-all">
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {uploadingMedia ? 'Đang upload...' : 'Đang đăng...'}
              </>
            ) : 'Đăng bài'}
          </button>
        </div>
      </form>
    </div>
  );
}