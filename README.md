# CBCA Website — Staging Build

This is a fully static, responsive website for **China Bangladesh Consultancy Alliance (CBCA)**. It can be hosted on shared hosting, cPanel, GitHub Pages, Netlify, Cloudflare Pages or any standard web server.

## Important before launch

1. Confirm and activate all email addresses in `assets/js/config.js`.
2. Replace pending founding-consultancy data in `data/members.json` and the generated `members.html` page.
3. Approve the Membership Review & Audit Team and complaint/correction review workflow.
4. Add only verified university scholarship-policy records.
5. Confirm organizational legal identity, registration wording and privacy policy with a qualified Bangladesh professional.
6. Do not claim Embassy, CSC or university authorization without written evidence.

## Quick deployment

Upload the full contents of this folder to the web root for `cbcabd.org` (often `public_html`). Keep the folder structure unchanged. The home file is `index.html`.

## Editing emails

Edit only `assets/js/config.js`. Proposed addresses currently shown:
- info@cbcabd.org
- complaints@cbcabd.org
- membership@cbcabd.org
- corrections@cbcabd.org

## Adding members

Update `data/members.json`, then update or regenerate the member cards in `members.html`. Do not publish addresses, phone numbers, social accounts or status until verified.

## Adding university policies

Use `data/university-policies.json`. Each record should include:
- university and scholarship name
- official source URL/document
- publication and verification date
- tuition/accommodation/stipend coverage
- application fee, deposit, insurance and other costs
- renewal and cancellation conditions
- refund terms
- material warnings and uncertainty notes

## Forms

Forms use `mailto:` and do not store data on the website. Attachments must be added manually in the visitor's email application. For reliable production intake and case tracking, connect a secure backend or helpdesk later.


## Supabase admin dashboard

Version 2 adds a secure Supabase-backed `/admin/` route and dynamic public records. Run `supabase/schema.sql` once and follow `supabase/SETUP.md`.
