import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/registrations',
        destination: 'http://localhost:4000/registrations',
      },
      {
        source: '/api/registrations/:path*',
        destination: 'http://localhost:4000/registrations/:path*',
      },
      {
        source: '/api/admin/:path*',
        destination: 'http://localhost:4000/admin/:path*',
      },
      {
        source: '/api/upload-receipt',
        destination: 'http://localhost:4000/upload-receipt',
      },
    ];
  },
};

export default withNextIntl(nextConfig);
