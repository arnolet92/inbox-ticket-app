import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: "/inbox-template",
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
