/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000',
  },
  images: {
    domains: ['res.cloudinary.com', 'images.unsplash.com', 'gaigu1.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'gaigu1.net',
        pathname: '/images/**',
      },
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig

