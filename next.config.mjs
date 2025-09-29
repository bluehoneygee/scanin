/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.openfoodfacts.org",
        pathname: "/images/**",
      },
      // kalau mau ijinkan http juga (jarang perlu)
      {
        protocol: "http",
        hostname: "images.openfoodfacts.org",
        pathname: "/images/**",
      },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
