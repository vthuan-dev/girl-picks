/**
 * Utility to handle image URLs and ensure they are absolute for Next.js Image Optimization
 */
export function getFullImageUrl(url: string | undefined | null): string {
    if (!url) return '';

    // Return as is if it's already an absolute URL (but not on our domain with old path) or base64
    if (url.startsWith('http') || url.startsWith('data:')) {
        // If it's our own domain and has the problematic path, we still want to fix it below
        if (url.includes('gaigo1.net/public/uploads/') && !url.includes('gaigo1.net/api/public/uploads/')) {
            // Continue to cleanUrl logic
            url = url.replace(/https?:\/\/gaigo1\.net/i, '');
        } else {
            return url;
        }
    }

    // Get base URL from environment or current window
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        || (typeof window !== 'undefined' ? window.location.origin : 'https://gaigo1.net');

    // Ensure the URL starts with a slash
    let cleanUrl = url.startsWith('/') ? url : `/${url}`;

    // Fix for proxy issues on production: standardize all upload paths to /api/uploads/
    // This handles both old paths (/public/uploads or /api/public/uploads) and the new path (/api/uploads)
    if (cleanUrl.includes('/uploads/')) {
        if (cleanUrl.startsWith('/public/uploads/')) {
            cleanUrl = `/api${cleanUrl.replace('/public', '')}`;
        } else if (cleanUrl.startsWith('/api/public/uploads/')) {
            cleanUrl = cleanUrl.replace('/public', '');
        } else if (cleanUrl.startsWith('/uploads/')) {
            cleanUrl = `/api${cleanUrl}`;
        }
    }

    // Prepend site URL to make it absolute
    return `${siteUrl}${cleanUrl}`;
}
