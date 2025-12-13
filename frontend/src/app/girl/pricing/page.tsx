'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { girlsApi } from '@/modules/girls/api/girls.api';
import { Girl } from '@/types/girl';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function GirlPricingPage() {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [girl, setGirl] = useState<Girl | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    price: '',
    services: '',
    workingHours: '',
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'GIRL') {
      toast.error('Bạn cần đăng nhập với tài khoản GIRL');
      router.push('/auth/login');
      return;
    }
    loadProfile();
  }, [isAuthenticated, user, router]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await girlsApi.getMyProfile();
      const girlData = (response as any).data || response;
      if (girlData) {
        setGirl(girlData as Girl);
        setFormData({
          price: girlData.price || '',
          services: (girlData.services || []).join(', '),
          workingHours: girlData.workingHours || '',
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error('Không thể tải thông tin hồ sơ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!girl) return;

    try {
      setIsSubmitting(true);
      
      // Parse services from comma-separated string
      const servicesArray = formData.services
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await girlsApi.updateProfile({
        price: formData.price || undefined,
        services: servicesArray.length > 0 ? servicesArray : undefined,
        workingHours: formData.workingHours || undefined,
      });

      toast.success('Cập nhật giá và dịch vụ thành công!');
      loadProfile();
    } catch (error: any) {
      console.error('Error updating pricing:', error);
      toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setIsSubmitting(false);
    }
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
          <Link
            href="/girl/dashboard"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover"
          >
            Về Dashboard
          </Link>
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
            <h1 className="text-3xl font-bold text-text mb-2">Quản lý giá & dịch vụ</h1>
            <p className="text-text-muted">Cập nhật giá cả và các dịch vụ bạn cung cấp</p>
          </div>
          <Link
            href="/girl/dashboard"
            className="px-4 py-2 bg-background-light border border-secondary/30 rounded-lg hover:border-primary/50 transition-colors text-sm"
          >
            Về Dashboard
          </Link>
        </div>

        {/* Pricing Form */}
        <div className="bg-background-light rounded-2xl border border-secondary/30 p-6 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Giá dịch vụ
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="Ví dụ: 500K, 1.5M, 2M..."
                  className="w-full px-4 py-3 bg-background border border-secondary/30 rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <p className="text-xs text-text-muted mt-2">
                Nhập giá dịch vụ của bạn (ví dụ: 500K, 1.5M, 2M...)
              </p>
            </div>

            {/* Services */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Dịch vụ cung cấp
              </label>
              <textarea
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
                placeholder="Nhập các dịch vụ, cách nhau bởi dấu phẩy. Ví dụ: Massage, Tắm chung, BDSM..."
                rows={4}
                className="w-full px-4 py-3 bg-background border border-secondary/30 rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none"
              />
              <p className="text-xs text-text-muted mt-2">
                Nhập các dịch vụ bạn cung cấp, cách nhau bởi dấu phẩy
              </p>
            </div>

            {/* Working Hours */}
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Giờ làm việc
              </label>
              <input
                type="text"
                value={formData.workingHours}
                onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                placeholder="Ví dụ: 9:00 - 22:00, 24/7, Theo lịch hẹn..."
                className="w-full px-4 py-3 bg-background border border-secondary/30 rounded-lg text-text placeholder:text-text-muted/50 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
              />
              <p className="text-xs text-text-muted mt-2">
                Nhập giờ làm việc của bạn
              </p>
            </div>

            {/* Current Info Display */}
            <div className="bg-background rounded-xl p-4 border border-secondary/20">
              <h3 className="text-sm font-semibold text-text mb-3">Thông tin hiện tại:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-text-muted w-24">Giá:</span>
                  <span className="text-text font-medium">{girl.price || 'Chưa cập nhật'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted w-24">Dịch vụ:</span>
                  <span className="text-text font-medium">
                    {girl.services && girl.services.length > 0 ? girl.services.join(', ') : 'Chưa cập nhật'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted w-24">Giờ làm:</span>
                  <span className="text-text font-medium">{girl.workingHours || 'Chưa cập nhật'}</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật giá & dịch vụ'}
              </button>
              <Link
                href="/girl/dashboard"
                className="px-6 py-3 bg-background-light border border-secondary/30 text-text rounded-lg hover:bg-background transition-colors flex items-center justify-center"
              >
                Hủy
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

