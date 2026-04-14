/** @type {import('next').NextConfig} */
const apiProxyTarget = process.env.API_PROXY_TARGET?.replace(/\/$/, '')

const nextConfig = {
  transpilePackages: ['@keen/types'],
  images: {
    unoptimized: true,
  },
  async rewrites() {
    if (!apiProxyTarget) {
      return []
    }

    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/:path*`,
      },
    ]
  },
}

export default nextConfig
