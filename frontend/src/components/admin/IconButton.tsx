'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  children: ReactNode;
}

export default function IconButton({
  variant = 'default',
  size = 'md',
  children,
  className = '',
  ...props
}: IconButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';
  
  const variants = {
    default: 'text-text-muted hover:text-text hover:bg-background focus:ring-primary/50',
    ghost: 'text-text hover:bg-background-light focus:ring-primary/50',
    danger: 'text-red-500 hover:text-red-600 hover:bg-red-500/10 focus:ring-red-500/50',
  };

  const sizes = {
    sm: 'p-1.5',
    md: 'p-2',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

