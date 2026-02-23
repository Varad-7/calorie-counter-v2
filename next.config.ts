import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  // @ts-expect-error - eslint is a valid Next.js config option but may not be in the locally installed types
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
