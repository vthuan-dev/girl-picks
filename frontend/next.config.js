/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker (disabled for VPS deployment)
  // output: 'standalone',
  reactStrictMode: true,
  // Optimize development performance
  swcMinify: true,
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
  // Webpack optimizations for faster dev builds
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Enable filesystem caching for faster rebuilds
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
        // Cache more aggressively
        maxMemoryGenerations: 1,
      };
      // Optimize for development speed - reduce recompilation
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        // Minimize recompilation on navigation
        moduleIds: 'deterministic',
        chunkIds: 'deterministic',
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Only split large vendor chunks
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              minChunks: 2,
              // Cache vendor chunks
              reuseExistingChunk: true,
            },
          },
        },
      };
      // Faster source maps in dev
      config.devtool = 'eval-cheap-module-source-map';
      // Reduce watch options to prevent unnecessary recompilation
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.next/**',
          '**/dist/**',
          '**/build/**',
        ],
        aggregateTimeout: 300,
        poll: false,
      };
    }
    return config;
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3001',
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com', 'gaigo1.net', 'gaigu1.net'],
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
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
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
}

module.exports = nextConfig

