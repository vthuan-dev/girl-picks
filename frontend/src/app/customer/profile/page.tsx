'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/auth';
import GirlsManagement from '@/components/staff/GirlsManagement';
import PostsManagement from '@/components/staff/PostsManagement';
import { usersApi } from '@/modules/users/api/users.api';
import toast from 'react-hot-toast';

export default function CustomerProfilePage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'girls' | 'posts'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  const isStaff = user?.role === UserRole.STAFF_UPLOAD;
  const isGirl = user?.role === UserRole.GIRL;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ...(isStaff ? [
      { id: 'girls', label: 'Quản lý Gái', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { id: 'posts', label: 'Quản lý Phim', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    ] : []),
  ];

  useEffect(() => {
    setFullName(user?.fullName || '');
    setPhone(user?.phone || '');
  }, [user?.fullName, user?.phone]);

  const handleToggleEdit = () => {
    if (!isEditing) {
      setFullName(user?.fullName || '');
      setPhone(user?.phone || '');
    }
    setIsEditing((prev) => !prev);
  };

  const handleSave = async () => {
    if (!user) return;
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();
    if (!trimmedName) {
      toast.error('Họ tên không được để trống');
      return;
    }
    setSaving(true);
    try {
      await usersApi.updateProfile({
        fullName: trimmedName,
        phone: trimmedPhone || undefined,
      });
      updateUser({
        fullName: trimmedName,
        phone: trimmedPhone || undefined,
      });
      toast.success('Cập nhật hồ sơ thành công');
      setIsEditing(false);
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(error?.response?.data?.message || 'Không thể cập nhật hồ sơ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-text mb-1">Hồ sơ của tôi</h1>
          <p className="text-text-muted text-sm">Quản lý thông tin cá nhân</p>
        </div>
        {activeTab === 'profile' && (
          <button
            onClick={handleToggleEdit}
            className="inline-flex items-center gap-2 px-4 py-2 bg-background border border-secondary/40 text-text rounded-lg hover:border-primary/50 hover:text-primary transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditing ? "M6 18L18 6M6 6l12 12" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} />
            </svg>
            {isEditing ? 'Hủy' : 'Chỉnh sửa'}
          </button>
        )}
      </div>

      {/* Tabs for Staff */}
      {isStaff && (
        <div className="flex gap-2 p-1 bg-background-light rounded-lg border border-secondary/30 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-text-muted hover:text-text hover:bg-background'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Profile Content */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Avatar & quick info */}
          <div className="bg-background-light rounded-2xl border border-secondary/30 p-6 text-center shadow-lg shadow-black/10">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
              <h2 className="text-xl font-bold text-text mb-1">{user?.fullName || 'Người dùng'}</h2>
            <p className="text-text-muted text-sm mb-3">{user?.email}</p>
              
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-sm font-semibold text-primary">
                  {user?.role === UserRole.STAFF_UPLOAD ? 'Nhân viên' : user?.role === UserRole.GIRL ? 'Gái gọi' : 'Khách hàng'}
                </span>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2 space-y-5 bg-background-light rounded-2xl border border-secondary/30 p-6 shadow-lg shadow-black/10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-text">Thông tin cá nhân</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isEditing ? "M6 18L18 6M6 6l12 12" : "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"} />
                </svg>
                {isEditing ? 'Hủy' : 'Chỉnh sửa'}
              </button>
            </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-muted uppercase">Họ tên</label>
                  {isEditing ? (
                      <input 
                        type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-secondary/40 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                  ) : (
                      <p className="text-text font-medium text-base">{user?.fullName || 'Chưa cập nhật'}</p>
                  )}
                </div>
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-muted uppercase">Email</label>
                    <p className="text-text text-base">{user?.email || 'N/A'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-text-muted uppercase">Số điện thoại</label>
                  {isEditing ? (
                      <input 
                        type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-background border border-secondary/40 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                  ) : (
                      <p className="text-text text-base">{user?.phone || 'Chưa cập nhật'}</p>
                  )}
                </div>
                {isGirl && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-text-muted uppercase">Giá dịch vụ</label>
                      {isEditing ? (
                          <input 
                            type="text" 
                            placeholder="300K/giờ" 
                      className="w-full px-4 py-2.5 bg-background border border-secondary/40 rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                          />
                      ) : (
                          <p className="text-primary font-semibold text-base">300K/giờ</p>
                      )}
                    </div>
              )}
              </div>

              {isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving || !fullName.trim()}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                >
                  {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)} 
                  className="px-4 py-2.5 bg-background border border-secondary/40 rounded-lg text-text hover:bg-background-light transition-all font-medium"
                  >
                    Hủy
                  </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Staff Management Tabs */}
      {activeTab === 'girls' && isStaff && <GirlsManagement />}
      {activeTab === 'posts' && isStaff && <PostsManagement />}
    </div>
  );
}