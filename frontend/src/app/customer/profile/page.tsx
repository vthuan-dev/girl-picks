'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { UserRole } from '@/types/auth';
import GirlsManagement from '@/components/staff/GirlsManagement';
import PostsManagement from '@/components/staff/PostsManagement';

export default function CustomerProfilePage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'girls' | 'posts'>('profile');
  const [isEditing, setIsEditing] = useState(false);

  const isStaff = user?.role === UserRole.STAFF_UPLOAD;
  const isGirl = user?.role === UserRole.GIRL;

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    ...(isStaff ? [
      { id: 'girls', label: 'Quản lý Gái', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
      { id: 'posts', label: 'Quản lý Phim', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    ] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text">Profile của tôi</h1>
          <p className="text-text-muted mt-1 text-sm sm:text-base">
            Quản lý thông tin cá nhân{isStaff ? ' và nội dung' : ''} của bạn
          </p>
        </div>
        {activeTab === 'profile' && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-medium shadow-lg shadow-primary/20"
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
        <div className="flex gap-2 p-1 bg-background-light rounded-xl border border-secondary/30 overflow-x-auto scrollbar-hide">
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
          {/* Left Column - Avatar & Quick Info */}
          <div className="space-y-6">
            {/* Avatar Card */}
            <div className="bg-background-light rounded-2xl border border-secondary/30 p-6 text-center shadow-sm shadow-black/10">
              <div className="relative inline-block mb-4">
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-primary/30 flex items-center justify-center mx-auto">
                  <span className="text-4xl font-bold text-primary">
                    {user?.fullName?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                {isEditing && (
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                )}
              </div>
              <h2 className="text-xl font-bold text-text">{user?.fullName || 'Người dùng'}</h2>
              <p className="text-text-muted text-sm mt-1">{user?.email}</p>
              
              {/* Role Badge */}
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-text font-medium">
                  {user?.role === UserRole.STAFF_UPLOAD ? 'Nhân viên' : user?.role === UserRole.GIRL ? 'Gái gọi' : 'Khách hàng'}
                </span>
              </div>

              {/* Status for Girl */}
              {isGirl && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping opacity-75" />
                  </div>
                  <span className="text-sm text-green-500 font-medium">Đang hoạt động</span>
                </div>
              )}
            </div>

            {/* Stats for Girl */}
            {isGirl && (
              <div className="bg-background-light rounded-2xl border border-secondary/30 p-5 space-y-4 shadow-sm shadow-black/10">
                <h3 className="font-semibold text-text">Thống kê</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">Đánh giá</span>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold text-text">4.8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">Thu nhập</span>
                    <span className="font-bold text-green-500">12.5M</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Info Card */}
            <div className="bg-background-light rounded-2xl border border-secondary/30 p-6 shadow-sm shadow-black/10">
              <h3 className="font-semibold text-text mb-5">Thông tin cá nhân</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="min-w-0">
                  <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Họ tên</label>
                  {isEditing ? (
                    <input type="text" defaultValue={user?.fullName || ''} className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary transition-all" />
                  ) : (
                    <p className="text-text font-medium">{user?.fullName || 'Chưa cập nhật'}</p>
                  )}
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Email</label>
                  <p className="text-text">{user?.email || 'N/A'}</p>
                </div>
                <div className="min-w-0">
                  <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Số điện thoại</label>
                  {isEditing ? (
                    <input type="tel" defaultValue={user?.phone || ''} className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary transition-all" />
                  ) : (
                    <p className="text-text">{user?.phone || 'Chưa cập nhật'}</p>
                  )}
                </div>
                {isGirl && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Giá dịch vụ</label>
                      {isEditing ? (
                        <input type="text" placeholder="300K/giờ" className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary transition-all" />
                      ) : (
                        <p className="text-primary font-bold">300K/giờ</p>
                      )}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wide">Địa điểm</label>
                      {isEditing ? (
                        <select className="w-full px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text focus:outline-none focus:border-primary transition-all">
                          <option>Quận 1, Hồ Chí Minh</option>
                          <option>Quận 2, Hồ Chí Minh</option>
                          <option>Quận 3, Hồ Chí Minh</option>
                        </select>
                      ) : (
                        <p className="text-text">Quận 1, Hồ Chí Minh</p>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="flex gap-3 mt-6 pt-5 border-t border-secondary/30">
                  <button className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-medium">
                    Lưu thay đổi
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2.5 bg-background border border-secondary/50 rounded-xl text-text hover:bg-background-light transition-all">
                    Hủy
                  </button>
                </div>
              )}
            </div>

            {/* Gallery for Girl */}
            {isGirl && (
              <div className="bg-background-light rounded-2xl border border-secondary/30 p-6 shadow-sm shadow-black/10">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="font-semibold text-text">Hình ảnh</h3>
                  {isEditing && (
                    <button className="text-sm text-primary hover:underline flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Thêm ảnh
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                    <div key={item} className="group relative aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border border-secondary/30 overflow-hidden hover:border-primary/30 transition-all">
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-primary/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button className="p-2 bg-red-500 rounded-lg hover:bg-red-600 transition-colors">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
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