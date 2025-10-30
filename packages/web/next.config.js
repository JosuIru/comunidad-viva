/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  i18n: {
    locales: ['es', 'eu'],
    defaultLocale: 'es',
    localeDetection: true,
  },
  images: {
    domains: [
      'localhost',
      'images.unsplash.com',
      'i.pravatar.cc',
      'raw.githubusercontent.com',
      'cdnjs.cloudflare.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors. Fix warnings before production deployment.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: false,
  },
}

const withNextIntl = require('next-intl/plugin')(
  // Path to i18n config
  './i18n.ts'
);

module.exports = withNextIntl(nextConfig);
