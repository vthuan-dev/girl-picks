'use client';

import { useEffect } from 'react';

interface CSKHPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CSKHPopup({ isOpen, onClose }: CSKHPopupProps) {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const telegramUsername = 'gaigo68';
    const telegramUrl = `https://t.me/${telegramUsername}`;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] animate-fadeIn"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Popup Modal */}
            <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 animate-fadeIn">
                <div
                    className="relative bg-background-light rounded-2xl shadow-2xl shadow-primary/20 border border-secondary/30 max-w-md w-full animate-scaleIn"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-background/50"
                        aria-label="Đóng"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Content */}
                    <div className="p-8 text-center">
                        {/* Icon */}
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl animate-pulse" />
                            <svg className="w-10 h-10 text-primary relative z-10" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.036.308.02.475z" />
                            </svg>
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-text mb-3">
                            Chăm Sóc Khách Hàng
                        </h2>

                        {/* Description */}
                        <p className="text-text-muted mb-6">
                            Liên hệ với chúng tôi qua Telegram để được hỗ trợ nhanh chóng
                        </p>

                        {/* Telegram Info */}
                        <div className="bg-background/50 rounded-xl p-4 mb-6 border border-secondary/20">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.036.308.02.475z" />
                                </svg>
                                <span className="text-sm text-text-muted font-medium">Telegram</span>
                            </div>
                            <p className="text-xl font-bold text-primary">@{telegramUsername}</p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-xl border border-secondary/30 text-text-muted hover:text-text hover:bg-background/50 transition-all font-medium"
                            >
                                Đóng
                            </button>
                            <a
                                href={telegramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all font-medium flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.036.308.02.475z" />
                                </svg>
                                Mở Telegram
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
