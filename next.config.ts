import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ... بقية إعداداتك ...
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // نطاق صور قوقل الافتراضي
        port: '',
        pathname: '/**', // السماح لجميع المسارات داخل هذا النطاق
      },
    ],
  },
};

export default nextConfig;
