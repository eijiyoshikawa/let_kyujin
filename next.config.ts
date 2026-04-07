import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  serverExternalPackages: [
    "@react-pdf/renderer",
    "@react-pdf/layout",
    "@react-pdf/pdfkit",
    "@react-pdf/textkit",
  ],
};

export default nextConfig;
