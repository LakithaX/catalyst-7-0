# Catalyst registration, orders, and administration

Status: proposed logical schema, based on the current registration form and merch cart. Backend selection is pending; this is not an applied migration or a working admin panel.

## Registration data

`registrations`

- `id`: generated primary key; `reference`: unique, server-generated delegate reference.
- `submission_key`: unique retry key to prevent duplicate submissions.
- `full_name`, `gender`, `nic`, `aiesec_email`, `personal_email`, `phone`.
- `university`, `university_other`, `study_year`, `semester`, `faculty`, `faculty_other`.
- `programme`, `rank`, `function`, `function_other`.
- `warrior_persona`, `aspiration`, `motivation`, `final_note` (optional).
- `status`: pending, approved, rejected, cancelled. Defaults to pending.
- `checked_in_at`, `checked_in_by`: optional; record the responsible admin.
- `created_at`, `updated_at`.

`registration_wellbeing` (one row per registration, with registration ID as primary/foreign key)

- `food_preference`, `has_allergies`, `allergy_details`.
- `has_safety_needs`, `safety_details`.
- `emergency_contact_name`, `emergency_contact_phone`.
- Restricted to authorized registration staff; excluded from ordinary order views and exports.

`registration_files`

- `id`, `registration_id`, `storage_key`, `original_name`, `mime_type`, `size_bytes`, `created_at`.
- CVs use private storage, with authenticated, short-lived download links.
- Validate file content, allowed types, and size on the server. Store metadata here, not base64 file contents.

Preserve each existing form answer, including the separate `*-sp` free-text answers. Normalize phone numbers, emails, and NICs on submission. Duplicate policy needs a business decision before adding unique constraints to personal identifiers; retry keys are always unique.

## Merchandise and orders

`products`

- `id`: retain existing product IDs from `src/data/merchProducts.ts`.
- `name`, `variant_label`, `category`, `description`, `image_url`, `is_active`, timestamps.

`product_variants`

- `id`, `product_id`, unique `sku`, `size`, `color`.
- `price_minor`: nonnegative integer in LKR minor units; `currency`: LKR.
- `stock_on_hand`, `stock_reserved`: nonnegative integers, reserved cannot exceed on-hand.
- Unique combination of product and normalized size/color. One default variant for products without options.

`orders`

- `id`, unique server-generated `reference`, unique `submission_key`.
- `registration_id`: foreign key to the delegate registration for the initial delegate-only flow.
- `status`: reserved, ready_for_pickup, collected, cancelled.
- `payment_status`: unpaid, pending_verification, paid, refunded.
- `currency`, `subtotal_minor`, `total_minor`, `pickup_location`, timestamps.
- `collected_at`, `collected_by`, optional cancellation reason.

`order_items`

- `id`, `order_id`, `product_variant_id`, positive integer `quantity`.
- Snapshot `product_name`, `variant_label`, `size`, `sku`, `unit_price_minor`.
- Unique order/variant combination. Historical prices and labels survive catalog changes.

`payments`

- `id`, `order_id`, positive `amount_minor`, `currency`, `method`, optional external reference.
- `status`: pending, verified, rejected, refunded; `verified_by`, `verified_at`, timestamps.
- Optional private receipt storage key. No card details stored.

`inventory_movements`

- `id`, `product_variant_id`, optional `order_id`, movement type, quantity, reason, actor, timestamp.
- Track stock adjustments, reservations, reservation release, and collection.

Orders and reservations must be created atomically. The API loads prices and availability from the database, reserves inventory conditionally, writes order/items, and commits together. Cancellation releases reserved stock once; collection reduces both on-hand and reserved stock once. Repeated requests return the original order using the retry key.

Do not accept a badge name alone as proof of delegate identity. Require a verified email session or another explicit verification mechanism. Return an order reference only after a successful database commit; retain the cart on failure.

## Administration

`admin_memberships`

- `auth_user_id`: identity-provider user ID, primary key.
- `role`: owner, registration_manager, merch_manager, viewer.
- `is_active`, `created_at`, `created_by`.
- Provision initial owner through a trusted server-side process. Public signup cannot assign admin roles.

`audit_events`

- `id`, `actor_user_id`, entity type and ID, action, timestamp, request ID.
- Record status transitions and affected field names, without copying NICs, wellbeing answers, CV contents, or credentials into logs.
- Append-only access through trusted backend operations.

Admin panel scope:

1. Authenticated login and a dashboard with registration, order, collection, and payment totals.
2. Registrations: search, status filters, detail view, approve/reject, check-in, authorized CV downloads.
3. Orders: search, item details, payment verification, ready/collected/cancelled transitions.
4. Catalog: price and availability changes, per-size stock adjustments.
5. Role-scoped CSV exports and an audit history. Escape spreadsheet formulas in exports.

Enforce every permission in the API/database, including direct requests outside the UI. Merch managers cannot read NICs, CVs, or wellbeing details. Viewers see aggregate data by default. Admin list APIs use pagination and indexes on references, timestamps, statuses, registration email, and foreign keys.

## Implementation sequence

1. Choose the backend and authentication provider; translate this model into migrations and access policies.
2. Seed the existing merch catalog, with confirmed prices and stock quantities.
3. Implement validated registration submission and private file uploads, with retry handling.
4. Implement verified delegate ordering, transactional stock reservation, and payment recording.
5. Build `/admin` against authenticated APIs and enforce role-specific actions.
6. Verify authorization failures, duplicate submission handling, concurrent reservations, cancellation/collection idempotency, and failed-request cart retention.

Business assumptions to confirm before rollout: delegate-only orders, manual payment verification versus a payment gateway, initial stock, registration approval policy, and retention periods for personal information and uploaded files.
