import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Required for Docker production build (Cloud Run)
  output: 'standalone',

  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },

  // Ensure TypeScript errors fail the build
  typescript: {
    ignoreBuildErrors: false,
  },

  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    experimental: {
      optimizePackageImports: ['lucide-react'],
    },
  }),
}

export default nextConfig
