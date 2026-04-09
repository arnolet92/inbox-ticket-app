import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/inbox-template",
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
