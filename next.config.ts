import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  typescript: { ignoreBuildErrors: true },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'hls.js': false,
    };
    return config;
  },
};

export default nextConfig;
