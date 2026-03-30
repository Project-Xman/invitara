import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

// The studio page embeds the self-hosted Webstudio instance in an iframe.
// We relax frame-src for that route to allow the configured WEBSTUDIO_URL.
const webstudioUrl = process.env.WEBSTUDIO_URL ?? "http://localhost:5173";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Increased to support photo/music file uploads
      bodySizeLimit: "10mb",
    },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        // Allow the studio page to embed the Webstudio iframe
        source: "/studio",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `frame-src ${webstudioUrl};`,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
