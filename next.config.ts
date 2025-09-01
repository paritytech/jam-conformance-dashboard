import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Only apply basePath and assetPrefix in production
  ...(isProd && {
    basePath: '/jam-conformance-dashboard',
    assetPrefix: '/jam-conformance-dashboard/',
  }),
};

export default nextConfig;