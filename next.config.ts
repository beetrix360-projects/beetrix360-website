import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false,
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/icon.svg",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/home-1",
        destination: "/seo",
        permanent: true,
      },
      {
        source: "/ai-search-and-seo",
        destination: "/seo",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
