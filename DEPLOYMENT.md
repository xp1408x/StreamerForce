Despliegue estático (Hostinger u otro hosting PHP)

Resumen rápido
- Este repo ahora está preparado para export estático (`output: 'export'` en `next.config.mjs`).
- Ejecuta `npm run export:static` (o `npm run build`) para generar los archivos estáticos.
- La build genera la carpeta `out/` con los HTML y assets listos para subir.

Variables de entorno necesarias (para build y/o cliente)
- NEXT_PUBLIC_BACKEND_URL: URL pública de tu backend (ej: https://api.tuservidor.com). Required para que el frontend pueda crear sesiones de Stripe.
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: Clave pública de Stripe para el cliente.

Requisitos en el backend (ya lo tienes operativo):
- Endpoint POST ${process.env.NEXT_PUBLIC_BACKEND_URL}/checkout que recibe { productId, minecraftUsername } y devuelve { client_secret }.
- Implementar la creación de sesión Stripe, gestión de compras y webhooks en el backend.
- Habilitar CORS si el frontend y backend están en dominios distintos.

Pasos para desplegar en Hostinger (resumen):
1. Configurar variables de entorno en local o CI y ejecutar `npm run export:static`.
2. Subir el contenido de la carpeta `out/` a la carpeta pública de Hostinger (normalmente `public_html`).
3. Asegurar que `NEXT_PUBLIC_BACKEND_URL` apunte a tu backend en producción y que dicho backend acepte peticiones desde el dominio final.
4. Probar flujo de compra en producción.

Notas:
- Las API routes y Server Actions no funcionan en una exportación estática. Por eso, el flujo de Stripe fue movido a un endpoint externo.
- Si prefieres mantener Server Actions y funciones server, considera desplegar el backend Node en un servicio que soporte Node (Vercel, Render) y servir el frontend estático o desde el mismo servicio.
