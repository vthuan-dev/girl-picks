'use client';

import { Girl } from '@/types/girl';
import { useMemo, useState } from 'react';

interface GirlInfoCardProps {
  girl: Girl;
  tags?: string[];
}

export default function GirlInfoCard({ girl, tags }: GirlInfoCardProps) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const info = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const derivedBirthYear =
      girl.birthYear ||
      (girl.age ? currentYear - girl.age : undefined);

    // Hàm chuẩn hóa để loại bỏ đơn vị trùng lặp
    const cleanUnit = (val: string | number | undefined, unit: string) => {
      if (val === undefined || val === null) return 'Chưa cập nhật';
      const str = val.toString().toLowerCase();
      if (str.includes(unit)) return str;
      return `${str}${unit}`;
    };

    return {
      price: girl.price || 'Chưa cập nhật',
      birthYear: derivedBirthYear,
      height: cleanUnit(girl.height ?? undefined, 'cm'),
      weight: cleanUnit(girl.weight ?? undefined, 'kg'),
      measurements: girl.measurements || 'Chưa cập nhật',
      origin: girl.origin || 'Chưa cập nhật',
      address:
        girl.address ||
        girl.location ||
        (girl.district ? `${girl.district.name}${girl.province ? `, ${girl.province}` : ''}` : 'Chưa cập nhật'),
      workingHours: girl.workingHours || 'Chưa cập nhật',
      services: Array.isArray(girl.services) && girl.services.length > 0 ? girl.services : [],
    };
  }, [girl]);

  const displayTags: string[] = Array.isArray(tags) && tags.length > 0
    ? tags
    : Array.isArray(girl.tags)
      ? girl.tags
      : [];

  const copyPhone = () => {
    if (girl.phone) {
      navigator.clipboard.writeText(girl.phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setShowToast(true);
      setTimeout(() => {
        setCopied(false);
        setShowToast(false);
      }, 3000);
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
      color: 'text-green-400'
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
      color: 'text-red-500'
    },
    {
      label: 'Năm sinh',
      value: info.birthYear ? info.birthYear.toString() : 'Chưa cập nhật',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      label: 'Chiều cao',
      value: info.height,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      ),
    },
    {
      label: 'Cân nặng',
      value: info.weight,
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
            className={`flex items-start gap-3 p-3 rounded-xl transition-all ${item.highlight
              ? 'bg-primary/10 border border-primary/20'
              : 'bg-background border border-secondary/20 hover:border-secondary/40'
              }`}
          >
            <div className={`flex-shrink-0 mt-0.5 ${item.highlight ? 'text-primary' : 'text-text-muted'}`}>
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-text-muted mb-1">{item.label}</div>
              <div className={`font-semibold ${item.highlight ? (item.color || 'text-primary') + ' text-lg' : 'text-text'}`}>
                {item.value}
              </div>
            </div>
            {item.copyable && (
              <button
                onClick={copyPhone}
                className="flex-shrink-0 p-2 hover:bg-background-light rounded-lg transition-colors cursor-pointer bg-secondary/10"
                aria-label="Sao chép số điện thoại"
              >
                <span className="text-[10px] font-bold uppercase text-text-muted hover:text-primary">
                  {copied ? 'Đã copy' : 'Copy'}
                </span>
              </button>
            )}
          </div>
        ))}

        {/* Services */}
        {info.services.length > 0 && (
          <div className="mt-4 pt-4 border-t border-secondary/30">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 text-text-muted">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs text-text-muted mb-2 font-bold uppercase tracking-wider">Dịch vụ hỗ trợ</div>
                <div className="flex flex-wrap gap-2">
                  {info.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-secondary/10 text-text-muted rounded border border-secondary/20 text-xs"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tags Section */}
        {displayTags.length > 0 && (
          <div className="mt-4 pt-4 border-t border-secondary/30">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5 text-text-muted">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M6 20l4-4m10-4l-4 4m-4-10l-4-4m10 4l4-4M3 12h18" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="text-xs text-text-muted mb-2 font-bold uppercase tracking-wider">Tags nổi bật</div>
                <div className="flex flex-wrap items-center gap-1 text-xs leading-relaxed">
                  {displayTags.map((tag, index) => (
                    <span key={index}>
                      <span className="text-text-muted hover:text-primary cursor-pointer border border-secondary/20 px-2 py-0.5 rounded bg-secondary/5">
                        #{tag}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Share Link */}
      <div className="mt-4 pt-4 border-t border-secondary/30">
        <button
          onClick={handleCopyLink}
          className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.89 12.938 9 12.482 9 12c0-.482-.11-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {copied && showToast ? 'Đã copy link!' : 'Chia sẻ thông tin'}
        </button>
      </div>
    </div>
  );
}
