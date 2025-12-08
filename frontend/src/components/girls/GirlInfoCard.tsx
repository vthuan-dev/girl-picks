'use client';

import { Girl } from '@/types/girl';
import { useState } from 'react';

interface GirlInfoCardProps {
  girl: Girl;
}

// Mock data for additional fields (in real app, these should come from API)
const getAdditionalInfo = (girl: Girl) => {
  // In production, these should be part of the Girl type/API
  return {
    price: '350K', // Should come from API
    birthYear: 1995, // Should come from API
    height: 165, // cm - Should come from API
    weight: 56, // kg - Should come from API
    measurements: '90-69-91', // Should come from API
    origin: 'Miền Bắc', // Should come from API
    address: girl.district ? `${girl.district.name}, Việt Nam` : 'Chưa cập nhật',
    workingHours: '24/7 - Gọi còn nghe vẫn còn làm',
    services: ['Qua đêm', 'Hôn môi', 'Vét máng', 'BJ'], // Should come from API
  };
};

export default function GirlInfoCard({ girl }: GirlInfoCardProps) {
  const [copied, setCopied] = useState(false);
  const info = getAdditionalInfo(girl);

  const copyPhone = () => {
    if (girl.phone) {
      navigator.clipboard.writeText(girl.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/girls/${girl.id}/${girl.slug || ''}`;

  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const infoItems = [
    {
      label: 'Giá',
      value: info.price,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      highlight: true,
    },
    {
      label: 'Số điện thoại',
      value: girl.phone || 'Chưa cập nhật',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      copyable: !!girl.phone,
      highlight: true,
    },
    {
      label: 'Năm sinh',
      value: info.birthYear.toString(),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Chiều cao',
      value: `${info.height}cm`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
    },
    {
      label: 'Cân nặng',
      value: `${info.weight}kg`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
    {
      label: 'Số đo 3 vòng',
      value: info.measurements,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      label: 'Xuất xứ',
      value: info.origin,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Khu vực',
      value: (() => {
        // Hiển thị quận + tỉnh
        const districtName = girl.district?.name || (girl as any).location || '';
        const province = (girl as any).province || '';
        
        if (districtName && province) {
          // Nếu location đã chứa cả quận và tỉnh, dùng luôn
          if ((girl as any).location && (girl as any).location.includes(province)) {
            return (girl as any).location;
          }
          // Nếu không, kết hợp quận + tỉnh
          return `${districtName}, ${province}`;
        } else if (districtName) {
          return districtName;
        } else if (province) {
          return province;
        } else if ((girl as any).location) {
          return (girl as any).location;
        }
        return 'Chưa cập nhật';
      })(),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Địa chỉ',
      value: info.address,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Làm việc',
      value: info.workingHours,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-background-light rounded-2xl p-4 sm:p-6 border border-secondary/30 shadow-lg">
      <h2 className="text-xl font-bold text-text mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-primary rounded-full"></div>
        Thông tin cơ bản
      </h2>

      <div className="space-y-3">
        {infoItems.map((item, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
              item.highlight
                ? 'bg-primary/10 border border-primary/20'
                : 'bg-background border border-secondary/20 hover:border-secondary/40'
            }`}
          >
            <div className={`flex-shrink-0 mt-0.5 ${item.highlight ? 'text-primary' : 'text-text-muted'}`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-text-muted mb-1">{item.label}</div>
              <div className={`font-semibold ${item.highlight ? 'text-primary text-lg' : 'text-text'}`}>
                {item.value}
              </div>
            </div>
            {item.copyable && (
              <button
                onClick={copyPhone}
                className="flex-shrink-0 p-2 hover:bg-background-light rounded-lg transition-colors cursor-pointer"
                aria-label="Sao chép số điện thoại"
              >
                {copied ? (
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        ))}

        {/* Services */}
        <div className="mt-4 pt-4 border-t border-secondary/30">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 text-text-muted">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-xs text-text-muted mb-2">Dịch vụ</div>
              <div className="flex flex-wrap gap-2">
                {info.services.map((service, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-accent/20 text-accent rounded-lg text-sm font-medium border border-accent/30"
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Share Button */}
      <div className="mt-6 pt-6 border-t border-secondary/30">
        <button
          onClick={handleCopyLink}
          className="w-full px-4 py-3 bg-gradient-to-r from-primary to-primary-hover text-white rounded-xl hover:shadow-xl hover:shadow-primary/30 transition-all font-semibold cursor-pointer flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342c-.396 0-.72-.316-.72-.705 0-.39.324-.705.72-.705h2.748v-2.124c0-.39.324-.705.72-.705.397 0 .72.316.72.705v2.124h2.748c.396 0 .72.316.72.705 0 .39-.324.705-.72.705H13.172v2.124c0 .39-.323.705-.72.705-.396 0-.72-.316-.72-.705v-2.124H8.684z" />
          </svg>
          {copied ? 'Đã copy link' : 'Chia sẻ (copy link)'}
        </button>
      </div>
    </div>
  );
}

