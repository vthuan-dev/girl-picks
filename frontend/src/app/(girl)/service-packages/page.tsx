'use client';

import { useState } from 'react';
import ServicePackageCard from '@/components/service-packages/ServicePackageCard';
import Modal from '@/components/common/Modal';

export default function ServicePackagesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const packages = [
    {
      id: '1',
      name: 'Đi chơi',
      description: 'Đi chơi, trò chuyện',
      duration: 2,
      price: 600000,
      isActive: true,
    },
    {
      id: '2',
      name: 'Đi ăn tối',
      description: 'Đi ăn tối, trò chuyện',
      duration: 3,
      price: 900000,
      isActive: true,
    },
    {
      id: '3',
      name: 'Qua đêm',
      description: 'Dịch vụ qua đêm',
      duration: 12,
      price: 3000000,
      isActive: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-text mb-2">Gói dịch vụ</h1>
          <p className="text-text-muted">Quản lý các gói dịch vụ của bạn</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm gói dịch vụ
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {packages.map((pkg) => (
          <ServicePackageCard key={pkg.id} package={pkg} />
        ))}
      </div>

      {/* Add Package Modal */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <div className="bg-background-light rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-text mb-4">Thêm gói dịch vụ mới</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Tên gói</label>
                <input
                  type="text"
                  placeholder="Đi chơi"
                  className="w-full px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">Mô tả</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả dịch vụ..."
                  className="w-full px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:border-primary resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Thời gian (giờ)</label>
                  <input
                    type="number"
                    placeholder="2"
                    className="w-full px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-muted mb-2">Giá (VNĐ)</label>
                  <input
                    type="number"
                    placeholder="600000"
                    className="w-full px-4 py-2 bg-background border border-secondary/50 rounded-lg text-text focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                >
                  Tạo gói
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-background border border-secondary/50 text-text rounded-lg hover:bg-background-light transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

