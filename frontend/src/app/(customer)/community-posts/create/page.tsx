'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import CreateCommunityPostForm from '@/components/community-posts/CreateCommunityPostForm';
import Link from 'next/link';

export default function CreateCommunityPostPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const handleSuccess = () => {
    router.push('/community-posts');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/"
            className="p-2 hover:bg-background-light rounded-lg transition-colors cursor-pointer"
            aria-label="Quay lại"
          >
            <svg className="w-6 h-6 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text">Chia sẻ với cộng đồng</h1>
            <p className="text-sm text-text-muted mt-1">Đăng bài viết để chia sẻ với mọi người</p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      <div className="bg-background rounded-2xl border border-secondary/20 shadow-lg shadow-primary/5">
        <CreateCommunityPostForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-text-muted">
            <p className="font-medium text-text mb-1">Lưu ý:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Bài viết của bạn sẽ được gửi để admin duyệt trước khi hiển thị công khai</li>
              <li>Vui lòng đảm bảo nội dung phù hợp với quy định của cộng đồng</li>
              <li>Bạn có thể chỉnh sửa hoặc xóa bài viết khi đang chờ duyệt</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

