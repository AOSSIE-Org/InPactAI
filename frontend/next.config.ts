// Validate NEXT_PUBLIC_API_URL at build time
const requiredEnv = process.env.NEXT_PUBLIC_API_URL;
if (!requiredEnv || !/^https:\/\//.test(requiredEnv)) {
  throw new Error(
    "NEXT_PUBLIC_API_URL is missing or not a valid HTTPS URL. Please set NEXT_PUBLIC_API_URL to a valid HTTPS endpoint."
  );
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
