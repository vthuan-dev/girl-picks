'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { authApi } from '@/modules/auth/api/auth.api';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng nhập email');
      return;
    }
    setIsLoading(true);
    try {
      await authApi.requestPasswordReset({ email });
      toast.success('Đã gửi hướng dẫn đặt lại mật khẩu tới email của bạn');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Không thể gửi yêu cầu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
        </div>
        <div className="fixed inset-0 bg-[linear-gradient(to_right,#4a4a4a12_1px,transparent_1px),linear-gradient(to_bottom,#4a4a4a12_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />

        <div className="relative w-full max-w-md z-10">
          <div className="relative">
            <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur opacity-50" />
            <div className="relative bg-background-light/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/30 border border-secondary/30 space-y-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Quên mật khẩu</h1>
                <p className="text-text-muted text-sm">
                  Nhập email đã đăng ký, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-text">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary/50 rounded-lg text-text placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                    placeholder="email@example.com"
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
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <span>Gửi hướng dẫn</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

