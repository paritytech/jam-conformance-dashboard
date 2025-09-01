import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Add base path if deploying to GitHub Pages subdirectory
   basePath: '/jam-performance-dashboard',
   assetPrefix: '/jam-performance-dashboard/',
};

export default nextConfig;
