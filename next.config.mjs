/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ya no hay 'output: export', ahora Next.js puede usar el servidor
  images: {
    // Habilitar optimización. Reemplazar `remotePatterns` por hosts concretos cuando sea posible.
    unoptimized: false,
    remotePatterns: [
      // Permitir imágenes remotas HTTPS — acotar a hosts concretos en producción.
      { protocol: 'https', hostname: '**' }
    ]
  },
  // Forzar corrección de errores TypeScript en build
  typescript: { ignoreBuildErrors: false },
}

export default nextConfig;