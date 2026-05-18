import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/python/:path*",
        destination: `${process.env.NEXT_PUBLIC_PYTHON_API ?? "http://localhost:8001"}/:path*`,
      },
      {
        source: "/api/java/:path*",
        destination: `${process.env.NEXT_PUBLIC_JAVA_API ?? "http://localhost:8080"}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
