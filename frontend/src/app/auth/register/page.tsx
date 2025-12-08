import RegisterForm from '@/modules/auth/components/RegisterForm';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <Header />
      
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 py-8 sm:py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#4a4a4a12_1px,transparent_1px),linear-gradient(to_bottom,#4a4a4a12_1px,transparent_1px)] bg-[size:24px_24px] opacity-30 pointer-events-none" />

      <div className="relative w-full max-w-2xl z-10">
        {/* Logo & Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="relative group">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* Logo Container */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-2xl shadow-primary/30 ring-2 ring-primary/20 bg-background-light flex items-center justify-center group-hover:ring-primary/40 transition-all">
                <Image
                  src="https://gaigu1.net/images/logo/logo.png?v=0.0.1"
                  alt="Girl Pick Logo"
                  width={96}
                  height={96}
                  className="w-full h-full object-contain p-2"
                  unoptimized
                />
              </div>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-text mb-2 tracking-tight">
            Tạo tài khoản mới
          </h1>
          <p className="text-sm sm:text-base text-text-muted">
            Điền thông tin để bắt đầu hành trình của bạn
          </p>
        </div>

        {/* Form Card */}
        <div className="relative">
          {/* Card Glow Border */}
          <div className="absolute -inset-[1px] bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-2xl blur opacity-50" />
          
          {/* Main Card */}
          <div className="relative bg-background-light/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-black/30 border border-secondary/30">
            <RegisterForm />
            
            {/* Divider */}
            <div className="relative my-6 sm:my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-secondary/30" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-background-light/95 text-xs text-text-muted font-medium">Hoặc</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <span className="text-sm text-text-muted">Đã có tài khoản? </span>
              <Link 
                href="/auth/login" 
                className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1.5 group cursor-pointer"
              >
                Đăng nhập
                <svg 
                  className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs text-text-muted">
            Bằng cách đăng ký, bạn đồng ý với{' '}
            <Link href="/terms" className="text-primary hover:text-primary-hover transition-colors underline underline-offset-2 cursor-pointer">
              Điều khoản dịch vụ
            </Link>
            {' '}và{' '}
            <Link href="/privacy" className="text-primary hover:text-primary-hover transition-colors underline underline-offset-2 cursor-pointer">
              Chính sách bảo mật
            </Link>
          </p>
        </div>
      </div>
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
