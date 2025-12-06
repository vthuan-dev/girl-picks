'use client';

import Link from 'next/link';

interface Girl {
  id: string;
  name: string;
  age: number;
  price: string;
  location: string;
  rating: number;
  totalReviews: number;
  avatar: string | null;
  verified: boolean;
  isAvailable: boolean;
}

interface GirlCardProps {
  girl: Girl;
}

export default function GirlCard({ girl }: GirlCardProps) {
  return (
    <Link href={`/girls/${girl.id}`}>
      <div className="bg-background-light rounded-lg border border-secondary/30 overflow-hidden hover:border-primary/50 transition-all group">
        {/* Image */}
        <div className="relative aspect-[3/4] bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">👤</span>
          </div>
          {girl.isAvailable && (
            <div className="absolute top-2 right-2 px-2 py-1 bg-green-500 text-white rounded text-xs font-medium">
              Online
            </div>
          )}
          {girl.verified && (
            <div className="absolute top-2 left-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-text mb-1">{girl.name}</h3>
              <p className="text-sm text-text-muted">{girl.age} tuổi • {girl.location}</p>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-medium text-text">{girl.rating}</span>
              <span className="text-xs text-text-muted">({girl.totalReviews})</span>
            </div>
            <span className="text-primary font-bold">{girl.price}</span>
          </div>

          <button className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium">
            Xem chi tiết
          </button>
        </div>
      </div>
    </Link>
  );
}

