# Shop readiness and bank-transfer checkout

The admin prepares the bank details while the public shop stays behind the blurred Coming soon screen. Saving bank details does not open the shop: the admin explicitly switches Coming soon OFF when the entire setup is ready. Checkout uses the approved bank instructions, requires a private receipt, and links the pre-order to the verified delegate.

## Existing project

1. If migration 005 is already applied, run **only** `supabase/migrations/202611080007_shop_readiness.sql` once in Supabase SQL Editor. You do not need migration 006. If 006 was already applied, 007 safely disables its unpaid-only entry point. Do not rerun setup/seed or recreate accounts.
2. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in the hosting build environment and rebuild/deploy the updated frontend. Local values stay in git-ignored `.env.local`. Do not use a secret/service-role key.
3. Keep the existing active admin membership and email/password account. Admin builds without Supabase settings are blocked. Saved admin sessions remain signed in until sign-out/expiry.
4. Configure delegate email-code delivery: enable Email and Confirm email, allow delegate signups, include `{{ .Token }}` in Confirm signup and Magic Link templates, and configure custom SMTP.
5. In Admin > Merchandise, leave Coming soon ON. When approved bank details are available, enter the bank name, account holder, account number and optional branch, then save. These receiving-account details are intentionally public at checkout.
6. Once bank instructions and the catalogue are ready, switch Coming soon OFF. The database refuses to open the shop with incomplete bank details. Migration 007 automatically pauses a shop that lacks them.

Migration 005 adds answer normalization, global counts, private receipt infrastructure and bank instruction storage. Migration 007 enforces shop readiness. Existing users, registrations, orders, payments and receipts are preserved.

## Validation

- Private browsers must require admin email/password. Missing build settings must show a setup error, never a dashboard.
- Verify a delegate email, submit registration with a CV and wellbeing details, then confirm its reference/private file in admin.
- While Coming soon is ON, merchandise, product details and cart show the paused screen. Open pages refresh within ten seconds; database order rejection applies immediately after the toggle commits.
- Saving bank details must leave the shop paused. Opening is a separate explicit admin action.
- After opening, checkout must use the linked delegate and current database prices, show the saved bank instructions and require a PDF/JPEG/PNG/WebP receipt up to 5 MB. Only a committed order clears the cart.
- Open the delegate/order in admin, inspect its private receipt and verify/reject bank payment. Rejecting requires a reason. Collection requires verified payment.
- Repeated requests must not duplicate orders or payments. Other delegates cannot read private records or files. Private download links expire after two minutes.

Run `npm run test:database`, `node scripts/test-database.mjs --skip-006`, `npm run test:admin-guard`, `npx tsc --noEmit` and `npm run build`. PostgreSQL/PGlite tests execute the actual application migrations/RPCs/RLS with simulated Supabase Auth/Storage tables. They never contact live data or send email. The two database runs cover both upgrade histories, with and without 006.

Real email delivery, visual mobile checks and live authenticated end-to-end testing remain required. Payment verification is manual; no automatic confirmation emails or refund workflow are implemented.
