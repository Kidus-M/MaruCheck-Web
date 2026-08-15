import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep builds compatible with managed environments that prohibit child-process forks.
    workerThreads: true,
  },
  poweredByHeader: false,
};

export default nextConfig;
