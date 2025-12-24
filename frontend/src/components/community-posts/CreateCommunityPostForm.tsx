'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import toast from 'react-hot-toast';
import { communityPostsApi } from '@/modules/community-posts/api/community-posts.api';
import GirlSearchSelect from './GirlSearchSelect';
import apiClient from '@/lib/api/client';

interface CreateCommunityPostFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateCommunityPostForm({ onSuccess, onCancel }: CreateCommunityPostFormProps) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedGirlId, setSelectedGirlId] = useState<string | undefined>();
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    content?: string;
    images?: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Validation constants
  const MAX_CONTENT_LENGTH = 1000;
  const MIN_CONTENT_WORDS = 5;
  const MAX_IMAGES = 4;
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

  const validateContent = (value: string, hasImages: boolean): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Nội dung không được để trống';
    }
    if (trimmed.length < 10) {
      return 'Nội dung quá ngắn, vui lòng nhập chi tiết hơn';
    }
    if (trimmed.length > MAX_CONTENT_LENGTH) {
      return `Nội dung không được vượt quá ${MAX_CONTENT_LENGTH} ký tự`;
    }

    const wordCount = trimmed.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount < MIN_CONTENT_WORDS && !hasImages) {
      return `Nội dung phải có ít nhất ${MIN_CONTENT_WORDS} từ hoặc có hình ảnh`;
    }
    return undefined;
  };

  const validateImage = (file: File): string | undefined => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `File không hợp lệ. Chỉ chấp nhận: ${ALLOWED_IMAGE_TYPES.map(t => t.split('/')[1].toUpperCase()).join(', ')}`;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return `File quá lớn. Kích thước tối đa: ${(MAX_IMAGE_SIZE / 1024 / 1024).toFixed(0)}MB`;
    }
    return undefined;
  };

  const requireAuth = () => {
    if (!isAuthenticated || !user) {
      toast.error('Vui lòng đăng nhập để thực hiện thao tác này');
      router.push('/auth/login');
      return false;
    }
    return true;
  };

  const uploadImage = async (file: File): Promise<string> => {
    // Convert File to Base64 string as backend expects JSON with URL/Base64
    const base64String = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      const response = await apiClient.post('/upload/image', {
        url: base64String,
        folder: 'girl-pick/posts',
      });

      const responseData = response.data;
      const data = responseData.success ? responseData.data : responseData;

      if (!data?.url) {
        throw new Error('Phản hồi từ server không chứa URL ảnh');
      }

      toast.success('Tải ảnh lên thành công!');
      return data.url;
    } catch (error: any) {
      console.error('Upload error details:', error.response?.data || error.message);
      let errorMessage = 'Không thể tải ảnh lên';

      if (error.response) {
        const errorData = error.response.data;
        errorMessage = errorData.message || errorData.error || errorMessage;

        if (error.response.status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
        } else if (error.response.status === 403) {
          errorMessage = 'Bạn không có quyền upload ảnh.';
        } else if (error.response.status === 413) {
          errorMessage = 'File quá lớn. Vui lòng chọn file nhỏ hơn 5MB.';
        }
      } else {
        errorMessage = error.message || errorMessage;
      }

      throw new Error(errorMessage);
    }
  };

  // Helper: update errors map, remove key if no error
  const setFieldError = (key: keyof typeof errors, message?: string) => {
    setErrors(prev => {
      const next = { ...prev };
      if (message) {
        next[key] = message;
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    // Real-time validation
    const hasImages = selectedImages.length > 0 || imageFiles.length > 0;
    const error = validateContent(value, hasImages);
    setFieldError('content', error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth()) return;

    // Validate all fields
    const hasImages = selectedImages.length > 0 || imageFiles.length > 0;
    const contentError = validateContent(content, hasImages);
    const imagesError = imageFiles.length > MAX_IMAGES
      ? `Chỉ được upload tối đa ${MAX_IMAGES} ảnh`
      : undefined;

    const newErrors: typeof errors = {};
    if (contentError) newErrors.content = contentError;
    if (imagesError) newErrors.images = imagesError;

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      toast.error('Vui lòng kiểm tra lại thông tin đã nhập');
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
        girlId: selectedGirlId || undefined,
      };

      await communityPostsApi.create(postData);

      toast.success('Bài viết của bạn đã được gửi và đang chờ duyệt!');

      // Reset form
      setTitle('');
      setContent('');
      setSelectedGirlId(undefined);
      setSelectedImages([]);
      setImageFiles([]);
      setErrors({});

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

    const remainingSlots = MAX_IMAGES - selectedImages.length;
    if (remainingSlots <= 0) {
      toast.error(`Chỉ được upload tối đa ${MAX_IMAGES} ảnh`);
      return;
    }

    const filesArray = Array.from(files);
    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    // Validate each file
    for (let i = 0; i < Math.min(filesArray.length, remainingSlots); i++) {
      const file = filesArray[i];
      const error = validateImage(file);
      if (error) {
        invalidFiles.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    }

    // Show errors for invalid files
    if (invalidFiles.length > 0) {
      toast.error(invalidFiles[0]); // Show first error
      if (invalidFiles.length > 1) {
        console.warn('Multiple invalid files:', invalidFiles);
      }
    }

    if (validFiles.length === 0) {
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Add valid files
    const newImageFiles = [...imageFiles, ...validFiles];
    setImageFiles(newImageFiles);

    // Create preview URLs
    const newImageUrls = validFiles.map((file) => URL.createObjectURL(file));
    setSelectedImages([...selectedImages, ...newImageUrls]);

    // Clear errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.images;
      return newErrors;
    });

    // Re-validate content (because images count changed)
    if (content.trim()) {
      const contentError = validateContent(content, true);
      setErrors(prev => ({ ...prev, content: contentError }));
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    // Revoke object URL to free memory
    if (selectedImages[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(selectedImages[index]);
    }

    setSelectedImages(selectedImages.filter((_, i) => i !== index));
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const hasImages = selectedImages.length > 0 || imageFiles.length > 0;
  const isContentValid = !validateContent(content, hasImages);
  const isImagesValid = imageFiles.length <= MAX_IMAGES && !errors.images;
  const canSubmit = !submitting && isContentValid && isImagesValid;

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

      {/* Tag Girl (optional) */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2.5">
          Điền số điện thoại gái bạn muốn đánh giá <span className="text-text-muted font-normal">(tùy chọn)</span>
        </label>
        <p className="text-xs text-text-muted mb-2">
          Nhập số điện thoại để hệ thống tự tìm và gắn đúng gái vào bài viết đánh giá của bạn
        </p>
        <GirlSearchSelect
          value={selectedGirlId}
          onChange={setSelectedGirlId}
          placeholder="Nhập số điện thoại của gái bạn muốn đánh giá..."
        />
      </div>

      {/* Title */}
      <div>
        <label htmlFor="post-title" className="block text-sm font-semibold text-text mb-2.5">
          Tiêu đề <span className="text-text-muted font-normal">(tùy chọn)</span>
        </label>
        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nhập tiêu đề cho bài viết của bạn..."
          className="w-full px-4 py-3 bg-background-light border border-secondary/30 rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 focus:border-primary/60 focus:ring-primary/20 transition-all duration-200"
        />
      </div>

      {/* Content */}
      <div>
        <label htmlFor="post-content" className="block text-sm font-semibold text-text mb-2.5">
          Nội dung <span className="text-primary font-semibold">*</span>
        </label>
        <textarea
          id="post-content"
          value={content}
          onChange={handleContentChange}
          onBlur={() => {
            const hasImages = selectedImages.length > 0 || imageFiles.length > 0;
            const error = validateContent(content, hasImages);
            setFieldError('content', error);
          }}
          placeholder="Chia sẻ suy nghĩ, trải nghiệm hoặc điều gì đó thú vị với cộng đồng..."
          rows={6}
          maxLength={MAX_CONTENT_LENGTH}
          className={`w-full px-4 py-3 bg-background-light border rounded-xl text-text placeholder:text-text-muted/60 focus:outline-none focus:ring-2 transition-all duration-200 resize-none cursor-text ${errors.content
            ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
            : 'border-secondary/30 focus:border-primary/60 focus:ring-primary/20'
            }`}
        />
        <div className="mt-2 flex items-center justify-between text-xs">
          {errors.content ? (
            <span className="text-red-500">{errors.content}</span>
          ) : (
            <span className="text-text-muted">
              Tối thiểu {MIN_CONTENT_WORDS} từ {selectedImages.length === 0 && imageFiles.length === 0 ? '' : 'hoặc có hình ảnh'}
            </span>
          )}
          <span className={`text-right ${content.length > MAX_CONTENT_LENGTH ? 'text-red-500' : 'text-text-muted'}`}>
            {content.length}/{MAX_CONTENT_LENGTH}
          </span>
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2.5">
          Hình ảnh <span className="text-text-muted font-normal">(tùy chọn, tối đa 4 ảnh)</span>
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
        {selectedImages.length < MAX_IMAGES && (
          <label className="inline-flex items-center gap-2.5 px-5 py-3 bg-background-light border-2 border-dashed border-secondary/30 rounded-xl hover:bg-background hover:border-primary/50 hover:border-solid transition-all duration-200 cursor-pointer text-sm font-medium text-text group">
            <svg className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Thêm ảnh ({selectedImages.length}/{MAX_IMAGES})</span>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              multiple
              onChange={handleImageSelect}
              className="hidden"
              disabled={selectedImages.length >= MAX_IMAGES}
            />
          </label>
        )}
        {selectedImages.length >= MAX_IMAGES && (
          <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Đã đạt giới hạn tối đa {MAX_IMAGES} ảnh (4 ảnh)</p>
          </div>
        )}
        {errors.images && (
          <div className="mt-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-xs text-red-500 font-medium">{errors.images}</p>
          </div>
        )}
        <div className="mt-2 text-xs text-text-muted">
          <p>• Chấp nhận: JPG, PNG, WEBP, GIF</p>
          <p>• Kích thước tối đa: {(MAX_IMAGE_SIZE / 1024 / 1024).toFixed(0)}MB mỗi ảnh</p>
        </div>
      </div>

      {/* Submit Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-4 border-t border-secondary/20">
        <button
          type="submit"
          disabled={!canSubmit}
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

