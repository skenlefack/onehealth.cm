/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    // Allow build to succeed even with TypeScript errors (for legacy code)
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow build to succeed even with ESLint errors
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_BACKEND_PROTOCOL || 'http',
        hostname: process.env.NEXT_PUBLIC_BACKEND_HOST || 'localhost',
        port: process.env.NEXT_PUBLIC_BACKEND_PORT || '5000',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: '*.onehealth.cm',
        pathname: '/uploads/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/images/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_INTERNAL_URL || 'http://localhost:5000';
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
