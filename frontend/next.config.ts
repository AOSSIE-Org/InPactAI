import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix the workspace warning
  experimental: {
    turbo: {
      root: process.cwd(),
    },
  },
  
  // Enable React strict mode for better debugging
  reactStrictMode: true,
  
  // Configure image domains if needed later
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;