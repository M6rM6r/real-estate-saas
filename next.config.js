/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['sharp', 'firebase-admin', '@google-cloud/storage', '@google-cloud/firestore', 'google-auth-library'],
  },
}

module.exports = nextConfig
