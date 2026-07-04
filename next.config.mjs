/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  images: {
    // Existing Cloudinary-hosted product photography — untouched, only
    // routed through next/image for automatic resizing/format negotiation.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dtsixdjix/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    // Baseline hardening for Phase 1. A full CSP (Part 11 of the brief) is
    // deferred to the Security Manual in Phase 5, once Supabase, GA, Search
    // Console and Sentry origins are all known and can be safely allow-listed
    // — shipping a CSP now would either be too loose to matter or break
    // those integrations when they land.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
