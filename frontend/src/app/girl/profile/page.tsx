'use client';

import { useState, useEffect } from 'react';
import { girlsApi } from '@/modules/girls/api/girls.api';
import { Girl } from '@/types/girl';
import GirlProfileUpdateForm from '@/components/girls/GirlProfileUpdateForm';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function GirlProfilePage() {
  const { user, isAuthenticated, hasHydrated } = useAuthStore();
  const router = useRouter();
  const [girl, setGirl] = useState<Girl | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!isAuthenticated || user?.role !== 'GIRL') {
      toast.error('Bạn cần đăng nhập với tài khoản GIRL');
      router.push('/auth/login');
      return;
    }

    loadProfile();
  }, [hasHydrated, isAuthenticated, user, router]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await girlsApi.getMyProfile();
      // Backend returns { success: true, data: {...} }
      const girlData = (response as any).data || response;
      if (girlData) {
        // Đảm bảo có phone từ DB hoặc fallback từ user
        const mergedGirl = {
          ...girlData,
          phone: girlData.phone || user?.phone || '',
        } as Girl;
        setGirl(mergedGirl);
      } else {
        toast.error('Không thể tải thông tin hồ sơ');
      }
    } catch (error: any) {
      console.error('Load profile error:', error);
      toast.error(error.response?.data?.message || 'Không thể tải thông tin hồ sơ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = (updatedGirl: Girl) => {
    setGirl(updatedGirl);
    loadProfile(); // Reload to get latest status
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

  if (!girl) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted mb-4">Không tìm thấy hồ sơ</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text mb-2">Quản lý hồ sơ</h1>
          <p className="text-text-muted">Cập nhật thông tin và xác thực danh tính</p>
        </div>

        {/* Status Banner */}
        {girl.verificationStatus === 'VERIFIED' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-semibold text-green-500">Đã xác thực</p>
                <p className="text-sm text-text-muted">Hồ sơ của bạn đã được admin duyệt</p>
              </div>
            </div>
          </div>
        )}

        {girl.needsReverify && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="font-semibold text-orange-500">Chờ duyệt lại</p>
                <p className="text-sm text-text-muted">Hồ sơ của bạn đang chờ admin duyệt sau khi cập nhật</p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-background-light rounded-2xl border border-secondary/30 p-6 shadow-lg">
          <GirlProfileUpdateForm girl={girl} onUpdate={handleUpdate} />
        </div>
      </div>
    </div>
  );
}

