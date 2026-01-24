import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
  reloadOnOnline: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Required for webpack-based plugins (Serwist) with Next.js 16 Turbopack
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
