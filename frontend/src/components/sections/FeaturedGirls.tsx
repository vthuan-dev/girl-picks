'use client';

import { useState, useEffect } from 'react';
import { girlsApi } from '@/modules/girls/api/girls.api';
import { Girl } from '@/types/girl';
import GirlCard from '@/modules/girls/components/GirlCard';
import Link from 'next/link';

export default function FeaturedGirls() {
  const [girls, setGirls] = useState<Girl[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedGirls();
  }, []);

  const fetchFeaturedGirls = async () => {
    try {
      const response = await girlsApi.getFeaturedGirls(6);
      if (response.success) {
        setGirls(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch featured girls:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (girls.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-text mb-2">Girls nổi bật</h2>
            <p className="text-text-muted">Những profile được yêu thích nhất</p>
          </div>
          <Link
            href="/girls"
            className="hidden md:block px-6 py-3 text-primary hover:text-primary-light transition-colors font-semibold"
          >
            Xem tất cả →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {girls.map((girl) => (
            <GirlCard key={girl.id} girl={girl} />
          ))}
        </div>

        <div className="text-center mt-8 md:hidden">
          <Link
            href="/girls"
            className="inline-block px-6 py-3 text-primary hover:text-primary-light transition-colors font-semibold"
          >
            Xem tất cả →
          </Link>
        </div>
      </div>
    </section>
  );
}

