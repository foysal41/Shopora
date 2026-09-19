import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "cdn.simpleicons.org",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
    unoptimized: true,
  },

  async rewrites() {
    return [
      {
        source: "/backend-api/:path*",
        destination: "https://shopora-server-xi.vercel.app/:path*",
      },
    ];
  },
};

export default nextConfig;