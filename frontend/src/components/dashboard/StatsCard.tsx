'use client';

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
  color: 'primary' | 'accent' | 'yellow' | 'green';
}

export default function StatsCard({
  title,
  value,
  change,
  trend,
  icon,
  color,
}: StatsCardProps) {
  const colorConfig = {
    primary: {
      iconBg: 'bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10',
      iconText: 'text-primary',
      iconGlow: 'shadow-lg shadow-primary/20',
      border: 'border-primary/20',
    },
    accent: {
      iconBg: 'bg-gradient-to-br from-accent/20 via-accent/15 to-accent/10',
      iconText: 'text-accent',
      iconGlow: 'shadow-lg shadow-accent/20',
      border: 'border-accent/20',
    },
    yellow: {
      iconBg: 'bg-gradient-to-br from-yellow-500/20 via-yellow-500/15 to-yellow-500/10',
      iconText: 'text-yellow-500',
      iconGlow: 'shadow-lg shadow-yellow-500/20',
      border: 'border-yellow-500/20',
    },
    green: {
      iconBg: 'bg-gradient-to-br from-green-500/20 via-green-500/15 to-green-500/10',
      iconText: 'text-green-500',
      iconGlow: 'shadow-lg shadow-green-500/20',
      border: 'border-green-500/20',
    },
  };

  const config = colorConfig[color];

  return (
    <div className="group relative bg-background-light rounded-xl border border-secondary/30 p-5 sm:p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/10 overflow-hidden">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/3 group-hover:to-primary/0 transition-all duration-500 pointer-events-none" />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center ${config.iconBg} ${config.iconText} ${config.iconGlow} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          <div
            className={`flex items-center gap-1 text-xs sm:text-sm font-semibold px-2 py-1 rounded-lg ${
              trend === 'up' 
                ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            <svg
              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 ${trend === 'down' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
              />
            </svg>
            <span>{change}</span>
          </div>
        </div>
        <div>
          <h3 className="text-text-muted text-xs sm:text-sm mb-2 font-medium">{title}</h3>
          <p className="text-2xl sm:text-3xl font-bold text-text group-hover:text-primary transition-colors duration-300">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

