/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ya no hay 'output: export', ahora Next.js puede usar el servidor
  images: { unoptimized: true },
  typescript: { ignoreBuildErrors: true },
}

export default nextConfig;