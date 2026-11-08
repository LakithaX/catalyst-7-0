# Upgrade an existing Catalyst Supabase project

Use this procedure if `setup.sql` and `seed.sql` were already run before the UI integration fix.

1. Back up the project using your usual Supabase backup process.
2. In SQL Editor, run **only** `supabase/migrations/202611080005_ui_integration.sql`, once. Do not rerun the entire initial setup. The migration adds bank instructions, private receipt storage and receipt metadata; updates answer normalization and aggregate counts; and restricts new pre-orders to the receipt-aware RPC. Existing accounts, registrations and orders are preserved.
3. Configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the hosting project's build environment, then rebuild/deploy the fixed branch. They are Vite build-time variables. Do not use a secret/service-role key. Local values stay in git-ignored `.env.local`.
4. Keep Email enabled and Confirm email enabled. Allow delegate signups. Set the Confirm signup and Magic Link templates to include `{{ .Token }}`. Configure custom SMTP for delegate email delivery. Admin sign-in uses an existing email/password account; delegate verification uses email codes. A saved session remains signed in until sign-out/expiry.
5. Keep the existing active `admin_memberships` entry. If access fails, inspect that the correct Auth user ID has role `admin` and `is_active=true`. Do not create an additional active administrator.
6. Sign in at `/admin`. Open Merchandise and save the event's approved bank/account details. These are intentionally visible at checkout. No placeholder account is provided and payment checkout cannot proceed while details are missing.
7. Keep Coming soon ON until setup is tested. Turn it OFF when ready to accept pre-orders. Private storage buckets are created by SQL; do not make them public.

## Checks before accepting submissions

- In a private browser, `/admin` requests email/password. Missing Supabase configuration shows a setup error, never a dashboard. Existing signed-in admins need not re-enter a password on every visit.
- Verify an email at registration, choose Yes for allergies/safety and supply details, upload a CV, then submit. A real `CAT7-DEL-...` reference should appear. In admin, open the delegate and verify wellbeing details and the private CV link.
- Sign in with the same identity at checkout. Name/contact/reference must come from the linked registration. Prices come from the database. Upload a receipt and submit; only a committed pre-order may clear the cart. The bank transfer reference starts `CAT7-PAY-`; the saved order reference starts `CAT7-ORDER-`.
- Open the delegate/order in admin, inspect its receipt, verify bank payment and progress it to ready/collected. Rejecting a receipt requires a reason. Payment verification is manual; no automated confirmation email is sent by this change.
- Toggle Coming soon ON. Collection, product details and cart must switch to the paused screen. Open pages refresh status at most every 10 seconds; database order rejection applies immediately after the toggle commits.
- A second delegate must not see the first delegate's private records/files. Receipt/CV links expire after two minutes.

## Automated validation

Run `npm run test:database`, `npm run test:admin-guard`, `npx tsc --noEmit` and `npm run build`. Database tests use temporary in-memory PostgreSQL (PGlite), mock only Supabase's Auth/Storage platform tables, and run the actual application SQL migrations/RLS/functions. They do not contact the live project or send emails. Browser testing and real email delivery must still be checked in the configured environment.

References: https://supabase.com/docs/guides/auth/auth-email-passwordless and https://supabase.com/docs/guides/auth/auth-smtp
