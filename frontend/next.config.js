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
    const backendOrigin = process.env.BACKEND_ORIGIN || 'http://backend:8080'
    return [
      {
        source: '/api/:path*',
        destination: `${backendOrigin}/api/:path*`,
      },
    ];
  },
}

module.exports = nextConfig
