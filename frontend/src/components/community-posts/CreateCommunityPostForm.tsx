'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { communityPostsApi } from '@/modules/community-posts/api/community-posts.api';

interface CreateCommunityPostFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateCommunityPostForm({ onSuccess, onCancel }: CreateCommunityPostFormProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const requireAuth = () => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
      router.push('/auth/login');
      return false;
    }
    return true;
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Không thể tải ảnh lên';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
          
          if (response.status === 403) {
            errorMessage = 'Bạn không có quyền upload ảnh. Vui lòng đăng nhập lại.';
          } else if (response.status === 413) {
            errorMessage = 'File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.';
          } else if (response.status === 400) {
            errorMessage = errorData.error || 'File không hợp lệ. Vui lòng chọn file ảnh.';
          }
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (!data.url) {
        throw new Error('Phản hồi từ server không hợp lệ');
      }
      return data.url;
    } catch (error: any) {
      if (error.message) {
        throw error;
      }
      throw new Error(error.message || 'Không thể tải ảnh lên. Vui lòng thử lại.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;
    
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết');
      return;
    }
    
    const trimmedContent = content.trim();
    const wordCount = trimmedContent.split(/\s+/).filter(word => word.length > 0).length;
    const hasImages = selectedImages.length > 0 || imageFiles.length > 0;
    
    if (wordCount <= 2 && !hasImages) {
      toast.error('Vui lòng nhập nội dung đầy đủ hơn hoặc thêm hình ảnh');
      return;
    }
    
    if (wordCount < 5 && !hasImages) {
      toast.error('Vui lòng nhập nội dung chi tiết hơn (ít nhất 5 từ) hoặc thêm hình ảnh');
      return;
    }

    try {
      setSubmitting(true);

      // Upload images to server
      const imageUrls: string[] = [];
      
      // Upload local files
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const previewUrl = selectedImages[i];
        
        try {
          const uploadedUrl = await uploadImage(file);
          imageUrls.push(uploadedUrl);
          
          // Clean up object URL after successful upload
          if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
          }
        } catch (error: any) {
          console.error('Error uploading image:', error);
          toast.error(`Không thể upload ảnh: ${file.name}`);
        }
      }
      
      // Add any manually entered URLs from selectedImages (if they're full URLs)
      selectedImages.forEach((url, index) => {
        if (index < imageFiles.length && url.startsWith('blob:')) {
          return;
        }
        
        if (url.startsWith('http://') || url.startsWith('https://')) {
          imageUrls.push(url);
        } else if (url.startsWith('/')) {
          imageUrls.push(url);
        }
      });

      // Submit post to API
      const postData = {
        title: title.trim() || undefined,
        content: content.trim(),
        images: imageUrls.length > 0 ? imageUrls : undefined,
      };

      await communityPostsApi.create(postData);

      toast.success('Bài viết của bạn đã được gửi và đang chờ duyệt!');
    
      // Reset form
      setContent('');
      setTitle('');
      setSelectedImages([]);
      setImageFiles([]);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error submitting post:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể gửi bài viết';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 5 - selectedImages.length);
    const newImageFiles = [...imageFiles, ...newFiles];
    setImageFiles(newImageFiles);

    // Create preview URLs
    const newImageUrls = newFiles.map((file) => URL.createObjectURL(file));
    setSelectedImages([...selectedImages, ...newImageUrls]);
  };

  const removeImage = (index: number) => {
    // Revoke object URL to free memory
    if (selectedImages[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(selectedImages[index]);
    }
    
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="p-6 bg-background rounded-xl border border-primary/20">
        <div className="text-center py-10">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary/30 to-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/30">
            <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-text mb-2">Vui lòng đăng nhập</h3>
          <p className="text-text-muted mb-6">Đăng nhập để chia sẻ bài viết với cộng đồng</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8 bg-background rounded-2xl border border-secondary/20 shadow-lg shadow-primary/5">
      {/* Header */}
      <div className="pb-4 border-b border-secondary/20">
        <h2 className="text-xl sm:text-2xl font-bold text-text mb-2">Tạo bài viết mới</h2>
        <p className="text-sm text-text-muted">Chia sẻ với cộng đồng và đợi admin duyệt</p>
      </div>

      {/* Title (optional) */}
      <div>
        <label htmlFor="post-title" className="block text-sm font-semibold text-text mb-2.5">
          Tiêu đề <span className="text-text-muted font-normal">(tùy chọn)</span>
        </label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tiêu đề bài viết..."
          maxLength={100}
          className="w-full px-4 py-3 bg-background-light border border-secondary/30 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 cursor-text"
        />
        <div className="mt-2 text-xs text-text-muted text-right">
          {title.length}/100
        </div>
      </div>

      {/* Content */}
      <div>
        <label htmlFor="post-content" className="block text-sm font-semibold text-text mb-2.5">
          Nội dung <span className="text-primary font-semibold">*</span>
        </label>
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Chia sẻ suy nghĩ, trải nghiệm hoặc điều gì đó thú vị với cộng đồng..."
          rows={6}
          maxLength={1000}
          className="w-full px-4 py-3 bg-background-light border border-secondary/30 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all duration-200 resize-none cursor-text"
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-text-muted">Tối thiểu 5 từ hoặc có hình ảnh</span>
          <span className="text-text-muted">{content.length}/1000</span>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2.5">
          Hình ảnh <span className="text-text-muted font-normal">(tùy chọn, tối đa 5 ảnh)</span>
        </label>
        
        {/* Image Preview Grid */}
        {selectedImages.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
            {selectedImages.map((imageUrl, index) => (
              <div key={index} className="relative group cursor-pointer">
                <div className="aspect-square rounded-xl overflow-hidden bg-secondary/20 border-2 border-secondary/30 group-hover:border-primary/50 transition-all duration-200">
                  <img
                    src={imageUrl}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer hover:bg-red-600 hover:scale-110 shadow-lg"
                  aria-label="Xóa ảnh"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        {selectedImages.length < 5 && (
          <label className="inline-flex items-center gap-2.5 px-5 py-3 bg-background-light border-2 border-dashed border-secondary/30 rounded-xl hover:bg-background hover:border-primary/50 hover:border-solid transition-all duration-200 cursor-pointer text-sm font-medium text-text group">
            <svg className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Thêm ảnh ({selectedImages.length}/5)</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              disabled={selectedImages.length >= 5}
            />
          </label>
        )}
        {selectedImages.length >= 5 && (
          <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Đã đạt giới hạn tối đa 5 ảnh</p>
          </div>
        )}
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-secondary/20">
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="flex-1 sm:flex-none px-6 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all duration-200 font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Đang gửi...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Đăng bài</span>
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={() => {
              setContent('');
              setTitle('');
              selectedImages.forEach((url) => {
                if (url.startsWith('blob:')) {
                  URL.revokeObjectURL(url);
                }
              });
              setSelectedImages([]);
              setImageFiles([]);
              onCancel();
            }}
            className="px-6 py-3 bg-background-light border border-secondary/30 text-text rounded-xl hover:bg-background hover:border-secondary/50 transition-all duration-200 font-medium cursor-pointer"
          >
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}

