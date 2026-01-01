/** @type {import('next').NextConfig} */
const nextConfig = {
  // NOTE:
  // `output: 'export'` disables Next.js API routes (like `/api/send-inquiry`)
  // because the site becomes static-only. We need API routes to proxy the
  // inquiry request (avoids browser CORS issues).
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
