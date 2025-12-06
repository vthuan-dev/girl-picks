'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4a4a4a12_1px,transparent_1px),linear-gradient(to_bottom,#4a4a4a12_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* 404 Number with Glow Effect */}
        <div className="relative mb-6 sm:mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-[120px] sm:text-[180px] lg:text-[220px] font-black text-primary/10 blur-2xl select-none">
              404
            </div>
          </div>
          <h1 className="relative text-8xl sm:text-9xl lg:text-[140px] font-black text-text mb-4 tracking-tight">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-3 sm:mb-4">
            Trang không tìm thấy
          </h2>
          <p className="text-base sm:text-lg text-text-muted max-w-md mx-auto leading-relaxed">
            Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          </p>
        </div>

        {/* Illustration/Icon */}
        <div className="mb-8 sm:mb-10 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-background-light border-2 border-primary/30 flex items-center justify-center">
              <svg 
                className="w-16 h-16 sm:w-20 sm:h-20 text-primary" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 sm:mb-10">
          <Link
            href="/"
            className="group relative px-6 sm:px-8 py-3 sm:py-3.5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 font-semibold flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 cursor-pointer min-w-[160px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Về trang chủ</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="group px-6 sm:px-8 py-3 sm:py-3.5 bg-background-light border-2 border-secondary/50 text-text rounded-lg hover:bg-primary/10 hover:border-primary transition-all duration-300 font-semibold flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 cursor-pointer min-w-[160px]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Quay lại</span>
          </button>
        </div>

        {/* Quick Links */}
        <div className="border-t border-secondary/30 pt-6 sm:pt-8">
          <p className="text-sm text-text-muted mb-4">Hoặc truy cập các trang phổ biến:</p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href="/girls"
              className="text-sm text-text-muted hover:text-primary transition-colors font-medium hover:underline underline-offset-2 cursor-pointer"
            >
              Gái gọi
            </Link>
            <span className="text-text-muted/30">•</span>
            <Link
              href="/phim-sex"
              className="text-sm text-text-muted hover:text-primary transition-colors font-medium hover:underline underline-offset-2 cursor-pointer"
            >
              Phim sex
            </Link>
            <span className="text-text-muted/30">•</span>
            <Link
              href="/anh-sex"
              className="text-sm text-text-muted hover:text-primary transition-colors font-medium hover:underline underline-offset-2 cursor-pointer"
            >
              Ảnh sex
            </Link>
            <span className="text-text-muted/30">•</span>
            <Link
              href="/auth/login"
              className="text-sm text-text-muted hover:text-primary transition-colors font-medium hover:underline underline-offset-2 cursor-pointer"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

