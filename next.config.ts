import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/calorie-counter-v2",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
