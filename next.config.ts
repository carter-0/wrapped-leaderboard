import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.scdn.co'
      },
      {
        protocol: 'https',
        hostname: '**.scdn.co'
      },
      {
        protocol: 'https',
        hostname: '**.spotifycdn.com'
      },
      {
        protocol: 'https',
        hostname: 'spotalytics.app'
      },
      {
        protocol: 'https',
        hostname: 'trackalytics.carter.red'
      },
      {
        protocol: 'https',
        hostname: '**.trackify.am'
      },
      {
        protocol: 'https',
        hostname: 'example.com'
      },
      {
        protocol: 'https',
        hostname: 'external-content.duckduckgo.com'
      },
      {
        protocol: 'https',
        hostname: 'static.licdn.com'
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com'
      },
      {
        protocol: 'https',
        hostname: 'theprospect.band'
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net'
      },
      {
        protocol: 'https',
        hostname: '**.fbsbx.com'
      }
    ],
  }
};

export default nextConfig;
