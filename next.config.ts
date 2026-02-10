import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tveapi.acan.group',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.tve.static.acan.group',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'actu.rts.sn',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rtsactu.acan.group',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.facebook.com',
        pathname: '/**',
      },
    ],
  },
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
