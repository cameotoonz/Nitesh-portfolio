# Nitesh Kumar — Portfolio & Creative Studio

A premium, cinematic portfolio and owner-only content studio, built with React, TypeScript, Vite, Tailwind CSS, Framer Motion, and Supabase.

## Current deployment status

The public portfolio works immediately with the 12 real videos imported from Nitesh's previous website and his supplied profile photo. No third-party backend credentials were provided, so the deployed studio correctly shows a secure connection guide instead of pretending to save publicly or exposing a shared password. **Connect your own Supabase project and owner account once to activate database-backed editing and uploads.**

Read **[the complete setup guide](public/SETUP.md)** for exact steps. No coding is required for day-to-day updates after this one-time infrastructure setup.

## Features

- Responsive editorial design, subtle cinematic grading, typography, and integrated editing timeline.
- Six long-form projects (16:9) and six short-form projects (9:16), with real thumbnails and accessible video dialogs.
- YouTube, Shorts, Vimeo, public Instagram embeds where supported, direct videos, and external-provider fallbacks.
- Interactive editing DNA and four-step process.
- Direct WhatsApp, email, and Instagram contact links.
- Private studio: add/edit/delete, reorder, draft/publish, replace thumbnail/video, direct upload with progress.
- Editable profile photo, name, experience, location, biography, services, hero text, availability, and contact details.
- Shared Postgres data; realtime and periodic public refreshes; no localStorage-only content management.
- Supabase Auth, owner UUID allowlist, Postgres and Storage RLS, atomic reorder function, safe URL parsing.

## Project structure

```text
src/
  App.tsx                   Public/owner routing and shared data refresh
  pages/Portfolio.tsx       Public portfolio
  pages/Admin.tsx           Protected owner studio
  components/VideoModal.tsx Accessible native-dialog video player
  lib/data.ts               Verified imported portfolio content
  lib/media.ts              Safe URL and embed provider helpers
  lib/supabase.ts           Auth, database, and storage client
  lib/types.ts              Shared data contracts
  index.css                 Responsive public design
  admin.css                 Studio design
supabase/
  schema.sql                Database, policies, triggers, and storage
  seed.sql                  Original profile and 12 projects
public/
  images/                   Optimized supplied photo and original thumbnails
  SETUP.md                  Complete owner setup and operating guide
scripts/
  verify.mjs                Finite build verification and screenshots
  verify-database.mjs       Postgres schema and RLS tests using PGlite
 tests/
  portfolio.spec.ts         Public browser interaction tests
```

## Development

```sh
npm install
cp .env.example .env.local
# Add your own Supabase project URL and public anon key.
npm run dev
```

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are used. Never put privileged keys or owner passwords in client environment variables.

## Verification

```sh
npm run lint
npm run build
npx playwright install chromium
node scripts/verify.mjs
node scripts/verify-database.mjs
npm audit
```

The browser verifier serves the production bundle only for the duration of its tests, writes screenshots into ignored `test-results/`, and terminates. The database verifier exercises real SQL in a local embedded Postgres-compatible database with mock Supabase auth/storage schemas; it is not a claim that an external Supabase account has been provisioned. Live Auth, Storage, and realtime should additionally be checked against your own connected project using the guide's checklist.

## Deployment

Import this repository from GitHub into Vercel. `vercel.json` configures Vite, `dist`, the `/admin` rewrite, and security headers. Set the two public Supabase connection values in Vercel, run the supplied schema/seed in your database, create and allowlist your owner account, and redeploy.

No admin login, service-role key, database password, or private account information is committed. The studio never provides public self-registration. Published portfolio assets are intentionally public; do not upload confidential material. Media is retained after project deletion to avoid breaking other references.

## Content provenance

All video IDs came from Nitesh's previous portfolio and were checked using YouTube oEmbed. Display titles are editorially shortened and preserve the real project category. No client work, testimonials, awards, or performance metrics were invented. The actual supplied portrait is optimized, not replaced. Contact information follows the latest user-provided brief.
