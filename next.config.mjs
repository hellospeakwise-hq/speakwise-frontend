/** @type {import('next').NextConfig} */
import withPWAInit from "@ducanh2912/next-pwa"

const isProd = process.env.NODE_ENV === 'production';

const withPWA = withPWAInit({
  dest: "public",
  disable: !isProd,          // ← disable SW in dev (stops infinite recompile loop)
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  swcMinify: true,
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    // Exclude API and media URLs from precaching
    exclude: [/\.map$/, /^https:\/\/apis\.speak-wise\.live\/.*/],
    runtimeCaching: [
      // ── API calls → always hit the network, never cache ──────────────
      {
        urlPattern: /^https:\/\/apis\.speak-wise\.live\/.*/i,
        handler: "NetworkOnly",
        options: {
          cacheName: "api-calls",
        },
      },
      // ── Cross-origin media / avatars → NetworkOnly ───────────────────
      // Prevents the SW from caching a stale 403/404 for uploaded images.
      {
        urlPattern: /\/media\/.*/i,
        handler: "NetworkOnly",
        options: {
          cacheName: "media-files",
        },
      },
      // ── Next.js app pages → NetworkFirst (freshest content) ──────────
      {
        urlPattern: /^https:\/\/speak-wise\.live\/.*$/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          networkTimeoutSeconds: 10,
        },
      },
      // ── Static assets (JS/CSS) → StaleWhileRevalidate ────────────────
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-static",
        },
      },
      // ── Google Fonts / other CDN assets → CacheFirst ─────────────────
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
          },
        },
      },
    ],
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