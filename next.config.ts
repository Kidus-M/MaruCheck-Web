import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        destination: "/product",
        permanent: false,
        source: "/pricing",
      },
    ];
  },
  async headers() {
    return [
      {
        headers: [
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), geolocation=(), microphone=()",
          },
        ],
        source: "/:path*",
      },
    ];
  },
  experimental: {
    // Keep builds compatible with managed environments that prohibit child-process forks.
    workerThreads: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
