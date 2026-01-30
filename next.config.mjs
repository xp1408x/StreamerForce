/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Output 'export' enables `next export` for a fully static build. We
  // removed it earlier while migrating to server runtime; now we intentionally
  // enable it because the backend is hosted separately and the frontend will
  // be a static export.
  output: "export",
  // Optional: Hostinger and similar hosts expect directory-based outputs
  // for static hosting. Using `trailingSlash: true` makes paths like /blog/slug
  // generate `out/blog/slug/index.html` which can be convenient for static hosts.
  trailingSlash: true,
}

export default nextConfig
