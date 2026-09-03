import path from "node:path";
import type { NextConfig } from "next";

// Proxy /api/* to the FastAPI backend so the browser only ever talks to the
// Next origin. That keeps the session cookie first-party (works with
// SameSite=Lax) and lets middleware see it.
// On Vercel this MUST be set to the deployed backend URL (e.g. the Railway
// URL); the localhost fallback is for local dev only.
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

const nextConfig: NextConfig = {
  // Pin the workspace root to this folder so Next never infers it from a
  // stray parent-directory lockfile (deploying `frontend/` on its own).
  turbopack: { root: path.join(__dirname) },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
    ];
  },
};

export default nextConfig;
