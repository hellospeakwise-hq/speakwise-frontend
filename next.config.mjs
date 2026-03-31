/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa"

const isProd = process.env.NODE_ENV === 'production';

const withPWA = withPWAInit({
  dest: "public",
  disable: true,             // ← disabled: workbox-build@7.x bug ('assignWith is not defined') in CI/Vercel
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  swcMinify: true,
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true,
  },
})

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },
}

export default withPWA(nextConfig)