# Vercel Deployment & Optimization Guide

This guide outlines the steps to migrate your project from Hostinger to Vercel and implement essential optimizations like dynamic rendering and rate limiting.

## 1. Clean Up Hostinger Artifacts

Hostinger-specific files should be removed as Vercel handles routing and deployment differently.

- [ ] Remove `.htaccess` (Vercel uses `next.config.mjs` or `vercel.json`).

## 2. Make the Site Dynamic

Ensure your site doesn't just build static pages at compile time if you want real-time updates from Supabase.

- [ ] Use `export const dynamic = 'force-dynamic'` in pages that fetch data from Supabase.
- [ ] Verify that all Supabase calls are using the server client correctly in SSR components.

## 3. Implement Rate Limiting (Protection from Costs)

Vercel provides several ways to implement rate limiting. To prevent "surprise" costs from bots or scrapers:

### Option A: Vercel Web Application Firewall (WAF)
Vercel has built-in protection. You can configure it in the Vercel Dashboard under **Settings > Security**.

### Option B: Middleware Rate Limiting (Using Upstash)
This is the most robust way to control costs at the application level.

1. **Create an Upstash Redis account** (Free tier available).
2. **Install the Upstash Rate Limit library**:
   ```bash
   npm install @upstash/ratelimit @upstash/redis
   ```
3. **Configure Middleware**: Add the rate limiting logic to your `middleware.ts`.

## 4. Environment Variables

Ensure all your variables are set in the Vercel Dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (for admin actions)
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `UPSTASH_REDIS_REST_URL` (if using rate limiting)
- `UPSTASH_REDIS_REST_TOKEN` (if using rate limiting)

## 5. Deployment Steps

1. **Connect Repository**: Connect your GitHub repository to Vercel.
2. **Configure Build Settings**:
   - Framework Preset: **Next.js**
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. **Deploy**: Push your changes to the `main` branch.

## 6. Rate Limit Implementation Example

```typescript
// Add this to your middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
});

// Inside your middleware function:
const ip = request.ip ?? "127.0.0.1";
const { success } = await ratelimit.limit(ip);

if (!success) {
  return new NextResponse("Too many requests", { status: 429 });
}
```
