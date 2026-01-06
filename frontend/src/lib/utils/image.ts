/**
 * Utility to handle image URLs and ensure they are absolute for Next.js Image Optimization
 */
export function getFullImageUrl(url: string | undefined | null, forceAbsolute: boolean = false): string {

    if (!url) {
        return '';
    }

    // Return as is if it's already an absolute URL (but not on our domain with old path) or base64
    if (url.startsWith('http') || url.startsWith('data:')) {
        // Handle gaigu1.net to gaigu2.net transition
        if (url.includes('gaigu1.net')) {
            url = url.replace('gaigu1.net', 'gaigu2.net');
        }

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

    // Standardize all upload paths to /uploads/
    // This allows Next.js to check the public folder first, then use rewrites for the backend.
    if (cleanUrl.includes('/uploads/')) {
        if (cleanUrl.startsWith('/public/uploads/')) {
            cleanUrl = cleanUrl.replace('/public', '');
        } else if (cleanUrl.startsWith('/api/public/uploads/')) {
            cleanUrl = cleanUrl.replace('/api/public', '');
        } else if (cleanUrl.startsWith('/api/uploads/')) {
            cleanUrl = cleanUrl.replace('/api', '');
        }
    }

    // Return relative path for local images to avoid "resolved to private ip" errors in Next.js
    // SSRF protection in Next.js Image Optimization blocks absolute URLs to private/local IPs.
    if (!forceAbsolute) {
        return cleanUrl;
    }

    // Prepend site URL to make it absolute if forced (e.g., for SEO metadata or sharing)
    const finalUrl = `${siteUrl}${cleanUrl}`;
    return finalUrl;
}
