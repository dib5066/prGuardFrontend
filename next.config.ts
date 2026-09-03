import type { NextConfig } from "next";

// Proxy /api/* to the FastAPI backend so the browser only ever talks to the
// Next origin. That keeps the session cookie first-party (works with
// SameSite=Lax) and lets middleware see it.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
    ];
  },
};

export default nextConfig;
