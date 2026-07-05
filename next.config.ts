import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  // Point NEXT_PUBLIC_API_BASE_URL at your Django backend, e.g. http://localhost:8000
  
  // ⚠️ Bypass TypeScript errors during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // ⚠️ Bypass ESLint errors during build  
  eslint: {
    ignoreDuringBuilds: true,
  },
};

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl(nextConfig);