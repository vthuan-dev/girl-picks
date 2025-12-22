'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '@/store/auth.store';
// Router not needed - using window.location.href for instant redirect
import toast from 'react-hot-toast';
import { UserRole } from '@/types/auth';

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Sau khi đăng nhập thành công, luôn đưa user về trang chủ
  const getRedirectPath = (_role: UserRole): string => {
        return '/';
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      
      // Validate response structure
      if (!response || !response.user) {
        console.error('❌ Invalid response:', response);
        throw new Error('Phản hồi từ server không hợp lệ');
      }

      if (!response.accessToken || !response.refreshToken) {
        console.error('❌ Missing tokens in response:', response);
        throw new Error('Thiếu token xác thực');
      }

      // Validate user data
      if (!response.user.id || !response.user.email || !response.user.role) {
        console.error('❌ Incomplete user data:', response.user);
        throw new Error('Dữ liệu người dùng không đầy đủ từ server');
      }

      // Set auth state immediately - this stores tokens in cookies and updates state
      try {
      setAuth(response);
        
        // Verify tokens were stored
        const storedToken = document.cookie
          .split('; ')
          .find((row) => row.startsWith('accessToken='));
        
        if (!storedToken) {
          console.warn('⚠️ Token may not have been stored in cookie');
        }
      } catch (authError: any) {
        console.error('❌ Error setting auth state:', authError);
        throw new Error('Không thể lưu dữ liệu xác thực');
      }
      
      // Get redirect path based on user role
      const redirectPath = getRedirectPath(response.user.role);
      
      // Validate redirect path
      if (!redirectPath || redirectPath === '/') {
        console.warn('⚠️ Invalid redirect path, using default');
      }
      
      console.log('✅ Login successful, redirecting to:', redirectPath);
      
      // Show success toast briefly
      toast.success('Đăng nhập thành công!', { duration: 1500 });
      
      // Small delay to ensure cookies are set (browser needs time to process)
      // Then redirect immediately using window.location for instant navigation
      setTimeout(() => {
        window.location.href = redirectPath;
      }, 100);
    } catch (error: any) {
      console.error('❌ Login error:', error);
      console.error('Error response:', error.response?.data);
      
      // Dịch các thông báo lỗi phổ biến từ server
      let errorMessage = error.response?.data?.message || error.message || 'Đăng nhập thất bại';
      
      // Dịch các thông báo lỗi tiếng Anh sang tiếng Việt
      const errorTranslations: { [key: string]: string } = {
        'Invalid credentials': 'Thông tin đăng nhập không đúng',
        'Invalid email or password': 'Email hoặc mật khẩu không đúng',
        'User not found': 'Không tìm thấy người dùng',
        'Account is disabled': 'Tài khoản đã bị vô hiệu hóa',
        'Account is locked': 'Tài khoản đã bị khóa',
        'Too many login attempts': 'Quá nhiều lần đăng nhập thất bại',
        'Request failed with status code 401': 'Thông tin đăng nhập không đúng',
        'Request failed with status code 403': 'Bạn không có quyền truy cập',
        'Request failed with status code 404': 'Không tìm thấy tài nguyên',
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
      setIsLoading(false);
    }
  };

  return (
    <form 
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(onSubmit)(e);
      }} 
      method="post"
      className="space-y-5 sm:space-y-6" 
      noValidate 
      autoComplete="off"
    >

      {/* Email Field */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-semibold text-text">
          Email
        </label>
            <input
              {...register('email')}
              type="email"
              id="email"
              placeholder="Nhập email của bạn"
              autoComplete="email"
              className={`
            w-full px-4 py-3 bg-background border rounded-lg
              text-text placeholder:text-text-muted/60
              focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200
                ${errors.email 
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                : 'border-secondary/50 hover:border-secondary/70'
                }
              `}
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

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-semibold text-text">
          Mật khẩu
        </label>
        <div className="relative">
            <div className="relative flex items-center">
              <input
                {...register('password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Nhập mật khẩu của bạn"
                autoComplete="current-password"
                className={`
                w-full pl-4 pr-12 py-3 bg-background border rounded-lg
                text-text placeholder:text-text-muted/60
                focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200
                  ${errors.password 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50' 
                  : 'border-secondary/50 hover:border-secondary/70'
                  }
                `}
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

      {/* Remember & Forgot */}
      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer group">
          <div className="relative w-5 h-5 flex-shrink-0">
            <input 
              type="checkbox" 
              className="absolute inset-0 w-5 h-5 opacity-0 cursor-pointer peer"
            />
            <div className="w-5 h-5 rounded border-2 border-secondary/50 bg-background peer-checked:bg-primary peer-checked:border-primary transition-all duration-200 flex items-center justify-center group-hover:border-primary/50 pointer-events-none">
              <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 20 20">
                <path d="M5 10l3 3 7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <span className="text-sm text-text-muted group-hover:text-text transition-colors">Ghi nhớ đăng nhập</span>
        </label>
        <Link 
          href="/auth/forgot-password" 
          className="text-sm text-primary hover:text-primary-hover transition-colors font-medium hover:underline underline-offset-2 cursor-pointer"
        >
          Quên mật khẩu?
        </Link>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-6 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 font-semibold flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
      >
          {isLoading ? (
            <>
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Đang đăng nhập...</span>
            </>
          ) : (
            <>
              <span>Đăng nhập</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
      </button>
    </form>
  );
}
