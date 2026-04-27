/** @type {import('next').NextConfig} */

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bolt.new',
      },
      {
        protocol: 'https',
        hostname: '*.bolt.new',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'firebase-admin', '@google-cloud/storage', '@google-cloud/firestore', 'google-auth-library'],
  },
  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      if (process.env.ANALYZE) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: './analyze/client.html',
            openAnalyzer: false,
          })
        )
      }
      return config
    },
  }),
}

module.exports = nextConfig
