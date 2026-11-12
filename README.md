# Catalyst 7.0

Catalyst 7.0 is the AIESEC in SLIIT event site. It includes delegate registration, a pre-order merchandise shop, and a private admin control room backed by Supabase.

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project for database, authentication, and private file storage

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Set the Supabase values in `.env.local` before using registration or admin features:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

These are public client configuration values. Never put a Supabase `service_role` or secret key in a `VITE_` variable or commit credentials to the repository. Restart the dev server after changing environment variables.

## Supabase setup

### New Supabase project

For a new, empty database, run `supabase/setup.sql` once in the Supabase SQL Editor. It contains the schema and migrations in order. Run `supabase/seed.sql` once to add the initial merchandise catalogue.

### Existing Catalyst database

If you have already run the original setup and migrations through **005**, run only:

```text
supabase/migrations/202611080007_shop_readiness.sql
```

Run it once in the Supabase SQL Editor. Do not rerun `setup.sql`, `seed.sql`, or migration 005 on an existing database. Migration 006 is not needed; migration 007 disables its unpaid-only order route if 006 was previously applied. The migration adds no duplicate users or registrations.

### Admin and authentication

The admin panel is at `/admin`. It requires a Supabase email/password account with an active `admin` or `viewer` membership; creating an Auth user alone does not grant panel access. One active admin has full access; multiple viewers can browse without changing records or settings. See [Admin and viewer access](docs/admin-permissions.md) for the upgrade and `eb@cat.com` provisioning steps.

Delegate registration and checkout use email verification codes. Configure Supabase Auth email delivery (including SMTP and the email templates) before inviting delegates. Admins sign in with email and password.

See [Authentication setup](docs/authentication-setup.md) for the Auth dashboard settings and [Backend schema plan](docs/backend-schema-plan.md) for the data model.

## Merchandise readiness and payment flow

Merchandise is sold as pre-orders; there is no stock limit. The shop starts paused behind a Coming soon screen. In **Admin → Merchandise**, the admin can manage products and enter the bank name, account holder, account number, and optional branch when those details are available. Saving bank details does not open the shop. Keep Coming soon enabled until the catalogue and payment instructions are ready, then turn it off explicitly.

Checkout links each order to the signed-in delegate, displays the saved bank instructions, and requires a payment receipt upload. An admin reviews the receipt and verifies or rejects payment in the control room. File buckets for CVs and receipts are private; access is controlled by Supabase policies.

See [Merchandise management](docs/merch-management.md) and [Shop readiness migration notes](docs/supabase-upgrade-005.md) for details.

## Deploy to Vercel

1. Import the GitHub repository into Vercel (or select the existing `catalyst-7-0` project).
2. In **Settings → Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for Production, Preview, and Development as needed.
3. Trigger a new deployment after adding or changing variables. Vite reads these values at build time.
4. Verify `/admin` sign-in, delegate registration, and the paused shop on the deployed site. Keep Coming soon enabled until bank details and the catalogue are ready.

Do not add a Supabase service-role/secret key to Vercel's frontend environment variables.

## Scripts

```bash
npm run dev                 # Start the Vite development server
npm run lint                # Run the TypeScript check
npm run build               # Build the production site
npm run preview             # Preview the production build locally
npm run test:database       # Run isolated PostgreSQL migration/RLS/RPC checks
npm run test:admin-guard    # Verify missing Supabase config cannot expose admin data
```

The database tests use a local in-memory PostgreSQL instance and do not contact the live Supabase project or send email.
