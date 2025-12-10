'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background-light border-t border-secondary/30 mt-auto">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-10">
        {/* Top Section: 3 Columns Links */}
        <div className="grid grid-cols-3 gap-2 sm:gap-10 lg:gap-12 mb-6 sm:mb-10">
          {/* Liên kết nhanh */}
          <div>
            <h3 className="text-text font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Liên kết nhanh</h3>
            <ul className="space-y-1.5 sm:space-y-2.5">
              <li>
                <Link href="/" className="text-text-muted hover:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-text-muted rounded-full group-hover:bg-primary transition-colors flex-shrink-0"></span>
                  <span>Trang chủ</span>
                </Link>
              </li>
              <li>
                <Link href="/girls" className="text-text-muted hover:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-text-muted rounded-full group-hover:bg-primary transition-colors flex-shrink-0"></span>
                  <span>Gái gọi</span>
                </Link>
              </li>
              <li>
                <Link href="/chat-sex" className="text-text-muted hover:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-text-muted rounded-full group-hover:bg-primary transition-colors flex-shrink-0"></span>
                  <span>Chat sex</span>
                </Link>
              </li>
              <li>
                <Link href="/phim-sex" className="text-text-muted hover:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-text-muted rounded-full group-hover:bg-primary transition-colors flex-shrink-0"></span>
                  <span>Phim sex</span>
                </Link>
              </li>
              <li>
                <Link href="/anh-sex" className="text-text-muted hover:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-text-muted rounded-full group-hover:bg-primary transition-colors flex-shrink-0"></span>
                  <span>Ảnh sex</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Thông tin */}
          <div>
            <h3 className="text-text font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Thông tin</h3>
            <ul className="space-y-1.5 sm:space-y-2.5">
              <li>
                <Link href="/quy-dinh" className="text-text-muted hover:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-text-muted rounded-full group-hover:bg-primary transition-colors flex-shrink-0"></span>
                  <span>Quy định</span>
                </Link>
              </li>
              <li>
                <Link href="/xac-thuc" className="text-text-muted hover:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-text-muted rounded-full group-hover:bg-primary transition-colors flex-shrink-0"></span>
                  <span>Xác thực</span>
                </Link>
              </li>
              <li>
                <Link href="/thong-bao" className="text-text-muted hover:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-text-muted rounded-full group-hover:bg-primary transition-colors flex-shrink-0"></span>
                  <span>Thông báo</span>
                </Link>
              </li>
              <li>
                <Link href="/tim-mat" className="text-text-muted hover:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-text-muted rounded-full group-hover:bg-primary transition-colors flex-shrink-0"></span>
                  <span>Tìm mặt</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h3 className="text-text font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Hỗ trợ</h3>
            <ul className="space-y-1.5 sm:space-y-2.5">
              <li>
                <Link href="/help" className="text-text-muted hover:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-text-muted rounded-full group-hover:bg-primary transition-colors flex-shrink-0"></span>
                  <span>Trung tâm trợ giúp</span>
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-muted hover:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-text-muted rounded-full group-hover:bg-primary transition-colors flex-shrink-0"></span>
                  <span>Điều khoản</span>
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text-muted hover:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer">
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-text-muted rounded-full group-hover:bg-primary transition-colors flex-shrink-0"></span>
                  <span>Chính sách bảo mật</span>
                </Link>
              </li>
              <li>
                <a
                  href="https://gaigo1.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-muted hover:text-primary transition-colors text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 group cursor-pointer"
                >
                  <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-text-muted rounded-full group-hover:bg-primary transition-colors flex-shrink-0"></span>
                  <span>Mạng xã hội</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle Section: Brand Info */}
        <div className="border-t border-secondary/30 pt-4 sm:pt-8 mb-4 sm:mb-6">
          {/* Logo & Title */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-0 group cursor-pointer">
            <div className="relative w-8 h-8 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-background-light shadow-lg group-hover:shadow-primary/30 transition-all flex-shrink-0">
              <Image
                src="https://gaigu1.net/images/logo/logo.png?v=0.0.1"
                alt="Tìm Gái gọi Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
                unoptimized
              />
            </div>
            <div>
              <h3 className="text-base sm:text-xl font-bold text-text group-hover:text-primary transition-colors">
                Tìm Gái gọi
              </h3>
              <p className="text-xs text-text-muted">Kết nối nhanh chóng</p>
            </div>
          </Link>

          {/* Description - Hidden on mobile, shown on desktop */}
          <div className="hidden sm:block flex-1 mt-4">
            <p className="text-text-muted text-sm leading-relaxed max-w-2xl">
              Web Gái Gú mang cả thế giới giải trí người lớn đến tầm tay của bạn. Hàng ngàn số điện thoại gái gọi có video trên khắp cả nước.
            </p>
          </div>

          {/* Social Icons & Telegram */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="https://gaigo1.net"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 sm:w-10 sm:h-10 bg-background rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all group cursor-pointer border border-secondary/30"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6 sm:w-5 sm:h-5 text-text-muted group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-12 h-12 sm:w-10 sm:h-10 bg-background rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all group cursor-pointer border border-secondary/30"
                aria-label="Twitter"
              >
                <svg className="w-6 h-6 sm:w-5 sm:h-5 text-text-muted group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-12 h-12 sm:w-10 sm:h-10 bg-background rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all group cursor-pointer border border-secondary/30"
                aria-label="Zalo"
              >
                <svg className="w-6 h-6 sm:w-5 sm:h-5 text-text-muted group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </a>
            </div>
            <p className="text-text-muted text-xs sm:text-sm">
              Tham gia nhóm telegram{' '}
              <a
                href="https://t.me/+bHXeNwEYWhI2MWRl"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-hover transition-colors underline cursor-pointer break-all"
              >
                https://t.me/+bHXeNwEYWhI2MWRl
              </a>
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-secondary/30 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-text-muted text-xs sm:text-sm text-center sm:text-left">
              © {currentYear}{' '}
              <span className="text-primary font-semibold">Tìm Gái gọi</span>. All rights reserved.
            </p>
            <p className="text-text-muted text-xs sm:text-sm text-center sm:text-right">
              <span className="hidden sm:inline">Hãy chắc chắn rằng bạn đủ 18 tuổi để tham gia.</span>
              <span className="sm:hidden">18+</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

