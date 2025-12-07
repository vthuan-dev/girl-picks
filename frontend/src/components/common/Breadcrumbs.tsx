import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 overflow-x-auto scrollbar-hide">
      <ol className="flex items-center gap-1.5 sm:gap-2 text-sm whitespace-nowrap min-w-max">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
              {index > 0 && (
                <svg
                  className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-primary/60 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              )}
              {isLast ? (
                <span 
                  className="text-text font-medium truncate max-w-[200px] sm:max-w-none" 
                  aria-current="page"
                  title={item.label}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-text-muted hover:text-primary transition-colors cursor-pointer truncate max-w-[120px] sm:max-w-none"
                  title={item.label}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

