# The Humanity & Cooperation Initiative

An ORIVANA initiative in collaboration with Randall S. Pitts and The Humanity Movement.
Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage) · Vercel. Mobile-first.

## What is included
- **Public site:** homepage, About (editable), Cooperation Academy (10 topic pages), article library (40 original articles, search, categories, tags), webinars (upcoming, past, recordings, registration, speakers, materials, YouTube/Vimeo embeds), Humanity Toolkit (searchable, download counter), Programmes (Youth, Cooperation & Leadership, Train the Facilitators), Cooperation Circles, Humanity in Practice stories, Global Cooperation Challenge (guidelines, submission, showcase, recognition), Research/Dialogue/Knowledge, Support & sponsorship, Contribute, Contact, Newsletter, search, sitemap, robots, RSS.
- **Admin (`/admin`):** Super Admin / Editor / Content Manager roles with configurable permissions; dashboard; full article CMS (workflow draft → review → scheduled/published); webinars, speakers, materials, registrations; toolkit; stories; research; programmes and modules; circles; challenge; facilitators; forms and enquiries (with a form builder); newsletter subscribers and campaigns; sponsors and support options; media library; navigation, pages, SEO per page; website settings; analytics; notifications; users and roles; activity log. Works on a phone.
- **Contributors:** anyone can apply at `/contribute`. When approved, they write and submit articles at `/contributor`; editors review before anything is published.
- **Database:** 42 `hc_` tables with row level security, foreign keys, indexes and an audit log.
- **Free for students and communities.** No paywalls. Sustainability comes from clearly labelled sponsors, institutional programmes and voluntary contributions (see `docs/SETUP.md`).

## Quick start
1. Create a Supabase project. In the SQL editor run, in order: `supabase/01_schema.sql`, `02_functions.sql`, `03_rls.sql`, `04_seed.sql`, `06_grants.sql`.
2. Create the first admin with the separate private file `05_admin_user_PRIVATE.sql` (kept outside this repository).
3. Create a Vercel project from this repository and add the environment variables from `.env.example`.
4. Deploy, open `/admin/login`, sign in, and change the password. Admin → System → Load starter content (`/admin/seed`) provides the SQL setup sequence; it is a guide and does not execute SQL automatically.

Full instructions: **`docs/SETUP.md`**.

## Honest status
- Built and checked for syntax and types with a stand-in checker; `next build` has not been run by the author. Vercel will run it on your first deploy; send me the build log if anything fails.
- SQL was run on a real PostgreSQL 16 with a stand-in for the Supabase `auth` and `storage` schemas.
- Online payments (Razorpay, Stripe) are **not** implemented. Voluntary contributions use bank/UPI details you enter in Admin → Website settings.
- The Randall S. Pitts biography, legal pages, sample webinars and illustrative stories are placeholders, clearly labelled, to be replaced with approved content.
