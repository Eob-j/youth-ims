/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  experimental: {
    serverActions: {
      // Imports are server actions. Files are capped at 5 MB in
      // lib/importer/limits.ts; this leaves room for upload overhead.
      bodySizeLimit: "6mb",
    },
  },
}

export default nextConfig
