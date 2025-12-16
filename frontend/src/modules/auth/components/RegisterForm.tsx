'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { UserRole } from '@/types/auth';

const registerSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    password: z
      .string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Mật khẩu phải có chữ hoa, chữ thường và số',
      ),
    confirmPassword: z.string(),
    username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
    fullName: z.string().min(2, 'Họ tên phải có ít nhất 2 ký tự'),
    phone: z.string().optional(),
    role: z.nativeEnum(UserRole).default(UserRole.CUSTOMER),
  })
  .refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const { confirmPassword, username, ...registerData } = data;
      // Backend doesn't need username, only fullName
      const response = await authApi.register({
        ...registerData,
        role: registerData.role || UserRole.CUSTOMER,
      });

      const isPending =
        (response as any).pendingApproval || !(response as any).accessToken;

      if (isPending) {
        toast.success(
          (response as any).message ||
            'Đăng ký thành công. Vui lòng chờ admin duyệt tài khoản GIRL.',
        );
        router.replace('/auth/login');
        return;
      }

      setAuth(response as any);
      toast.success('Đăng ký thành công!');
      router.replace('/');
    } catch (error: any) {
      // Dịch các thông báo lỗi phổ biến từ server
      let errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại';
      
      // Dịch các thông báo lỗi tiếng Anh sang tiếng Việt
      const errorTranslations: { [key: string]: string } = {
        'Email already exists': 'Email đã được sử dụng',
        'Username already exists': 'Tên người dùng đã được sử dụng',
        'Invalid email': 'Email không hợp lệ',
        'Password too weak': 'Mật khẩu quá yếu',
        'Password must be at least': 'Mật khẩu phải có ít nhất',
        'Request failed with status code 400': 'Thông tin không hợp lệ',
        'Request failed with status code 409': 'Thông tin đã tồn tại',
        'Request failed with status code 500': 'Lỗi máy chủ, vui lòng thử lại sau',
        'Network Error': 'Lỗi kết nối, vui lòng kiểm tra internet',
      };
      
      // Kiểm tra và dịch thông báo lỗi
      for (const [english, vietnamese] of Object.entries(errorTranslations)) {
        if (errorMessage.includes(english) || errorMessage === english) {
          errorMessage = vietnamese;
          break;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
      {/* Email & Username Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Email */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-semibold text-text">
            Email <span className="text-primary">*</span>
          </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className={`
              w-full px-4 py-3 bg-background border rounded-lg
              text-text placeholder:text-text-muted
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200
                  ${errors.email 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                  : 'border-secondary/50 hover:border-secondary/70'
                  }
                `}
            placeholder="email@example.com"
              />
          {errors.email && (
            <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Username */}
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-semibold text-text">
            Tên đăng nhập <span className="text-primary">*</span>
          </label>
              <input
                {...register('username')}
                type="text"
                id="username"
                className={`
              w-full px-4 py-3 bg-background border rounded-lg
              text-text placeholder:text-text-muted
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200
                  ${errors.username 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                  : 'border-secondary/50 hover:border-secondary/70'
                  }
                `}
            placeholder="username"
              />
          {errors.username && (
            <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.username.message}
            </p>
          )}
        </div>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <label htmlFor="fullName" className="block text-sm font-semibold text-text">
          Họ và tên <span className="text-primary">*</span>
        </label>
            <input
              {...register('fullName')}
              type="text"
              id="fullName"
              className={`
            w-full px-4 py-3 bg-background border rounded-lg
            text-text placeholder:text-text-muted
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200
                ${errors.fullName 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                : 'border-secondary/50 hover:border-secondary/70'
                }
              `}
          placeholder="Nguyễn Văn A"
            />
        {errors.fullName && (
          <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {errors.fullName.message}
          </p>
        )}
      </div>

      {/* Role Selection (Dropdown to save space) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-text">Bạn là ai ?</label>
          <span className="text-xs text-text-muted">Chọn đúng vai trò để được duyệt nhanh</span>
        </div>
        <div className="relative group">
          {/* Glow border */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
          <select
            {...register('role')}
            defaultValue={UserRole.CUSTOMER}
            className="relative w-full px-4 pr-11 py-3 bg-background/90 border border-secondary/60 rounded-xl text-text focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 appearance-none cursor-pointer shadow-sm hover:border-primary/60"
          >
            <option value={UserRole.CUSTOMER}>Đồng dâm</option>
            <option value={UserRole.GIRL}>Gái – Cần admin duyệt trước khi kích hoạt</option>
          </select>
          {/* Caret */}
          <svg
            className="w-5 h-5 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        <p className="text-xs text-text-muted">
          Nếu chọn Gái, tài khoản sẽ ở trạng thái chờ duyệt và kích hoạt bởi admin.
        </p>
      </div>

      {/* Phone */}
      <div className="space-y-2">
        <label htmlFor="phone" className="block text-sm font-semibold text-text">
          Số điện thoại <span className="text-text-muted/60 font-normal text-xs">(tùy chọn)</span>
        </label>
            <input
              {...register('phone')}
              type="tel"
              id="phone"
          className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 hover:border-secondary/70"
          placeholder="0123456789"
            />
      </div>

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-semibold text-text">
            Mật khẩu <span className="text-primary">*</span>
          </label>
          <div className="relative flex items-center">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                className={`
                w-full pl-4 pr-12 py-3 bg-background border rounded-lg
                text-text placeholder:text-text-muted
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200
                  ${errors.password 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                  : 'border-secondary/50 hover:border-secondary/70'
                  }
                `}
              placeholder="Tối thiểu 8 ký tự"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center justify-center h-full w-10 text-text-muted hover:text-text transition-colors z-10 cursor-pointer rounded-full hover:bg-secondary/20"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text">
            Xác nhận mật khẩu <span className="text-primary">*</span>
          </label>
          <div className="relative flex items-center">
              <input
                {...register('confirmPassword')}
              type="password"
                id="confirmPassword"
                className={`
              w-full pl-4 pr-12 py-3 bg-background border rounded-lg
                text-text placeholder:text-text-muted
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200
                  ${errors.confirmPassword 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                  : 'border-secondary/50 hover:border-secondary/70'
                  }
                `}
              placeholder="Nhập lại mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-2 flex items-center justify-center h-full w-10 text-text-muted hover:text-text transition-colors z-10 cursor-pointer rounded-full hover:bg-secondary/20"
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500 flex items-center gap-1.5 mt-1">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {errors.confirmPassword.message}
            </p>
          )}
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start gap-3 pt-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative w-5 h-5">
            <input 
              type="checkbox" 
              id="terms"
              className="absolute inset-0 w-5 h-5 opacity-0 cursor-pointer peer"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              required
            />
            <div className="w-5 h-5 rounded border-2 border-secondary/50 bg-background peer-checked:bg-primary peer-checked:border-primary transition-all duration-200 flex items-center justify-center group-hover:border-primary/50 pointer-events-none">
              <span className="text-white text-xs font-semibold leading-none opacity-0 peer-checked:opacity-100 transition-opacity">
                ✓
              </span>
            </div>
          </div>
          <span className="text-sm text-text-muted leading-relaxed group-hover:text-text transition-colors">
            Tôi đồng ý với{' '}
            <Link href="/terms" className="text-primary hover:text-primary-hover transition-colors font-medium hover:underline underline-offset-2 cursor-pointer">
              Điều khoản dịch vụ
            </Link>
            {' '}và{' '}
            <Link href="/privacy" className="text-primary hover:text-primary-hover transition-colors font-medium hover:underline underline-offset-2 cursor-pointer">
              Chính sách bảo mật
            </Link>
          </span>
        </label>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !acceptedTerms}
        className="w-full py-3 px-6 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 font-semibold flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Đang tạo tài khoản...</span>
            </>
          ) : (
            <>
              <span>Tạo tài khoản</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
      </button>
    </form>
  );
}
