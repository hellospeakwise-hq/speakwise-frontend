/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa"

const isProd = process.env.NODE_ENV === 'production';

const withPWA = withPWAInit({
  dest: "public",
  disable: !isProd,          // ← KEY FIX: disable SW in dev (stops infinite recompile loop)
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false,  // ← was causing SW reinstall freezes
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