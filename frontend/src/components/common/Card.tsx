import { ReactNode } from 'react';
import classNames from 'classnames';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({ children, className, hover = false, padding = 'md' }: CardProps) {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={classNames(
        'bg-background-light rounded-lg border border-secondary/30',
        hover && 'hover:shadow-2xl hover:border-primary/50 transition-all duration-300 cursor-pointer',
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

