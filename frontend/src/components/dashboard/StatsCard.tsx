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
  const colorClasses = {
    primary: 'bg-primary/20 text-primary',
    accent: 'bg-accent/20 text-accent',
    yellow: 'bg-yellow-500/20 text-yellow-500',
    green: 'bg-green-500/20 text-green-500',
  };

  return (
    <div className="bg-background-light rounded-lg border border-secondary/30 p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/10">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            trend === 'up' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          <svg
            className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
          {change}
        </div>
      </div>
      <h3 className="text-text-muted text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-text">{value}</p>
    </div>
  );
}

