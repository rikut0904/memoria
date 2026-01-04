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
}

module.exports = nextConfig
