import Link from 'next/link';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Separate breadcrumb path (Trang chủ > Gái gọi) and last item (girl name)
  const pathItems = items.slice(0, -1); // All items except the last one
  const lastItem = items[items.length - 1]; // Girl name

  return (
    <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6">
      {/* Breadcrumb path: Trang chủ > Gái gọi - với background như ảnh */}
      {pathItems.length > 0 && (
        <div className="bg-background-light/60 rounded-lg px-3 py-2.5 mb-3 sm:mb-4 border border-secondary/20">
          <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            {pathItems.map((item, index) => (
              <li key={index} className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                {index === 0 && (
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                )}
                {index > 0 && (
                  <svg
                    className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary/70 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                <Link
                  href={item.href}
                  className="text-primary hover:text-primary-hover transition-colors cursor-pointer font-medium whitespace-nowrap flex items-center"
                  title={item.label}
                  style={{ lineHeight: '1' }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </div>
      )}
      
      {/* Girl name on new line - Mobile optimized, design đẹp như ảnh */}
      {lastItem && (
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-text leading-tight break-words tracking-tight">
          {lastItem.label}
        </h1>
      )}
    </nav>
  );
}

