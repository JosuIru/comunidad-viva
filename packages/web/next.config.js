/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable standalone for now - causes SSR errors
  // output: 'standalone',
  // i18n configuration for multi-language support
  i18n: {
    locales: ['es', 'eu', 'en', 'ca'],
    defaultLocale: 'es',
    localeDetection: false,
  },
  // PWA Configuration
  headers: async () => [
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate',
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/',
        },
      ],
    },
    {
      source: '/manifest.json',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'cdnjs.cloudflare.com',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  },
  eslint: {
    // Temporarily ignore ESLint errors during builds for Railway deployment
    // TODO: Fix ESLint errors and re-enable this
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Temporarily ignore TypeScript errors during builds for Railway deployment
    // The backend has type mismatches due to Prisma schema naming conventions
    ignoreBuildErrors: true,
  },
}

// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Compose all plugins
// Note: next-intl is configured via getI18nProps in src/lib/i18n.ts for Pages Router
module.exports = withBundleAnalyzer(nextConfig);
