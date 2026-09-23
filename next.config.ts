import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Uploads are already resized on save. The on-request optimizer was fetching
  // /api/media through itself and sometimes returning a blank image.
  images: { unoptimized: true },
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs"],
  experimental: {
    serverActions: {
      bodySizeLimit: "250mb",
    },
  },
};

export default nextConfig;
