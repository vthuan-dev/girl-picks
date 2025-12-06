'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usersApi } from '../api/users.api';
import { useAuthStore } from '@/store/auth.store';
import { UserProfile, UpdateProfileDto } from '@/types/user';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  districtId: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  profile: UserProfile;
  onUpdate?: (profile: UserProfile) => void;
}

export default function ProfileForm({ profile, onUpdate }: ProfileFormProps) {
  const { updateUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.fullName,
      phone: profile.phone || '',
      bio: profile.bio || '',
      dateOfBirth: profile.dateOfBirth || '',
      address: profile.address || '',
      districtId: profile.districtId || '',
    },
  });

  useEffect(() => {
    reset({
      fullName: profile.fullName,
      phone: profile.phone || '',
      bio: profile.bio || '',
      dateOfBirth: profile.dateOfBirth || '',
      address: profile.address || '',
      districtId: profile.districtId || '',
    });
  }, [profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      const response = await usersApi.updateProfile(data as UpdateProfileDto);
      if (response.success) {
        updateUser(response.data);
        onUpdate?.(response.data);
        toast.success('Cập nhật thông tin thành công!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Cập nhật thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-text mb-2">
          Họ và tên *
        </label>
        <input
          {...register('fullName')}
          type="text"
          id="fullName"
          className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.fullName && <p className="mt-1 text-sm text-primary">{errors.fullName.message}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-text mb-2">
          Số điện thoại
        </label>
        <input
          {...register('phone')}
          type="tel"
          id="phone"
          className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-text mb-2">
          Giới thiệu
        </label>
        <textarea
          {...register('bio')}
          id="bio"
          rows={4}
          className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium text-text mb-2">
          Ngày sinh
        </label>
        <input
          {...register('dateOfBirth')}
          type="date"
          id="dateOfBirth"
          className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-text mb-2">
          Địa chỉ
        </label>
        <input
          {...register('address')}
          type="text"
          id="address"
          className="w-full px-4 py-2 bg-background-light border border-secondary rounded text-text focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
      </button>
    </form>
  );
}

