# CBCA Website

Static website for **China Bangladesh Consultancy Alliance (CBCA)**, built to the site architecture defined in the *CBCA Master Handbook — Founding Phase* (Section 19.1, Table 31).

Hostable on GitHub Pages, cPanel, Netlify, Cloudflare Pages or any standard web server. Dynamic records are served from Supabase and protected by Row Level Security.

---

## Site architecture

| Page | Purpose |
|---|---|
| `index.html` | Home — positioning, announcements, current notices, verification entry points |
| `about.html` | Motivation, vision, mission, values, non-service boundary |
| `governance.html` | Expert Committee, decision authority, delegated teams, meeting rules |
| `members.html` | Verified member directory with search, status filters and logos |
| `join.html` | Membership application form (writes to Supabase) |
| `scholarships.html` | Verified scholarship records with sources and verification dates |
| `policy-database.html` | University policy transparency system, source hierarchy, publication protocol |
| `guidelines.html` | Self-service application guides and document explanations |
| `corrections.html` | Public correction register, severity levels, right of reply |
| `protection.html` | Student complaint desk, review procedure, outcomes, Bangla notice |
| `events.html` | Seminars, pre-departure programs, event neutrality rules |
| `news.html` | Official announcements, editorial standard, press contact |
| `contact.html` | All official mailboxes (Handbook 17.2) |
| `policies.html` | Code of conduct, trust mark rules, discipline, funding controls |
| `privacy.html` | Data collection, retention, security, general disclaimer |
| `404.html` | Not-found page |
| `committee.html` | Redirects to `governance.html` |

`sitemap.xml` and `robots.txt` are included; `robots.txt` disallows `/admin/`.

---

## Configuration

### Emails — `assets/js/config.js`
All eight official mailboxes from Handbook Section 17.2 are defined here. Every address must be **activated, MFA-protected and CBCA-controlled** before public reliance:

`info@` · `secretariat@` · `membership@` · `complaints@` · `verification@` · `media@` · `events@` · `it@`

The mandatory standard disclaimer (10.5) and member-directory disclaimer (7.4) also live here and are injected wherever `data-disclaimer="standard"` or `data-disclaimer="member"` appears in the markup.

### Supabase — `assets/js/supabase-config.js`
Contains only the project URL and the **publishable** key. Never add a service-role key, database password or JWT secret to this repository.

---

## Member directory

Records come from the Supabase `members` table and appear publicly only when `publication_status = 'published'` **and** `member_status = 'active'`.

- **Logos** — set `logo_url` to a direct image link (PNG/JPG/SVG, square works best). If empty or broken, the card falls back to the consultancy's initials.
- **Founding badge** — `member_type = 'founding'` renders the ★ Founding Member badge, separating the 11 founding consultancies from later members.
- **Status tags** — follow Handbook 7.4: Founding, Verified, Provisional, Suspended, Expired, Former Member. Suspended, expired and former members must not display a current trust mark.
- **Committee role is not shown** in the public directory; committee composition lives on `governance.html`.

---

## Membership applications

`join.html` writes directly to the Supabase `membership_applications` table (anonymous insert is allowed by RLS only when `consent = true`). Submissions appear in the admin dashboard under **Membership applications**.

---

## Announcements

Published rows in the `announcements` table appear on the homepage (latest three) and in full on `news.html`. If nothing is published, the homepage section hides itself automatically.

---

## Admin dashboard

Run `supabase/schema.sql` once, then follow `supabase/SETUP.md`. The dashboard at `/admin/` uses Supabase email/password authentication with a single allowlisted administrator.

Publishing rule: content editors save `draft` or `review`; only Reviewer and Super Admin accounts may set `publication_status` to `published`.

---

## Before launch

- [ ] Activate and test every mailbox in `config.js`; enable MFA on each.
- [ ] Complete the founding consultancy register — address, contact, social media and verification date for all 11 records.
- [ ] Upload member logos via Admin → Members → Logo image URL.
- [ ] Publish only scholarship records that carry an official source URL and verification date.
- [ ] Appoint the Membership Review & Audit Team, Research Unit, Verification Desk and Complaint Desk rosters.
- [ ] Confirm organizational legal identity, registration wording and privacy policy with a qualified Bangladesh professional.
- [ ] Do not claim Embassy, CSC or university authorization without written evidence.
