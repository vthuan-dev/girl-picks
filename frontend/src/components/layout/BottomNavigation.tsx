'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { useState } from 'react';
import CSKHPopup from '@/components/common/CSKHPopup';

export default function BottomNavigation() {
    const pathname = usePathname();
    const { user } = useAuthStore();
    const [isCSKHPopupOpen, setIsCSKHPopupOpen] = useState(false);

    const baseNavItems = [
        {
            href: user ? '/' : '/auth/login',
            label: user ? 'Trang chủ' : 'Đăng ký',
            key: 'home',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {user ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    )}
                </svg>
            ),
        },
        {
            href: '/girls',
            label: 'Gái gọi',
            key: 'girls',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
        },
        {
            href: '/phim-sex',
            label: 'Phim sex',
            key: 'phim-sex',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            ),
        },
        {
            href: '/chat-sex',
            label: 'Chat sex',
            key: 'chat-sex',
            icon: (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
        },
    ];

    const anhSexItem = {
        href: '/anh-sex',
        label: 'Ảnh sex',
        key: 'anh-sex',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
        ),
    };

    const supportItem = {
        href: '/support',
        label: 'CSKH',
        isButton: true, // Mark this as a button instead of link
        onClick: () => setIsCSKHPopupOpen(true),
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
    };

    const replaceableHrefs = baseNavItems.map((item) => item.href);
    const isReplaceableActive = replaceableHrefs.some((href) => pathname === href || pathname?.startsWith(href + '/'));

    const navItems = (() => {
        if (isReplaceableActive) {
            const filtered = baseNavItems.filter((item) => !(pathname === item.href || pathname?.startsWith(item.href + '/')));
            return [...filtered, anhSexItem, supportItem];
        }
        return [...baseNavItems, anhSexItem, supportItem];
    })();

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/98 backdrop-blur-xl border-t border-secondary/30 shadow-2xl shadow-black/30 lg:hidden">
                <div className="max-w-7xl mx-auto px-2">
                    <div className="flex items-center justify-around h-20">
                        {navItems.map((item) => {
                            const isButton = 'isButton' in item && item.isButton;
                            const isActive = !isButton && (pathname === item.href || pathname?.startsWith(item.href + '/'));

                            // Render button for CSKH, link for others
                            if (isButton) {
                                return (
                                    <button
                                        key={item.label}
                                        onClick={item.onClick}
                                        className="flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 min-w-[60px] text-text-muted hover:text-primary hover:scale-105"
                                    >
                                        <div className="transition-all duration-300">
                                            {item.icon}
                                        </div>
                                        <span className="text-xs font-medium whitespace-nowrap">
                                            {item.label}
                                        </span>
                                    </button>
                                );
                            }

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`
                  flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 min-w-[60px]
                  ${isActive
                                            ? 'text-primary scale-110'
                                            : 'text-text-muted hover:text-primary hover:scale-105'
                                        }
                `}
                                >
                                    <div className={`
                  transition-all duration-300
                  ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,0,102,0.6)]' : ''}
                `}>
                                        {item.icon}
                                    </div>
                                    <span className={`
                  text-xs font-medium whitespace-nowrap
                  ${isActive ? 'font-bold' : ''}
                `}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </nav>

            {/* CSKH Popup */}
            <CSKHPopup isOpen={isCSKHPopupOpen} onClose={() => setIsCSKHPopupOpen(false)} />
        </>
    );
}
