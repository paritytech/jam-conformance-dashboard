import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Add base path if deploying to GitHub Pages subdirectory
  // basePath: '/repo-name',
  // assetPrefix: '/repo-name/',
};

export default nextConfig;
