# Ente Vaahanam

Vehicle maintenance tracker (Next.js, Supabase, Web Push). Phase 1.

## Setup

1. **Supabase**: create a project, then run `supabase/migrations/0001_init.sql` in the SQL editor.
   - Authentication → Providers → enable **Google** (paste the Google client ID and secret).
   - Authentication → URL Configuration: add Site URL (your Vercel URL) and redirect URLs
     `http://localhost:3000/auth/callback` and `https://YOUR-DOMAIN/auth/callback`.
2. **Google Cloud**: APIs & Services → Credentials → OAuth client (Web). Authorized redirect URI is the one
   shown in Supabase's Google provider settings (`https://<ref>.supabase.co/auth/v1/callback`).
   Set the consent screen's privacy and terms links to `/privacy` and `/terms`.
3. **Env**: `cp .env.local.example .env.local` and fill it in. Generate VAPID keys with
   `npx web-push generate-vapid-keys`, and a random `CRON_SECRET`.
4. `npm run dev`. Push and the service worker need HTTPS or localhost.
5. **Vercel**: import the repo, add the same env vars. `vercel.json` schedules the daily job at 02:30 UTC (~8:00 IST).

## Notes
- Daily job: `GET /api/cron/reminders` (needs `Authorization: Bearer $CRON_SECRET`; Vercel adds it automatically).
  Notifies once when "due soon", once when overdue, then weekly while still overdue.
- All tables use Row Level Security; the service-role key is used only by the cron route.
