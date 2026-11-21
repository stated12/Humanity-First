# Setup, deployment and operations

## 1. Supabase
1. Create a project at supabase.com (the free plan is enough to start).
2. SQL editor → run these files **in order**, each once (all are safe to re-run):
   1. `supabase/01_schema.sql` (tables)
   2. `supabase/02_functions.sql` (helper functions, storage bucket `hc-media`)
   3. `supabase/03_rls.sql` (row level security)
   4. The seed. On a computer run `supabase/04_seed.sql` (one 340 KB file). **On a phone, run the 11 smaller files in `supabase/seed_parts/` in order: `04_01.sql` … `04_11.sql`** (a single huge paste can be cut off by the phone browser, which causes a syntax error). Both give identical results. Roles, settings, 10 topics, 40 articles, toolkit, circles content, programmes, forms, navigation and pages
   5. `supabase/06_grants.sql` (lets the server read and write the `hc_` tables; fixes error 42501)
3. Authentication → URL configuration: set Site URL to your live address and add `https://YOUR-DOMAIN/auth/callback` to Redirect URLs.
4. Authentication → Providers → Email: keep it enabled. For the contributor and reader sign-up, turn "Confirm email" on if you have SMTP set up in Supabase, otherwise off.
5. Project settings → API: copy the URL, anon key and service-role key.

All tables use the `hc_` prefix, so this project can share a Supabase project with other apps.

## 2. First admin
Run the separate file `05_admin_user_PRIVATE.sql` once in the SQL editor. It creates (or reuses) the login for `avdhesh20@gmail.com` and gives it the Super Admin role. **Do not put this file in GitHub.** Sign in at `/admin/login` and change the password under Admin → Website settings & account.

If the email already exists in your Supabase project, the existing password is kept.

## 3. Environment variables (Vercel → Settings → Environment Variables)
| Name | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Live address, no trailing slash |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only. Never expose it, never prefix with `NEXT_PUBLIC_` |
| `CRON_SECRET` | Long random string; protects the daily job |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Optional. Enables confirmation emails, enquiry notifications and newsletter sending |

Without SMTP the site works; subscribers are activated directly (when consent is ticked) and newsletters cannot be sent.

## 4. Deploy on Vercel
Import the GitHub repository, add the variables, deploy. `vercel.json` schedules a daily job (`/api/cron/daily`) that publishes scheduled articles, marks past webinars completed and continues newsletter sends. Note: the Vercel Hobby plan is for non-commercial use; move to Pro if the initiative takes sponsorship money through the site.

Admin → System → Load starter content (`/admin/seed`) displays the seed-script sequence for reference; SQL must still be executed in the Supabase SQL Editor.

## 5. Running the site
- **Articles:** Admin → Articles. Editors can submit for review; users with the publish permission can publish or schedule. Reading time is calculated automatically. Add tags, related articles and SEO fields.
- **Webinars:** Admin → Webinars. Leave the date empty until it is confirmed; the page then shows "Date to be announced". Add a YouTube/Vimeo link for the recording and it embeds automatically. Turn on "Allow registration on this website" or paste an external registration link.
- **Homepage, About, navigation, footer, contact, social links, SEO defaults:** Admin → Website settings, Navigation, Pages, SEO.
- **Sample content:** the three sample webinars and three illustrative stories are labelled. Replace them, or remove them in Admin → Website settings & account → Remove sample content.
- **Randall S. Pitts section:** Admin → Pages → About. Replace the placeholder with a biography he has approved.
- **Legal pages:** Admin → Pages (privacy, terms, editorial policy, accessibility). The starter text is a placeholder; have it reviewed.

## 6. Roles
Super Admin (everything), Editor (articles, review and publish, authors, stories, research, webinars, resources, contributors), Content Manager (create and edit content, no publish or user management), Contributor (write and submit articles only). Admin → Users & roles lets you change permissions per role, create custom roles and assign roles by email (the person must have signed up first).

## 7. Contributor workflow
1. A person applies at `/contribute`.
2. In Admin → Forms & enquiries open the application and press **Approve as contributor**. If they already have an account they become a contributor immediately; otherwise they are activated automatically the first time they sign in with the same email.
3. They write at `/contributor` and submit for review. Editors see it under Admin → Articles → status "review", can leave a note, and publish.
4. Contributors can save drafts and edit their own articles until they are published.

## 8. Keeping everything free, and sustaining it
Core content has no paywall. Support comes from (all configurable in Admin → Sponsors & partners and Support options):
- **Sponsorship:** sponsors can be shown on the Support page and as a clearly labelled "Supported by (sponsor)" note on articles and webinars. Tick the placement per sponsor. Sponsors never control editorial content (the Editorial Policy page says so).
- **Institutional programmes:** schools, universities, NGOs and companies pay for facilitated programmes; participation for students stays free.
- **Voluntary contributions:** enter real bank or UPI details in Website settings. Payment gateways are not built in yet; add Razorpay later if wanted.
- **Partnerships and volunteering:** via the enquiry form.
Only publish sponsor names and figures you have agreement for.

## 9. Newsletter
Consent is required; with SMTP configured, double opt-in is used. Every email has an unsubscribe link. Export subscribers from Admin → Newsletter subscribers → Download CSV. Compose and send in Admin → Newsletter campaigns.

## 10. Security notes
Row level security is on for every table; public visitors can only read published content and submit forms. The service-role key is used only on the server. Admin pages require a signed-in user with the right permission, every change is written to the activity log, forms have a honeypot and rate limiting, and HTML is sanitised before it is stored or shown. Change the admin password after first login and use a long unique one.

## 11. Backup and recovery
Supabase → Database → Backups (daily on paid plans). On the free plan, export regularly: run a `pg_dump` or use Admin CSV exports. Keep a copy of the SQL files and your environment variables somewhere safe.

## 12. Troubleshooting
- "This account is not an admin" on login: the page prints the reason code. `role_query_failed` or error 42501 means `06_grants.sql` has not been run or `SUPABASE_SERVICE_ROLE_KEY` is wrong; `no_role` means `05_admin_user_PRIVATE.sql` has not been run.
- Images or PDFs not uploading: files must be under 4 MB (JPG, PNG, WebP, GIF; PDF for documents).
- Newsletter not sending: check the SMTP variables.
