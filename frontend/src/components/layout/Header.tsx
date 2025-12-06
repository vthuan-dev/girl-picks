'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { UserRole } from '@/types/auth';
import NotificationBell from '@/components/common/NotificationBell';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
    setIsUserMenuOpen(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  const navItems = [
    { href: '/', label: 'Trang chủ' },
    { href: '/girls', label: 'Gái gọi' },
    { href: '/chat-sex', label: 'Chat sex' },
    { href: '/phim-sex', label: 'Phim sex' },
    { href: '/anh-sex', label: 'Ảnh sex' },
  ];

  const getRoleDashboardPath = () => {
    if (!user) return '/';
    switch (user.role) {
      case UserRole.ADMIN:
        return '/admin/dashboard';
      case UserRole.GIRL:
        return '/profile';
      case UserRole.CUSTOMER:
        return '/search';
      default:
        return '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/98 backdrop-blur-xl border-b border-secondary/20 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo Section */}
          <Link 
            href="/" 
            className="flex items-center gap-3 flex-shrink-0 group cursor-pointer"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-xl overflow-hidden shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/40 transition-all bg-background-light">
                <Image 
                  src="https://gaigu1.net/images/logo/logo.png?v=0.0.1" 
                  alt="Girl Pick Logo" 
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg lg:text-xl font-bold text-text group-hover:text-primary transition-colors">
                Tìm Gái gọi
              </h1>
              <p className="text-xs text-text-muted hidden lg:block">Kết nối nhanh chóng</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={handleSearch} 
            className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8"
          >
            <div className="relative w-full group">
              <div className="absolute inset-0 bg-primary/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center bg-background-light/80 backdrop-blur-sm border border-secondary/30 rounded-xl focus-within:border-primary/50 focus-within:bg-background-light focus-within:shadow-lg focus-within:shadow-primary/10 transition-all">
                <div className="pl-4 pr-2">
                  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm gái gọi, địa điểm..."
                  className="flex-1 px-3 py-3 bg-transparent text-text placeholder:text-text-muted/70 focus:outline-none text-sm lg:text-base"
                />
                <button
                  type="submit"
                  className="mr-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover active:scale-95 transition-all font-medium text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 cursor-pointer"
                >
                  Tìm
                </button>
              </div>
            </div>
          </form>

          {/* Right Section - Auth & Actions */}
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {/* Notifications - Authenticated */}
            {isAuthenticated && (
              <div className="hidden sm:block">
                <NotificationBell />
              </div>
            )}

            {/* User Menu - Authenticated */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-background-light transition-colors cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30 group-hover:border-primary/50 transition-colors">
                    <span className="text-primary font-bold text-sm">
                      {user?.fullName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-text">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-text-muted capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                  <svg 
                    className={`w-4 h-4 text-text-muted transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-background-light rounded-xl border border-secondary/30 shadow-2xl overflow-hidden animate-fadeIn">
                    <div className="p-4 border-b border-secondary/30">
                      <p className="font-semibold text-text">{user?.fullName}</p>
                      <p className="text-sm text-text-muted">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href={getRoleDashboardPath()}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>
                      {user?.role === UserRole.ADMIN && (
                        <Link
                          href="/admin/crawler"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Crawler
                        </Link>
                      )}
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      <div className="border-t border-secondary/30 my-2" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Auth Buttons - Not Authenticated */
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-text hover:text-primary transition-colors hidden sm:block cursor-pointer"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover active:scale-95 transition-all font-medium text-sm shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 cursor-pointer"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-text hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
              aria-label="Toggle menu"
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

        {/* Navigation Bar */}
        <nav className="hidden md:flex items-center gap-1 py-2 border-t border-secondary/20">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-4 py-2.5 text-sm font-medium rounded-lg transition-all cursor-pointer
                  ${isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-text-muted hover:text-text hover:bg-background-light'
                  }
                `}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Search & Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 space-y-4 animate-fadeIn">
            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg focus-within:border-primary transition-all">
                <div className="pl-4 pr-2">
                  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm..."
                  className="flex-1 px-3 py-2.5 bg-transparent text-text placeholder:text-text-muted focus:outline-none"
                />
                <button
                  type="submit"
                  className="mr-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover transition-colors text-sm font-medium"
                >
                  Tìm
                </button>
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      px-4 py-3 rounded-lg text-sm font-medium transition-colors
                      ${isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-text hover:text-primary hover:bg-gray-50'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile Auth Section */}
            {isAuthenticated ? (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                {user?.role === UserRole.ADMIN && (
                  <Link
                    href="/admin/crawler"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-text hover:text-primary hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Crawler
                  </Link>
                )}
                <Link
                  href={getRoleDashboardPath()}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-text hover:text-primary hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium text-text hover:text-primary hover:bg-gray-50 transition-colors text-center"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-hover transition-colors text-center"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
