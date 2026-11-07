import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  // Portfolio image uploads go through a server action. Netlify functions accept about 6 MB per request.
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
  // Keep any earlier service addresses working.
  async redirects() {
    return [
      { source: "/services/dashboards-business-reporting", destination: "/services/dashboards-and-reporting", permanent: true },
      { source: "/services/project-management-coordination", destination: "/services/project-management", permanent: true },
      { source: "/services/business-email-it-systems-support", destination: "/services/business-email-and-it-support", permanent: true },
      { source: "/services/website-digital-solutions", destination: "/services/website-and-digital-solutions", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default config;
