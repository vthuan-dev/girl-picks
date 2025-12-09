'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/auth.store';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { UserRole } from '@/types/auth';
import NotificationBell from '@/components/common/NotificationBell';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hasUsedKeyboard, setHasUsedKeyboard] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const skipLinkRef = useRef<HTMLAnchorElement>(null);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false); // Close mobile menu after search
    }
  }, [searchQuery, router]);

  const handleLogout = useCallback(() => {
    logout();
    router.push('/auth/login');
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  }, [logout, router]);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      // Close mobile menu when clicking outside
      if (isMenuOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isUserMenuOpen || isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen, isMenuOpen]);

  // Handle scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent auto-focus on skip link when page loads
  useEffect(() => {
    if (skipLinkRef.current && document.activeElement === skipLinkRef.current) {
      skipLinkRef.current.blur();
    }
  }, []);

  // Track keyboard usage to show skip link only when needed
  useEffect(() => {
    let keyboardUsed = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Detect Tab key (keyboard navigation)
      if (e.key === 'Tab' && !keyboardUsed) {
        keyboardUsed = true;
        setHasUsedKeyboard(true);
      }
    };

    // Detect mouse usage - reset keyboard flag
    const handleMouseDown = () => {
      keyboardUsed = false;
      setHasUsedKeyboard(false);
      if (skipLinkRef.current) {
        skipLinkRef.current.classList.add('sr-only');
        skipLinkRef.current.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handleMouseDown, true);
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('mousedown', handleMouseDown, true);
    };
  }, []);

  const navItems = useMemo(() => [
    { href: '/', label: 'Trang chủ' },
    { href: '/girls', label: 'Gái gọi' },
    { href: '/chat-sex', label: 'Chat sex' },
    { href: '/phim-sex', label: 'Phim sex' },
    { href: '/anh-sex', label: 'Ảnh sex' },
  ], []);

  const getRoleDashboardPath = useCallback(() => {
    if (!user) return '/';
    switch (user.role) {
      case UserRole.ADMIN:
        return '/admin/dashboard';
      case UserRole.GIRL:
        return '/girl/dashboard';
      case UserRole.CUSTOMER:
        return '/girls';
      default:
        return '/';
    }
  }, [user]);

  return (
    <>
      {/* Skip to main content link for accessibility - only visible when focused via keyboard */}
      <a
        ref={skipLinkRef}
        href="#main-content"
        className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background`}
        onFocus={(e) => {
          // Only show if user has used keyboard navigation (Tab key)
          if (hasUsedKeyboard && e.currentTarget) {
            e.currentTarget.classList.remove('sr-only');
          } else {
            // If focused without keyboard, blur it immediately
            e.currentTarget.blur();
            e.currentTarget.classList.add('sr-only');
          }
        }}
        onBlur={(e) => {
          // Hide when blur
          if (e.currentTarget) {
            e.currentTarget.classList.add('sr-only');
          }
        }}
      >
        Bỏ qua đến nội dung chính
      </a>
      
      <header 
        ref={headerRef}
        className={`sticky top-0 z-50 bg-background/98 backdrop-blur-xl border-b transition-all duration-300 ${
          isScrolled 
            ? 'border-secondary/30 shadow-xl shadow-black/30' 
            : 'border-secondary/20 shadow-lg shadow-black/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-14 sm:h-16 lg:h-18 gap-2 sm:gap-4">
          {/* Logo Section */}
          <Link 
            href="/" 
            className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-shrink-0 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg p-1 -m-1 transition-all min-w-0"
            aria-label="Trang chủ - Tìm Gái gọi"
          >
            <div className="relative flex-shrink-0">
              <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg group-hover:blur-xl transition-all opacity-0 group-hover:opacity-100" />
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 rounded-xl overflow-hidden shadow-lg shadow-primary/30 group-hover:shadow-xl group-hover:shadow-primary/40 transition-all bg-background-light">
                <Image 
                  src="https://gaigu1.net/images/logo/logo.png?v=0.0.1" 
                  alt="Girl Pick Logo" 
                  width={56}
                  height={56}
                  className="w-full h-full object-contain"
                  priority
                  unoptimized
                />
              </div>
            </div>
            <div className="block min-w-0">
              <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-text group-hover:text-primary transition-colors truncate leading-tight">
                Tìm gái gọi
              </h1>
              <p className="text-xs text-text-muted hidden md:block">Kết nối nhanh chóng</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <form 
            onSubmit={handleSearch} 
            className="hidden md:flex flex-1 max-w-2xl mx-3 sm:mx-4 lg:mx-6 xl:mx-8"
            role="search"
            aria-label="Tìm kiếm"
          >
            <div className="relative w-full group">
              {/* Glow effect on hover */}
              <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-300" />
              
              {/* Main search container */}
              <div className="relative flex items-center bg-background-light/90 backdrop-blur-md border border-secondary/40 rounded-2xl shadow-lg shadow-black/10 focus-within:border-primary/60 focus-within:bg-background-light focus-within:shadow-xl focus-within:shadow-primary/20 transition-all duration-300 group-hover:border-secondary/50">
                <label htmlFor="desktop-search" className="sr-only">Tìm kiếm</label>
                
                {/* Search icon on left */}
                <div className="pl-4 pr-2 flex-shrink-0">
                  <svg 
                    className="w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors duration-200" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24" 
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
                
                {/* Search input */}
                <input
                  id="desktop-search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm gái gọi, địa điểm..."
                  className="flex-1 px-2 sm:px-3 py-3 sm:py-3.5 bg-transparent text-text placeholder:text-text-muted/60 focus:outline-none text-sm sm:text-base transition-colors"
                  aria-label="Tìm kiếm gái gọi, địa điểm"
                />
                
                {/* Search button with icon */}
                <button
                  type="submit"
                  className={`mr-2 p-2.5 sm:p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background group/btn ${
                    searchQuery.trim()
                      ? 'bg-gradient-to-r from-primary via-primary to-primary-hover text-white hover:shadow-xl hover:shadow-primary/40 active:scale-95 cursor-pointer'
                      : 'bg-secondary/20 text-text-muted/50 cursor-not-allowed opacity-60'
                  }`}
                  aria-label="Tìm kiếm"
                  disabled={!searchQuery.trim()}
                >
                  <svg 
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ${
                      searchQuery.trim() ? 'group-hover/btn:scale-110' : ''
                    }`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2.5} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </button>
              </div>
            </div>
          </form>

          {/* Right Section - Auth & Actions */}
          <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 flex-shrink-0">
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
                  className="flex items-center gap-1 sm:gap-1.5 md:gap-2 px-1.5 sm:px-2 md:px-3 py-1.5 sm:py-2 rounded-xl hover:bg-background-light transition-colors cursor-pointer group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                  aria-label="Menu người dùng"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30 group-hover:border-primary/50 transition-colors flex-shrink-0">
                    <span className="text-primary font-bold text-xs sm:text-sm">
                      {user?.fullName?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left min-w-0">
                    <p className="text-sm font-medium text-text truncate max-w-[120px]">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-text-muted capitalize">{user?.role?.toLowerCase()}</p>
                  </div>
                  <svg 
                    className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-text-muted transition-transform duration-200 flex-shrink-0 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 bg-background-light rounded-xl border border-secondary/30 shadow-2xl overflow-hidden animate-fadeIn z-50"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="p-4 border-b border-secondary/30">
                      <p className="font-semibold text-text">{user?.fullName}</p>
                      <p className="text-sm text-text-muted">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        href={getRoleDashboardPath()}
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer focus:outline-none focus:bg-primary/10 focus:text-primary"
                        role="menuitem"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-text hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer focus:outline-none focus:bg-primary/10 focus:text-primary"
                        role="menuitem"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile
                      </Link>
                      <div className="border-t border-secondary/30 my-2" role="separator" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer focus:outline-none focus:bg-red-500/10"
                        role="menuitem"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
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
              <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                <Link
                  href="/auth/login"
                  className="px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-text hover:text-primary transition-colors hidden sm:block cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-lg whitespace-nowrap"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3 sm:px-3.5 md:px-4 py-1.5 sm:py-2 md:py-2.5 bg-gradient-to-r from-primary to-primary-hover text-white rounded-lg hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all font-medium text-xs sm:text-sm shadow-md shadow-primary/20 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background whitespace-nowrap"
                >
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 sm:p-2.5 text-text hover:text-primary hover:bg-background-light rounded-lg transition-all duration-200 active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background flex-shrink-0"
              aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={isMenuOpen}
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <nav className="hidden md:flex items-center gap-0.5 sm:gap-1 py-2 border-t border-secondary/20" aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  relative px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-lg transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background
                  ${isActive
                    ? 'text-primary bg-primary/10'
                    : 'text-text-muted hover:text-text hover:bg-background-light'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Mobile Search & Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-secondary/20 space-y-4 animate-fadeIn">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} role="search" aria-label="Tìm kiếm mobile">
              <div className="relative group">
                {/* Glow effect on focus */}
                <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
                
                {/* Main search container */}
                <div className="relative flex items-center bg-background-light/90 backdrop-blur-md border border-secondary/40 rounded-2xl shadow-lg shadow-black/10 focus-within:border-primary/60 focus-within:bg-background-light focus-within:shadow-xl focus-within:shadow-primary/20 transition-all duration-300">
                  <label htmlFor="mobile-search" className="sr-only">Tìm kiếm</label>
                  
                  {/* Search icon on left */}
                  <div className="pl-4 pr-2 flex-shrink-0">
                    <svg 
                      className="w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors duration-200" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                      />
                    </svg>
                  </div>
                  
                  {/* Search input */}
                  <input
                    id="mobile-search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm gái gọi, địa điểm..."
                    className="flex-1 px-3 py-3 bg-transparent text-text placeholder:text-text-muted/60 focus:outline-none text-sm transition-colors"
                    aria-label="Tìm kiếm gái gọi, địa điểm"
                  />
                  
                  {/* Search button with icon */}
                  <button
                    type="submit"
                    className={`mr-2 p-3 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background group/btn ${
                      searchQuery.trim()
                        ? 'bg-gradient-to-r from-primary via-primary to-primary-hover text-white hover:shadow-xl hover:shadow-primary/40 active:scale-95 cursor-pointer'
                        : 'bg-secondary/20 text-text-muted/50 cursor-not-allowed opacity-60'
                    }`}
                    aria-label="Tìm kiếm"
                    disabled={!searchQuery.trim()}
                  >
                    <svg 
                      className={`w-5 h-5 transition-transform duration-200 ${
                        searchQuery.trim() ? 'group-hover/btn:scale-110' : ''
                      }`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2.5} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="flex flex-col gap-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer
                      ${isActive
                        ? 'text-primary bg-primary/10 border border-primary/20 shadow-sm shadow-primary/10'
                        : 'text-text hover:text-primary hover:bg-background-light border border-transparent hover:border-secondary/30'
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
              <div className="pt-4 border-t border-secondary/20 space-y-2">
                <Link
                  href={getRoleDashboardPath()}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text hover:text-primary hover:bg-background-light border border-transparent hover:border-secondary/30 transition-all duration-200 cursor-pointer"
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
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Đăng xuất
                </button>
              </div>
            ) : (
              <div className="pt-4 border-t border-secondary/20 space-y-2">
                <Link
                  href="/auth/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-text hover:text-primary hover:bg-background-light border border-transparent hover:border-secondary/30 transition-all duration-200 text-center cursor-pointer"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-primary to-primary-hover text-white hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all text-center cursor-pointer"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
    </>
  );
}
