'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { authApi } from '@/modules/auth/api/auth.api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import toast from 'react-hot-toast';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Thiếu mã khôi phục. Vui lòng kiểm tra lại email.');
      return;
    }
    if (password.length < 8) {
      toast.error('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.confirmPasswordReset({ token, newPassword: password });
      toast.success('Đổi mật khẩu thành công. Đăng nhập lại nhé!');
      router.replace('/auth/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể đặt lại mật khẩu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md z-10">
      <div className="relative">
        <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur opacity-50" />
        <div className="relative bg-background-light/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/30 border border-secondary/30 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Đặt lại mật khẩu</h1>
            <p className="text-text-muted text-sm">
              Nhập mật khẩu mới cho tài khoản của bạn.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">Mật khẩu mới</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                placeholder="Tối thiểu 8 ký tự"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text">Xác nhận mật khẩu</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                placeholder="Nhập lại mật khẩu"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-300 font-semibold flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang cập nhật...</span>
                </>
              ) : (
                <span>Đổi mật khẩu</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 pt-28 sm:pt-32 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        </div>
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#4a4a4a12_1px,transparent_1px),linear-gradient(to_bottom,#4a4a4a12_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />

        <Suspense fallback={
          <div className="relative w-full max-w-md z-10">
            <div className="relative bg-background-light/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/30 border border-secondary/30">
              <div className="flex items-center justify-center py-8">
                <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              </div>
            </div>
          </div>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}

