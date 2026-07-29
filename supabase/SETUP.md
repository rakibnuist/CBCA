# CBCA Supabase Admin Setup

## 1. Create the database
Open Supabase Dashboard → **SQL Editor** → **New query**. Paste the complete contents of `supabase/schema.sql`, then click **Run**.

## 2. Create the first administrator
There is no sign-up or password-reset flow on the admin page — accounts are created directly in Supabase.

Go to Supabase Dashboard → **Authentication** → **Users** → **Add user** → **Create new user**:
- Email: `admin@cbcabd.org`
- Password: (set the account password)
- Check **Auto Confirm User** so no confirmation email is required.

Then open the live admin page and sign in directly:

- GitHub Pages: `https://rakibnuist.github.io/CBCA/admin/`

The SQL allowlist (`supabase/schema.sql`) automatically gives `admin@cbcabd.org` the `super_admin` role the moment the account is created.

## 3. Authentication configuration
No Redirect URLs, custom email templates, or Site URL changes are required — the admin page only performs `signInWithPassword`, nothing else.

## 4. Add more administrators
1. In Supabase Dashboard → Authentication → Users → **Add user**, create the account for the new person (with **Auto Confirm User** checked).
2. Sign in to `/admin/` as Super Admin → Administrators → Add record, with their email and one of the roles below, **before or right after** their account is created — the allowlist entry is what grants access:
- `content_editor` — prepare and edit public content
- `reviewer` — review and publish content
- `complaint_officer` — access complaint cases
- `super_admin` — complete access

## 5. Publishing rule
Content editors can save `draft` or `review`. Only Reviewer and Super Admin accounts can set `publication_status` to `published`. Public pages can read published records only.

## 6. Security
The publishable key is intentionally used in browser code and is protected by Row Level Security. Never add a Supabase secret key, service-role key, database password or JWT secret to GitHub.
