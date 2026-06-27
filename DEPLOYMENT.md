# S.B. Smart Brain Deployment Notes

## Current Status

- Public URL: `https://sb.rxcloud.group`
- Hosting: Vercel
- Framework: Next.js 16 App Router
- Backend services: Supabase and Volcengine Ark CodingPlan

## Local Validation

```bash
npm install
npm run test
npm run lint
npm run build
```

## Deployment Checklist

- Set `ARK_API_KEY`, `ARK_BASE_URL`, `ARK_CHAT_MODEL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_BASE_URL`.
- Verify daily topic loading, 3-round debate flow, score generation, save action, and OG image generation.
- Confirm `sb.rxcloud.group` domain, TLS, and share-card absolute URLs.
