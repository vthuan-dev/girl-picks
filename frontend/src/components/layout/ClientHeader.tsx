'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Trang chủ' },
  { href: '/girls', label: 'Tìm Gái gọi' },
  { href: '/messages', label: 'Tin nhắn' },
  { href: '/favorites', label: 'Yêu thích' },
];

export default function ClientHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center bg-background-light relative">
              <Image
                src="/images/logo/logo.png"
                alt="Girl Pick Logo"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
              {/* Fallback text if image fails to load */}
              <div className="absolute inset-0 flex items-center justify-center text-primary font-bold text-lg opacity-0 pointer-events-none">
                GP
              </div>
            </div>
            <span className="hidden sm:block text-lg font-semibold text-text">
              Tìm gái gọi
            </span>
          </Link>

          {/* Centered Search Bar */}
          <div className="flex-1 max-w-md mx-4">
            <Link
              href="/girls"
              className="flex items-center gap-2 w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors group"
            >
              <svg className="w-5 h-5 text-gray-500 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-sm text-gray-500 group-hover:text-primary transition-colors">
                Tìm kiếm gái gọi...
              </span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notifications - Hidden on mobile */}
            <button className="hidden sm:block relative p-2 text-text hover:text-primary transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
            </button>

            {/* Hamburger Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-text hover:text-primary transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 animate-fadeIn">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      px-4 py-2 rounded-md text-sm font-medium transition-colors
                      ${isActive
                        ? 'bg-primary text-white'
                        : 'text-text hover:text-primary hover:bg-gray-50'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

