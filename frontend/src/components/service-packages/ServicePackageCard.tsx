'use client';

import { useState } from 'react';

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  isActive: boolean;
}

interface ServicePackageCardProps {
  package: ServicePackage;
}

export default function ServicePackageCard({ package: pkg }: ServicePackageCardProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="bg-background-light rounded-lg border border-secondary/30 p-6 hover:border-primary/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-text mb-1">{pkg.name}</h3>
          <p className="text-sm text-text-muted">{pkg.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${
              pkg.isActive
                ? 'bg-green-500/20 text-green-500'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            {pkg.isActive ? 'Hoạt động' : 'Tạm dừng'}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Thời gian:</span>
          <span className="text-text font-medium">{pkg.duration} giờ</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-muted">Giá:</span>
          <span className="text-primary font-bold text-lg">
            {pkg.price.toLocaleString('vi-VN')}đ
          </span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-secondary/30">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex-1 px-3 py-2 bg-background border border-secondary/50 text-text rounded-lg hover:bg-primary/10 hover:border-primary/50 transition-colors text-sm"
        >
          {isEditing ? 'Hủy' : 'Chỉnh sửa'}
        </button>
        <button className="px-3 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors text-sm">
          Xóa
        </button>
      </div>
    </div>
  );
}

