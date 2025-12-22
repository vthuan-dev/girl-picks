'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import {
  communityPostsApi,
  CommunityPostInteraction,
  CommunityPostInteractionType,
} from '@/modules/community-posts/api/community-posts.api';

export default function InteractionsPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState<CommunityPostInteractionType>('likes');
  const [items, setItems] = useState<CommunityPostInteraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const data = await communityPostsApi.getMyInteractions(tab);
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setItems([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [tab]);

  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-3xl mx-auto px-3 py-8 text-center text-text-muted">
        Vui lòng đăng nhập để xem lịch sử tương tác.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-3 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text mb-1">Tương tác của bạn</h1>
        <p className="text-sm text-text-muted">
          Xem lại những bài viết cộng đồng và gái gọi mà bạn đã thích hoặc bình luận.
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-xl bg-background border border-secondary/30 p-1">
        <button
          onClick={() => setTab('likes')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'likes'
              ? 'bg-primary text-white shadow-md shadow-primary/30'
              : 'text-text-muted hover:text-text'
          }`}
        >
          Đã thích
        </button>
        <button
          onClick={() => setTab('comments')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            tab === 'comments'
              ? 'bg-primary text-white shadow-md shadow-primary/30'
              : 'text-text-muted hover:text-text'
          }`}
        >
          Đã bình luận
        </button>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="bg-background-light rounded-xl border border-secondary/30 p-6 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-14 h-14 bg-secondary/30 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-secondary/30 rounded w-1/2" />
                <div className="h-3 bg-secondary/30 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-background-light rounded-xl border border-secondary/30 p-8 text-center">
          <p className="text-text font-medium mb-1">
            {tab === 'likes' ? 'Bạn chưa thích bài nào' : 'Bạn chưa bình luận ở bài nào'}
          </p>
          <p className="text-sm text-text-muted">
            Hãy khám phá các bài viết cộng đồng và tương tác nhiều hơn nhé.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href="/"
              className="flex items-center gap-3 bg-background-light rounded-xl border border-secondary/30 p-3 hover:border-primary/40 hover:bg-background transition-all"
            >
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-secondary/20 flex-shrink-0">
                {item.previewImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.previewImage} alt={item.postTitle} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">
                    No image
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text truncate">{item.postTitle}</p>
                {item.girlName && (
                  <p className="text-xs text-text-muted truncate">Gái: {item.girlName}</p>
                )}
                <p className="text-xs text-text-muted mt-1">
                  {item.type === 'likes' ? 'Đã thích' : 'Đã bình luận'} •{' '}
                  {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


