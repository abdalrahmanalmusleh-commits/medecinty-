import type { NextConfig } from "next";

const isExportBuild = process.env.NEXT_EXPORT_BUILD === "true" || process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  ...(isExportBuild ? { output: "export" } : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
