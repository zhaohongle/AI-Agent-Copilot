/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // 静态导出
  trailingSlash: true,  // 确保路由兼容性
  reactStrictMode: true,
  swcMinify: true,
  images: {
    unoptimized: true,  // 静态导出必须禁用图片优化
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['*']
    }
  },
  // 注意: output: 'export' 不支持 rewrites，改用客户端 API_BASE_URL
}

module.exports = nextConfig
