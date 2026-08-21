import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.3.4'],
  reactStrictMode: true,
  images: {
    // Cover art can be served from the CDN of your choice — add hosts here.
    remotePatterns: [{ protocol: 'https', hostname: 'www.infinityhex.com' }],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Global Privacy Control is honoured server-side in proxy.ts; this
          // advertises that the site respects it.
          { key: 'Permissions-Policy', value: 'browsing-topics=()' },
        ],
      },
    ]
  },
}

export default nextConfig
