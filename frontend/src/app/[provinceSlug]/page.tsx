import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProvincePageClient from '@/components/pages/ProvincePageClient';
import { provinceToSlug, slugToProvince } from '@/lib/location/provinceSlugs';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaigo1.net';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ provinceSlug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { provinceSlug } = await params;
  const province = slugToProvince(provinceSlug);

  if (!province) {
    return {
      title: 'Danh mục không tồn tại',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const slug = provinceToSlug(province) || provinceSlug;
  const url = `${siteUrl}/${slug}`;
  const title = `Gái gọi ${province} | Danh mục ${province}`;
  const description = `Tổng hợp gái gọi tại ${province}. Xem hồ sơ, đặt lịch, lọc theo dịch vụ, giá, độ tuổi.`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProvincePage({ params }: PageProps) {
  const { provinceSlug } = await params;
  const province = slugToProvince(provinceSlug);

  if (!province) {
    notFound();
  }

  return <ProvincePageClient province={province} slug={provinceToSlug(province) || provinceSlug} />;
}


