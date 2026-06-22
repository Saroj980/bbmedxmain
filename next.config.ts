import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://marigold52.edu.np/bbmedx-backend-main/public/api/:path*",
      },
    ];
  },
};

export default nextConfig;
