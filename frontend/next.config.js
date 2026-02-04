/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // undiciライブラリをサーバーサイドでのみ使用するように設定
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        undici: false,
      };
    }

    return config;
  },
  async rewrites() {
    const backendOrigin = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://backend:8080')
      .replace(/\/$/, '')
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
