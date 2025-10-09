/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Temporarily disable webpack persistent cache to mitigate ArrayBuffer allocation failures
  webpack: (config) => {
    // In some environments, webpack's filesystem cache can OOM with large ArrayBuffers
    // Disable it temporarily; we can re-enable after the project is stable
    if (config?.cache) {
      config.cache = false
    }
    return config
  },
}

export default nextConfig