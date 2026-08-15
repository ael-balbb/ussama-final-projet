# NasriPhone

Responsive technology storefront for Nasri Phone, built with React, TypeScript, Vite, Express, Railway, and Supabase.

## Architecture

- `src/`: Vercel-hosted storefront and protected admin interface.
- `backend/`: Railway-hosted Express API. It is the only application layer allowed to use the Supabase service role.
- `supabase/migrations/`: versioned database and security migrations.
- Supabase: products, promo packs, orders, administrators, and public product images.

The browser never writes directly to Supabase. Public catalogue reads, admin operations, uploads, and order creation all pass through the Railway API. Order prices are recalculated from current database records on the server.

## Local development

```bash
npm install
npm run dev
```

Create a root `.env.local`:

```dotenv
VITE_API_URL=https://your-railway-api.example
```

Vite proxies `/api` to that URL in development, so LAN and device previews use the same-origin local server without weakening production CORS.

Backend setup:

```bash
cd backend
npm install
npm run dev
```

Copy `backend/.env.example` to `backend/.env` and provide real values locally or through Railway. Never expose `SUPABASE_SERVICE_KEY`, `JWT_SECRET`, or admin credentials in Vite variables.

## Verification

```bash
npm run lint
npm run build
cd backend
npm run build
```

## Catalogue administration

The `/admin` interface manages:

- product and pack prices, compare-at prices, and promotion labels;
- images and product color variants;
- stock and availability per product and per color;
- featured/new/active storefront status and display order;
- order status and order history.

Inactive records remain visible to authenticated administrators but are excluded from the public API.

## Database security

Apply the checked-in migrations through Supabase before deploying matching server code. Public tables have RLS enabled and no anonymous/authenticated table privileges; Railway uses the service role. The `product-images` bucket is publicly readable, while upload and deletion are restricted to the authenticated backend.

## Deployment safety

`master` is the live Vercel branch. Use a feature branch and pull request for storefront or API changes, review the Vercel preview, deploy the Railway API with its matching migration, and merge only after verification.
