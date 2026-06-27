# S.B. Smart Brain Maintenance Guide

## Project State

- Repository: `ava-agent/S.B.`
- Public URL: `https://sb.rxcloud.group`
- Stack: Next.js 16, React 19, Tailwind CSS v4, Supabase, Ark/OpenAI-compatible SDK
- Product: daily AI debate sparring app with score reports and share cards.

## Before Editing

- Keep Ark and Supabase credentials in `.env.local` or deployment secrets.
- Verify debate state transitions before changing prompt, scoring, or server action logic.
- Do not commit `.next/`, `.vercel/`, filled env files, or generated local screenshots unless they are documentation assets.

## Useful Commands

- Install: `npm install`
- Develop: `npm run dev`
- Test: `npm run test`
- Lint: `npm run lint`
- Build: `npm run build`

## Deployment Notes

- See `DEPLOYMENT.md` for Vercel, Supabase, Ark, and domain checks.
