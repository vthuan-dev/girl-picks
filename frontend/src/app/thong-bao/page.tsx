import type { Metadata } from 'next';
import ThongBaoPageClient from '@/components/pages/ThongBaoPageClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Thông báo',
  description: 'Quản lý thông báo và cập nhật',
};

export default function ThongBaoPage() {
  return <ThongBaoPageClient />;
}

