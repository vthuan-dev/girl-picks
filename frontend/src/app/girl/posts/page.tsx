'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { postsApi, Post } from '@/modules/posts/api/posts.api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function GirlPostsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    images: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'GIRL') {
      toast.error('Bạn cần đăng nhập với tài khoản GIRL');
      router.push('/auth/login');
      return;
    }
    loadPosts();
  }, [isAuthenticated, user, router]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await postsApi.getMyPosts();
      const postsData = (response as any).data || [];
      setPosts(postsData);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      toast.error('Không thể tải danh sách bài viết');
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/image', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Cookies.get('accessToken')}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || error.message || 'Không thể tải ảnh lên');
    }

    const data = await response.json();
    return data.url;
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).slice(0, 10 - imageFiles.length - formData.images.length);
    setImageFiles((prev) => [...prev, ...newFiles]);

    // Auto upload files
    try {
      setUploadingImages(true);
      const uploadPromises = newFiles.map((file) => uploadImage(file));
      const uploadedUrls = await Promise.all(uploadPromises);

      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedUrls],
      });

      // Clear file input
      if (e.target) {
        e.target.value = '';
      }
    } catch (error: any) {
      console.error('Error uploading images:', error);
      const errorMessage = error.message || error.error || `Không thể upload ảnh: ${newFiles[0]?.name || 'file'}`;
      toast.error(errorMessage);
      // Remove failed files
      setImageFiles((prev) => prev.slice(0, prev.length - newFiles.length));
    } finally {
      setUploadingImages(false);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim() && !formData.images.includes(newImageUrl.trim())) {
      setFormData({
        ...formData,
        images: [...formData.images, newImageUrl.trim()],
      });
      setNewImageUrl('');
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
    // Also remove from imageFiles if it was uploaded
    if (index < imageFiles.length) {
      setImageFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    try {
      setIsSubmitting(true);
      await postsApi.create({
        title: formData.title,
        ...(formData.content && { content: formData.content }),
        ...(formData.images.length > 0 && { images: formData.images }),
      });
      toast.success('Bài viết đã được tạo và đang chờ duyệt!');
      setFormData({ title: '', content: '', images: [] });
      setShowForm(false);
      loadPosts();
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo bài viết');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text mb-2">Quản lý bài viết</h1>
            <p className="text-text-muted">Đăng bài và quản lý bài viết của bạn</p>
          </div>
          <Link
            href="/girl/dashboard"
            className="px-4 py-2 bg-background-light border border-secondary/30 rounded-lg hover:border-primary/50 transition-colors text-sm"
          >
            Về Dashboard
          </Link>
        </div>

        {/* Create Post Button */}
        {!showForm && (
          <div className="mb-6">
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Đăng bài mới
            </button>
          </div>
        )}

        {/* Create Post Form */}
        {showForm && (
          <div className="bg-background-light rounded-2xl border border-secondary/30 p-6 mb-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text">Đăng bài mới</h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setFormData({ title: '', content: '', images: [] });
                }}
                className="text-text-muted hover:text-text"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Tiêu đề <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập tiêu đề bài viết..."
                  className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">Nội dung</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Nhập nội dung bài viết..."
                  rows={6}
                  className="w-full px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Hình ảnh
                </label>

                {/* File Upload */}
                <div className="mb-3">
                  <label className="inline-flex items-center gap-2 px-4 py-2 bg-background-light border border-secondary/30 rounded-lg hover:bg-background hover:border-primary/50 transition-all cursor-pointer text-sm font-medium text-text">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Chọn ảnh từ máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileSelect}
                      disabled={uploadingImages || formData.images.length >= 10}
                      className="hidden"
                    />
                  </label>
                  {uploadingImages && (
                    <span className="ml-3 text-sm text-text-muted">Đang upload...</span>
                  )}
                  {formData.images.length >= 10 && (
                    <span className="ml-3 text-sm text-text-muted">Đã đạt giới hạn 10 ảnh</span>
                  )}
                </div>

                {/* URL Input */}
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Hoặc nhập URL hình ảnh..."
                    className="flex-1 px-4 py-2 bg-background border border-secondary/30 rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddImage();
                      }
                    }}
                    disabled={formData.images.length >= 10}
                  />
                  <button
                    type="button"
                    onClick={handleAddImage}
                    disabled={formData.images.length >= 10 || !newImageUrl.trim()}
                    className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Thêm URL
                  </button>
                </div>

                {/* Image Preview */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-secondary/30"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder-image.png';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang đăng...' : 'Đăng bài'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ title: '', content: '', images: [] });
                  }}
                  className="px-6 py-3 bg-background-light border border-secondary/30 text-text rounded-lg hover:bg-background transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-background-light rounded-2xl border border-secondary/30">
              <svg className="w-16 h-16 text-text-muted mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-text-muted mb-4">Bạn chưa có bài viết nào</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
              >
                Đăng bài đầu tiên
              </button>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-background-light rounded-2xl border border-secondary/30 p-6 shadow-lg hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-text mb-2">{post.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-text-muted mb-2">
                      <span>{formatDate(post.createdAt)}</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${post.status === 'APPROVED'
                          ? 'bg-green-500/20 text-green-500'
                          : post.status === 'PENDING'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-red-500/20 text-red-500'
                          }`}
                      >
                        {post.status === 'APPROVED' ? 'Đã duyệt' : post.status === 'PENDING' ? 'Chờ duyệt' : 'Từ chối'}
                      </span>
                    </div>
                  </div>
                </div>

                {post.content && (
                  <p className="text-text mb-4 whitespace-pre-wrap">{post.content}</p>
                )}

                {post.images && Array.isArray(post.images) && post.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {post.images.slice(0, 6).map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-secondary/30"
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-4 border-t border-secondary/20">
                  <span className="text-sm text-text-muted">
                    {post._count?.likes || 0} lượt thích
                  </span>
                  <span className="text-sm text-text-muted">
                    {post._count?.comments || 0} bình luận
                  </span>
                  <span className="text-sm text-text-muted">
                    {post.viewCount || 0} lượt xem
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

