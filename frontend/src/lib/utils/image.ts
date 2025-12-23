/**
 * Utility to handle image URLs and ensure they are absolute for Next.js Image Optimization
 */
export function getFullImageUrl(url: string | undefined | null): string {
    if (!url) return '';

    // Return as is if it's already an absolute URL or base64
    if (url.startsWith('http') || url.startsWith('data:')) {
        return url;
    }

    // Get base URL from environment or current window
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
        || (typeof window !== 'undefined' ? window.location.origin : 'https://gaigo1.net');

    // Ensure the URL starts with a slash
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;

    // Prepend site URL to make it absolute
    return `${siteUrl}${cleanUrl}`;
}
