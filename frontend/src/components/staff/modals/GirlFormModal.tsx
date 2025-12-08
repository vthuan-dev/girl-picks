'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { girlsApi, Girl } from '@/modules/admin/api/girls.api';
import { districtsApi } from '@/modules/districts/api/districts.api';
import { District } from '@/types/district';
import toast from 'react-hot-toast';

const girlSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự').optional(),
  fullName: z.string().min(1, 'Tên không được để trống'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  age: z.number().min(18).max(60).optional(),
  districts: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
});

type GirlFormData = z.infer<typeof girlSchema>;

interface GirlFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  girl?: Girl | null;
}

export default function GirlFormModal({ isOpen, onClose, onSuccess, girl }: GirlFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const isEditMode = !!girl;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<GirlFormData>({
    resolver: zodResolver(girlSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      phone: '',
      bio: '',
      age: undefined,
      districts: [],
      images: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      loadDistricts();
      if (girl) {
        reset({
          email: girl.user?.email || '',
          fullName: girl.name || '',
          phone: girl.user?.phone || '',
          bio: girl.bio || '',
          age: girl.age,
          districts: girl.districts || [],
          images: girl.images || [],
        });
        setSelectedDistricts(girl.districts || []);
        setImageUrls(girl.images || []);
      } else {
        reset({
          email: '',
          password: '',
          fullName: '',
          phone: '',
          bio: '',
          age: undefined,
          districts: [],
          images: [],
        });
        setSelectedDistricts([]);
        setImageUrls([]);
      }
    }
  }, [isOpen, girl, reset]);

  const loadDistricts = async () => {
    try {
      const response = await districtsApi.getAllDistricts();
      // response is ApiResponse<District[]>
      const districts: District[] = response?.success && Array.isArray(response.data) 
        ? response.data 
        : [];
      setDistricts(districts);
    } catch (error) {
      console.error('Failed to load districts:', error);
    }
  };

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
      setValue('images', [...imageUrls, newImageUrl.trim()]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newImages);
    setValue('images', newImages);
  };

  const handleDistrictToggle = (districtId: string) => {
    const newDistricts = selectedDistricts.includes(districtId)
      ? selectedDistricts.filter(id => id !== districtId)
      : [...selectedDistricts, districtId];
    setSelectedDistricts(newDistricts);
    setValue('districts', newDistricts);
  };

  const onSubmit = async (data: GirlFormData) => {
    setIsLoading(true);
    try {
      if (isEditMode && girl) {
        await girlsApi.updateAdmin(girl.id, {
          name: data.fullName,
          bio: data.bio,
          districts: data.districts,
          age: data.age,
        });
        toast.success('Cập nhật gái gọi thành công');
      } else {
        await girlsApi.createAdmin({
          email: data.email,
          password: data.password || 'Default123!',
          fullName: data.fullName,
          phone: data.phone,
          bio: data.bio,
          age: data.age,
          districts: data.districts,
          images: data.images,
        });
        toast.success('Tạo gái gọi thành công');
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
              {isEditMode ? 'Chỉnh sửa Gái gọi' : 'Thêm Gái gọi mới'}
            </h2>
            <p className="text-sm text-text-muted mt-1">
              {isEditMode ? 'Cập nhật thông tin gái gọi' : 'Tạo tài khoản và profile gái gọi mới'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email {!isEditMode && <span className="text-red-500">*</span>}
              </label>
              <input
                {...register('email')}
                type="email"
                disabled={isEditMode}
                className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password - Only for create */}
            {!isEditMode && (
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  {...register('password')}
                  type="password"
                  className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  placeholder="Tối thiểu 8 ký tự"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>
            )}

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Tên <span className="text-red-500">*</span>
              </label>
              <input
                {...register('fullName')}
                className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Tên gái gọi"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Số điện thoại</label>
              <input
                {...register('phone')}
                className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="0123456789"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">Tuổi</label>
              <input
                {...register('age', { valueAsNumber: true })}
                type="number"
                min="18"
                max="60"
                className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="18-60"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Mô tả</label>
            <textarea
              {...register('bio')}
              rows={4}
              className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
              placeholder="Giới thiệu về gái gọi..."
            />
          </div>

          {/* Districts */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Khu vực</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-background rounded-xl border border-secondary/30">
              {districts.map((district) => (
                <button
                  key={district.id}
                  type="button"
                  onClick={() => handleDistrictToggle(district.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                    selectedDistricts.includes(district.id)
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'bg-background-light border border-secondary/50 text-text hover:bg-primary/10'
                  }`}
                >
                  {district.name}
                </button>
              ))}
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

