# CBCA Supabase Admin Setup

## 1. Create the database
Open Supabase Dashboard → **SQL Editor** → **New query**. Paste the complete contents of `supabase/schema.sql`, then click **Run**.

## 2. Create the first administrator
Open the live admin page:

- GitHub Pages: `https://rakibnuist.github.io/CBCA/admin/`

Enter `cbcabd2026@gmail.com`, choose a password of at least 8 characters, and click **Create first account**. If email confirmation is enabled, confirm it from Gmail, then sign in. The SQL allowlist automatically gives this email the `super_admin` role.

## 3. Authentication configuration
No additional Redirect URLs are required for this initial deployment. The admin code does not send a custom redirect URL during signup or password reset. Supabase will use the project's default Site URL for authentication emails. A production Site URL and custom-domain redirects can be configured later when `cbcabd.org` is ready.

## 4. Add more administrators
Sign in as Super Admin → Administrators → Add record. Add the person's email and role **before** they create an account. Available roles:
- `content_editor` — prepare and edit public content
- `reviewer` — review and publish content
- `complaint_officer` — access complaint cases
- `super_admin` — complete access

## 5. Publishing rule
Content editors can save `draft` or `review`. Only Reviewer and Super Admin accounts can set `publication_status` to `published`. Public pages can read published records only.

## 6. Security
The publishable key is intentionally used in browser code and is protected by Row Level Security. Never add a Supabase secret key, service-role key, database password or JWT secret to GitHub.
