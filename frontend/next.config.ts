// Validate NEXT_PUBLIC_API_URL at build time
// In production, require HTTPS. In development, allow HTTP for localhost
const requiredEnv = process.env.NEXT_PUBLIC_API_URL;
const isProduction = process.env.NODE_ENV === "production";

// Only validate in production - in development, allow fallback to localhost:8000
if (isProduction) {
  if (!requiredEnv) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is missing. Please set NEXT_PUBLIC_API_URL to your backend API URL."
    );
  }

  // In production, require HTTPS (except for localhost which is allowed for development)
  if (!requiredEnv.match(/^https:\/\//) && !requiredEnv.match(/^http:\/\/localhost|backend/)) {
    throw new Error(
      "NEXT_PUBLIC_API_URL must use HTTPS in production. Please set NEXT_PUBLIC_API_URL to a valid HTTPS endpoint."
    );
  }
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
