import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://localhost:5000/api/:path*'
          : '/backend/src/index.js',
      },
      {
        source: '/uploads/:path*',
        destination: process.env.NODE_ENV === 'development'
          ? 'http://localhost:5000/uploads/:path*'
          : '/backend/src/index.js',
      },
    ];
  },
};

export default nextConfig;
