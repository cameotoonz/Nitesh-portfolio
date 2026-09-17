# Nitesh Kumar — One-time studio setup

## What is already live

The responsive public portfolio includes the exact profile photo supplied by Nitesh, all 12 video links imported from the old portfolio (six long form, six shorts), real video thumbnails, in-page players, editing approach and process interactions, and direct contact links.

The private studio is at `/admin`. It supports project creation/editing/deletion, draft/publish, atomic reordering, thumbnail and direct video uploads, URL-based video embeds, and all profile/contact/hero fields. The backend implementation uses Supabase Postgres, Authentication, Storage, and database-enforced row-level security. Supabase is a managed backend; a separate custom API server is not necessary.

**Deployment status:** No Supabase account credentials were provided to the builder. The preview therefore serves the imported portfolio and deliberately locks the studio behind a connection guide. A live database and owner account must be connected using the steps below. This is NOT a localStorage admin or a shared default-password demo. There is no public way to claim ownership.

## 1. Create your own backend

1. Create a project in your Supabase account. Keep the database password private.
2. In the Supabase SQL Editor, run `supabase/schema.sql` from this repository.
3. Then run `supabase/seed.sql`. This imports the profile and the 12 actual projects. It does not overwrite existing entries.
4. In Authentication settings, disable **Allow new users to sign up**. Do not enable anonymous authentication.
5. In Authentication → Users, manually create your owner account with your email and a strong, unique password. Mark the email confirmed if you use the dashboard's owner-created account workflow. Use an email you control.
6. Copy that account's user UUID. In the SQL Editor run the following, replacing the UUID:

```sql
insert into public.portfolio_admins (user_id)
values ('YOUR_OWNER_USER_UUID');
```

Only a database administrator can grant this role. The frontend cannot add admins. Merely registering or signing in as another user does not grant any write access. There is no admin email hardcoded in a security rule.

7. Configure the Supabase Auth Site URL to your final portfolio domain. Add only your own domains to redirect allowlists. Keep project-account MFA enabled.

## 2. Connect GitHub and Vercel

1. Push the repository to your GitHub account. Do not commit any `.env` files or private credentials.
2. Import the repository into Vercel. Select the Vite framework, `npm run build`, and output directory `dist` (also configured in `vercel.json`).
3. In Vercel → Project → Settings → Environment Variables, add:
   - `VITE_SUPABASE_URL`: your Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: your Supabase public anon key (or supported publishable key).
4. Redeploy after adding the variables. Vite reads these values at build time.
5. Visit `/admin` and sign in with the owner account you created.

These two values are public client connection identifiers. Security is enforced by authenticated JWTs and database/storage RLS, not by hiding the anon key. **Never set a service-role key, database password, or admin password in any VITE_ environment variable.** No service-role key is needed for this app.

For local development, copy `.env.example` to `.env.local`, set the two values, then use `npm install` and `npm run dev`.

## 3. Update your work — no coding

- Choose **Long form** or **Short form** in the studio to add a project.
- Enter a title and a short description/category.
- Upload a thumbnail, paste an image URL, or use the automatic YouTube thumbnail.
- Upload an MP4/WebM/MOV file or paste a video URL.
- Leave **Publish to portfolio** off to save a draft. Turn it on when ready.
- Use the eye button to publish/unpublish; pencil to edit; arrows to reorder.
- Deleting a project requires confirmation. The project disappears from the database and public site. Media files are intentionally retained to avoid deleting files used elsewhere. Remove unused assets in Supabase Storage when you are certain they are no longer needed.
- In **Profile & contact**, change the photo, name, experience, location, about text, hero lines, services, availability, email, WhatsApp, and Instagram.
- Public pages read the shared database, listen for realtime changes, and refresh on focus or every minute. No rebuild is needed for content updates.

## Video providers and storage

- YouTube videos and Shorts use privacy-enhanced embedded players; the original-platform link is always available if embedding is restricted.
- Vimeo uses its embedded player. Password-protected/private videos need appropriate Vimeo permissions. For unlisted videos, use the player URL with its `h` parameter.
- Public Instagram reel/post URLs embed where Instagram permits. Private, age-restricted, or embed-disabled videos may not play. Visitors may need to sign in. The player always includes an Instagram link as a fallback.
- MP4 and WebM play directly. MOV compatibility varies by browser; H.264 MP4 is recommended.
- Other HTTP(S) URLs open on the original provider instead of pretending they are supported embeds.
- Files larger than 6 MB use resumable TUS uploads and display progress. Supabase Storage limits, bandwidth, and quotas depend on your own plan. The application caps images at 10 MB and videos at 1 GB; your account may impose a lower video limit. Adjust bucket/global limits in your Supabase dashboard if appropriate. Uploads go directly to storage, not through Vercel request bodies.
- Portfolio media uses a public bucket. Draft project rows are private, but uploaded file URLs are not secret. Do not upload confidential or embargoed footage. A signed-URL/private-bucket workflow would be needed for confidential review media.

## Security and ownership

- Supabase manages password hashing, session tokens, token refresh, and authentication rate limiting. Use a strong unique password. This app does not store plaintext passwords.
- Every project/profile mutation, reorder RPC, and storage upload is checked by database policies against the owner UUID allowlist.
- Only published rows can be read anonymously. Profile information is intentionally public.
- Anonymous and authenticated non-owner users cannot add themselves as admins.
- Safe URL parsing blocks javascript/data URLs; React escapes text. SVG uploads are not allowed.
- To revoke an owner's access, delete their UUID from `portfolio_admins` in the SQL Editor and revoke their sessions in Authentication.
- For password recovery, use Authentication → Users in your Supabase dashboard to issue a reset or update the owner's account using your dashboard's supported flow.
- Keep Supabase database backups enabled as appropriate for your plan. All account billing and infrastructure belong to you.

## Deployment verification checklist

1. Confirm `/` and `/admin` open on a direct visit and a browser refresh.
2. Open an incognito window: only published projects should be visible. Anonymous mutation requests must be rejected by RLS.
3. Sign into the owner account. Add a draft and confirm it is hidden from incognito visitors.
4. Publish it and verify it appears publicly. Edit it and verify the shared database update.
5. Upload a thumbnail and a test MP4; check progress and playback.
6. Reorder, unpublish, and delete the test project.
7. Change a profile field and verify it in incognito. Restore it afterward.
8. Sign out. Confirm the studio requires authentication again.

## Imported content provenance

Videos were extracted from `https://niteshkuamr.netlify.app/` and verified against YouTube oEmbed metadata. Display titles were shortened editorially; descriptions retain the actual content/category and ADMEC attribution. No new client projects, awards, testimonials, or performance metrics were invented. The six original long-form IDs are 2dtas6lbR80, ZdN2ptci7ok, pXREsurAuEE, 0eVg1vVAmYo, pPoCS82plQQ, xl4ou0YNxDM. The six original short-form IDs are 7TuPSZmzOqY, WM5w5YWv5jA, e3TQGlrSkCY, ATLVCgPAqFM, 6UCzopp1q5M, FkyK4tV-kO4.

The supplied photo was downloaded from `https://raw.githubusercontent.com/cameotoonz/my-photo/main/profile.PNG` and optimized to WebP without replacing or generating a person. Public contact details follow the newest user-provided brief, including @framesbynitesh (the older site linked a different handle).
