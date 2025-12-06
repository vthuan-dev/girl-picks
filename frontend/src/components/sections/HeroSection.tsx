'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

export default function HeroSection() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="relative bg-gradient-to-br from-background via-background-light to-background overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full mb-6">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-primary text-sm font-medium">Nền tảng uy tín hàng đầu</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-text mb-6 leading-tight">
            Tìm người bạn đồng hành
            <br />
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              tuyệt vời nhất
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
            Kết nối với những người bạn đồng hành chuyên nghiệp, 
            đáng tin cậy và thú vị cho mọi dịp đặc biệt của bạn
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth/register"
                  className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all transform hover:scale-105 font-semibold text-lg shadow-xl shadow-primary/30 cursor-pointer"
                >
                  Bắt đầu ngay
                </Link>
                <Link
                  href="/girls"
                  className="px-8 py-4 bg-background-light border-2 border-primary text-primary rounded-lg hover:bg-primary/10 transition-all font-semibold text-lg cursor-pointer"
                >
                  Khám phá Girls
                </Link>
              </>
            ) : (
              <Link
                href="/girls"
                className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary-hover transition-all transform hover:scale-105 font-semibold text-lg shadow-xl shadow-primary/30 cursor-pointer"
              >
                Khám phá Girls
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">1000+</div>
              <div className="text-text-muted text-sm">Girls đã tham gia</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">5000+</div>
              <div className="text-text-muted text-sm">Đặt lịch thành công</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4.8★</div>
              <div className="text-text-muted text-sm">Đánh giá trung bình</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
    </section>
  );
}

