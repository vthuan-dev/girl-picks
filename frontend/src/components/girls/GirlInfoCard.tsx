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

    return {
      price: girl.price || 'Chưa cập nhật',
      birthYear: derivedBirthYear,
      height: girl.height || 'Chưa cập nhật',
      weight: girl.weight || 'Chưa cập nhật',
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
  // Prefer explicit tags prop; fallback to tags coming from API (girl.tags)
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

  const shareUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/girls/${girl.id}/${girl.slug || ''}`;

  const handleCopyLink = () => {
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

  const infoRows: { label: string; value: string }[] = [
    { label: 'Giá', value: info.price },
    { label: 'Số điện thoại', value: girl.phone || 'Chưa cập nhật' },
    { label: 'Năm sinh', value: info.birthYear ? info.birthYear.toString() : 'Chưa cập nhật' },
    { label: 'Chiều cao', value: `${info.height}cm` },
    { label: 'Cân nặng', value: `${info.weight}kg` },
    { label: 'Số đo 3 vòng', value: info.measurements },
    { label: 'Xuất xứ', value: info.origin },
    {
      label: 'Khu vực',
      value: (() => {
        const districtName = girl.district?.name || (girl as any).location || '';
        const province = (girl as any).province || '';
        if (districtName && province) {
          if ((girl as any).location && (girl as any).location.includes(province)) return (girl as any).location;
          return `${districtName}, ${province}`;
        }
        if (districtName) return districtName;
        if (province) return province;
        if ((girl as any).location) return (girl as any).location;
        return 'Chưa cập nhật';
      })(),
    },
    { label: 'Địa chỉ', value: info.address },
    { label: 'Làm việc', value: info.workingHours },
  ];

  return (
    <div className="bg-background-light rounded-xl p-4 sm:p-5 border border-secondary/30 shadow-lg">
      <h2 className="text-lg font-bold text-text mb-4">Thông tin cơ bản</h2>
      <div className="space-y-1.5 divide-y divide-secondary/20">
        {infoRows.map((row, idx) => (
          <div key={idx} className="flex items-center justify-between py-2 text-sm">
            <span className="text-text-muted">{row.label}</span>
            {row.label === 'Số điện thoại' && girl.phone ? (
              <div className="flex items-center gap-2">
                <a href={`tel:${girl.phone}`} className="font-semibold text-primary">
                  {row.value}
                </a>
                <button
                  onClick={copyPhone}
                  className="text-xs px-2 py-1 bg-background border border-secondary/30 rounded-md text-text-muted hover:text-primary hover:border-primary/50 transition-colors"
                >
                  {copied ? 'Đã copy' : 'Copy'}
                </button>
              </div>
            ) : (
              <span className="font-semibold text-text text-right max-w-[60%] truncate">{row.value}</span>
            )}
          </div>
        ))}
        {info.services.length > 0 && (
          <div className="py-2 text-sm">
            <div className="text-text-muted mb-1">Dịch vụ</div>
            <div className="text-text leading-relaxed">
              {info.services.join(', ')}
            </div>
          </div>
        )}
        {displayTags.length > 0 && (
          <div className="py-2 text-sm">
            <div className="text-text-muted mb-1">Tags</div>
            <div className="text-text leading-relaxed break-words">
              {displayTags.map((tag, i) => (
                <span key={i} className="mr-2 text-primary">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

