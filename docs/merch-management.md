# Merchandise management

The admin Merchandise section controls the database catalogue, publishing, variant prices, and the shop-wide Coming soon switch.

## Database setup

- Empty project: run `supabase/setup.sql` once, then `supabase/seed.sql`.
- Existing project: apply only unapplied migrations in filename order; the merchandise management migrations are `202611080003_merch_management.sql` and `202611080004_preorders.sql`. Run `supabase/seed.sql` to import the existing code catalogue without overwriting existing product IDs or SKUs.
- Seed prices/descriptions come from `src/data/merchProducts.ts`. Confirm commercial details before opening sales. Orders are pre-orders and do not require available stock.

## Behavior

- Coming soon replaces the public collection, product detail pages and cart with a dedicated message. Public read policies also hide catalogue records while paused. A database trigger rejects new orders, including requests outside the UI. Existing orders are preserved.
- Hiding a product removes it from the public catalogue and the order function rejects it.
- New products have an image URL, category, edition label and description. Sizes are comma-separated; blank means one size. The initial price applies to each size and is editable per variant afterward.
- Existing products can be edited without rewriting order item snapshots. There are no stock fields in the admin UI. Legacy database stock fields are retained for compatibility; new pre-orders do not reserve or consume stock.
- The public catalogue refreshes on focus and every 10 seconds. Checkout validates prices, registration identity and shop status in the database.
- Only the active administrator can mutate catalogue/settings through the provided RPCs. Clients have read-only table grants.

## Deployment verification

Build and TypeScript checks can run locally. Live integration checks require the schema and an authorized admin session. Verify create/edit/publish/hide, per-size prices, paused-checkout rejection, and reopening the collection. Unauthorized RPC calls should be rejected. Do not use delegate personal data for these checks.
