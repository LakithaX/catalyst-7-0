# Current rollout: unpaid pre-orders

Bank transfers and receipt collection are deferred. The app accepts unpaid pre-orders linked to the verified delegate registration. No bank details or receipt are required.

## Existing project

1. If migration 005 was already run, run **only** `supabase/migrations/202611080006_defer_payments.sql`, once, in Supabase SQL Editor. Do not rerun setup/seed or recreate accounts. Projects that have not run 005 must apply 005 followed by 006.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the hosting build environment and rebuild/deploy the updated frontend. Local values stay in git-ignored `.env.local`. Do not use a secret/service-role key.
3. Keep the existing active admin membership and email/password account. Admin builds without Supabase configuration are blocked. Saved admin sessions remain signed in until sign-out/expiry.
4. Configure delegate email-code delivery: enable Email and Confirm email, allow delegate signups, include `{{ .Token }}` in Confirm signup and Magic Link templates, and configure custom SMTP.
5. Keep Coming soon ON while testing, then turn it OFF to accept pre-orders. Bank instructions are not part of current setup.

Migration 005 adds answer normalization, global counts, private receipt infrastructure and payment instruction storage. Migration 006 adds the unpaid pre-order entry point. The payment infrastructure is retained for future use; it does not block current checkout. Existing users, registrations, orders, payments and receipts are preserved.

## Validation before accepting submissions

- A private browser must require admin email/password. Missing build settings must show a setup error, not a dashboard.
- Verify a delegate email, choose Yes for allergies/safety and provide details, upload a CV, then submit. A real delegate reference must appear. Check wellbeing and the private CV link in admin.
- Verify the same identity at checkout. The order must link to the existing registration and use database prices. Submit without bank details or receipt. Confirm its saved order reference in the admin's delegate history and payment status `unpaid`.
- Repeated requests with the same submission key must return the same order. Failed requests must preserve the cart.
- Coming soon hides the collection, product details and cart. Existing pages refresh status at most every ten seconds; database rejection applies immediately after the toggle commits.
- A delegate must not see another person's private records/files. Admin CV/receipt links expire after two minutes.

## Automated checks

Run `npm run test:database`, `npm run test:admin-guard`, `npx tsc --noEmit` and `npm run build`. PostgreSQL/PGlite tests execute the actual application migrations/RPCs/RLS with simulated Supabase Auth/Storage platform tables. They do not contact the live project or send email.

Real email delivery, visual mobile checks and authenticated end-to-end testing remain required on the configured environment. No automatic confirmation emails or refund workflow are implemented.

References: https://supabase.com/docs/guides/auth/auth-email-passwordless and https://supabase.com/docs/guides/auth/auth-smtp
