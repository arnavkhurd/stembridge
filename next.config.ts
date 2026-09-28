import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  async headers() {
    return [
      {
        source: "/",
        headers: [{ key: "X-STEMBridge-Offline", value: "public-shell" }],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          { key: "Service-Worker-Allowed", value: "/" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self'",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
