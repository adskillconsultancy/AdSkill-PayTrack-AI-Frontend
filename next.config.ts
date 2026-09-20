import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Future configuration options go here */
  async redirects() {
    return [
      {
        source: "/dashboard/payments",
        destination: "/payments",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
