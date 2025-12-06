import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-background-light border-t border-secondary/50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-background-light">
                <Image 
                  src="https://gaigu1.net/images/logo/logo.png?v=0.0.1" 
                  alt="Girl Pick Logo" 
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
              <span className="text-xl font-bold text-text">Girl Pick</span>
            </div>
            <p className="text-text-muted text-sm mb-4 max-w-md">
              Nền tảng đặt lịch dịch vụ giải trí uy tín, an toàn và chuyên nghiệp. 
              Kết nối bạn với những người bạn đồng hành tuyệt vời.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-background rounded-lg flex items-center justify-center hover:bg-primary transition-colors group cursor-pointer">
                <span className="text-text-muted group-hover:text-white">f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-background rounded-lg flex items-center justify-center hover:bg-primary transition-colors group cursor-pointer">
                <span className="text-text-muted group-hover:text-white">t</span>
              </a>
              <a href="#" className="w-10 h-10 bg-background rounded-lg flex items-center justify-center hover:bg-primary transition-colors group cursor-pointer">
                <span className="text-text-muted group-hover:text-white">in</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-text font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-text-muted hover:text-primary transition-colors text-sm">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/girls" className="text-text-muted hover:text-primary transition-colors text-sm">
                  Danh sách Girls
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-text-muted hover:text-primary transition-colors text-sm">
                  Về chúng tôi
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-text-muted hover:text-primary transition-colors text-sm">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-text font-semibold mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-text-muted hover:text-primary transition-colors text-sm">
                  Trung tâm trợ giúp
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-muted hover:text-primary transition-colors text-sm">
                  Điều khoản
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text-muted hover:text-primary transition-colors text-sm">
                  Chính sách bảo mật
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-text-muted hover:text-primary transition-colors text-sm">
                  Câu hỏi thường gặp
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary/50 mt-8 pt-8 text-center">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} Girl Pick Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

