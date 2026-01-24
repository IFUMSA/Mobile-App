import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Add empty turbopack config to avoid webpack/turbopack conflict warning
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "i.pinimg.com",
      },
    ],
  },
};

export default withSerwist(nextConfig);
