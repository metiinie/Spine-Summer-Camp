import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'spine-summer-camp.onrender.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/registrations',
        destination: `${BACKEND_URL}/registrations`,
      },
      {
        source: '/api/registrations/:path*',
        destination: `${BACKEND_URL}/registrations/:path*`,
      },
      {
        source: '/api/admin/:path*',
        destination: `${BACKEND_URL}/admin/:path*`,
      },
      {
        source: '/api/upload-receipt',
        destination: `${BACKEND_URL}/upload-receipt`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
