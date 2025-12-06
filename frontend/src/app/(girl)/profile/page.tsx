'use client';

import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';
import Image from 'next/image';

export default function GirlProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Profile của tôi</h1>
          <p className="text-text-muted">Quản lý thông tin và hình ảnh của bạn</p>
        </div>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          {isEditing ? 'Hủy' : 'Chỉnh sửa'}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-background-light rounded-lg border border-secondary/30 p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex-shrink-0">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30">
              <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                <span className="text-4xl text-primary font-bold">
                  {user?.fullName?.charAt(0) || 'G'}
                </span>
              </div>
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <button className="p-2 bg-primary rounded-full hover:bg-primary-hover transition-colors">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm font-medium">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Đã xác thực
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Tên</label>
                {isEditing ? (
                  <input
                    type="text"
                    defaultValue={user?.fullName || ''}
                    className="w-full px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:border-primary"
                  />
                ) : (
                  <p className="text-text font-medium">{user?.fullName || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Email</label>
                <p className="text-text">{user?.email || 'N/A'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Số điện thoại</label>
                {isEditing ? (
                  <input
                    type="tel"
                    defaultValue={user?.phone || ''}
                    className="w-full px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:border-primary"
                  />
                ) : (
                  <p className="text-text">{user?.phone || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Giá dịch vụ</label>
                {isEditing ? (
                  <input
                    type="text"
                    placeholder="300K/giờ"
                    className="w-full px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:border-primary"
                  />
                ) : (
                  <p className="text-text font-bold text-primary">300K/giờ</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Địa điểm</label>
                {isEditing ? (
                  <select className="w-full px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:border-primary">
                    <option>Quận 1</option>
                    <option>Quận 2</option>
                    <option>Quận 3</option>
                  </select>
                ) : (
                  <p className="text-text">Quận 1, Hồ Chí Minh</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Trạng thái</label>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-text">Đang hoạt động</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">Mô tả</label>
              {isEditing ? (
                <textarea
                  rows={4}
                  placeholder="Giới thiệu về bản thân..."
                  className="w-full px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:border-primary resize-none"
                />
              ) : (
                <p className="text-text">Chưa có mô tả</p>
              )}
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                  Lưu thay đổi
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-background border border-secondary/50 text-text rounded-lg hover:bg-background-light transition-colors"
                >
                  Hủy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Đánh giá trung bình</p>
              <p className="text-2xl font-bold text-text">4.8</p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Tổng đặt lịch</p>
              <p className="text-2xl font-bold text-text">24</p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-background-light rounded-lg border border-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-muted mb-1">Tổng thu nhập</p>
              <p className="text-2xl font-bold text-text">12.5M</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-background-light rounded-lg border border-secondary/30 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text">Hình ảnh</h2>
          {isEditing && (
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm">
              Thêm ảnh
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={item}
              className="aspect-square bg-background rounded-lg border border-secondary/30 overflow-hidden group relative"
            >
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-2xl">📷</span>
              </div>
              {isEditing && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
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
    </div>
  );
}

