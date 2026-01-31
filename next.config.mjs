/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true },
  output: "export",
  trailingSlash: true,
  // Al añadir esta función, obligas a Next a usar Webpack
  webpack: (config, { isServer }) => {
    return config;
  },
}

export default nextConfig;