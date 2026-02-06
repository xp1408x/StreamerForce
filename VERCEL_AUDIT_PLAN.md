# Plan de verificación y acciones (vercel-react-best-practices)

Fecha: 2026-02-05

Objetivo: aplicar correcciones automáticas y de alto impacto para alinear el proyecto con las mejores prácticas de Vercel/Next.js.

Acciones propuestas (priorizadas):

1. Actualizar `next.config.mjs`:
   - Habilitar optimización de imágenes (quitar `unoptimized: true`).
   - Añadir `remotePatterns` (o `domains`) para orígenes remotos de imágenes.
   - Desactivar `typescript.ignoreBuildErrors` para forzar corrección de errores TS.

2. Paralelizar consultas principales en `app/page.tsx`:
   - Iniciar las consultas a Supabase en paralelo y `await Promise.all(...)`.
   - Esto elimina waterfalls en la carga inicial y mejora TTFB.

3. Añadir `sizes` a todas las llamadas a `next/image` que usan `fill`:
   - Componentes objetivo: `ArticleCard`, `ProductCard`, `StreamerCard`, `ServerCard`.
   - Usar tamaños responsivos razonables, p.ej. `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"`.

4. Separar variables de entorno cliente/servidor en Supabase:
   - `createClient()` server-side debe usar `SUPABASE_URL` y `SUPABASE_ANON_KEY` (no `NEXT_PUBLIC_`),
   - `createStaticClient()` debe usar `NEXT_PUBLIC_*` para el cliente.

5. Recomendar (no cambiar automáticamente sin confirmación):
   - Auditar imports grandes (p. ej. icon libraries) y aplicar `dynamic()` o imports específicos.
   - Añadir `remotePatterns` concretos en `next.config.mjs` para seguridad y rendimiento.

Plan de ejecución inmediato (haré ahora):
- Crear este archivo (hecho).
- Aplicar los cambios seguros y automatizables: 1) `next.config.mjs` (habilitar imágenes y TS), 2) paralelizar `app/page.tsx`, 3) añadir `sizes` en componentes, 4) actualizar `lib/supabase/server.ts` para usar variables server-only.

Notas y riesgos:
- Cambiar `typescript.ignoreBuildErrors` a `false` puede introducir fallos de compilación locales; tras el cambio, ejecuta `npm run build` o `npm run dev` para ver y corregir errores.
- Añadir `remotePatterns` muy permisivos reduce seguridad; es ideal reemplazarlos por hostnames concretos.

Siguiente paso: aplicar los parches en el repo (voy a hacerlo ahora).