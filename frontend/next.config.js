/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker (disabled for VPS deployment)
  // output: 'standalone',
  reactStrictMode: true,
  // Reduce compilation on navigation
  experimental: {
    // Optimize imports for faster compilation
    optimizePackageImports: [
      'react-query',
      'react-hook-form',
      '@hookform/resolvers',
      'zod',
      'date-fns',
      'lodash',
    ],
  },
  // Fix chunk loading errors
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gaigo1.net',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigu1.net',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigu2.net',
        pathname: '/images/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigo1.net',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigu1.net',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigu2.net',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigo1.net',
        pathname: '/public/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigo1.net',
        pathname: '/api/public/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigo1.net',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigu1.net',
        pathname: '/public/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigu2.net',
        pathname: '/public/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigu1.net',
        pathname: '/api/public/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigu2.net',
        pathname: '/api/public/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigu1.net',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'gaigu2.net',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  // SEO optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Headers for security and SEO
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
        ],
      },
    ];
  },
  // Redirects for SEO
  async redirects() {
    return [
      // Add any redirects here if needed
    ];
  },
  // API and Upload Rewrites
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:8000';
    // Remove trailing slash if present
    const backendUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

    return [
      {
        source: '/api/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
}

module.exports = nextConfig

