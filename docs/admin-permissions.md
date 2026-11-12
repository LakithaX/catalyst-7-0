# Admin and viewer access

The panel supports one active `admin` and any number of active `viewer` memberships.
The existing admin account and its permissions are preserved by the upgrade.

| Capability | Admin | Viewer |
| --- | --- | --- |
| Dashboard, registrations, wellbeing, emergency contacts | View | View |
| Private CVs, receipts, orders and payment history | View | View |
| Catalogue, hidden products, prices, bank details, partnerships | View | View |
| Google Sheets sync status | View | View |
| Approve/reject registrations and check in delegates | Change | No |
| Verify/reject receipts, record payments, change order status | Change | No |
| Create/edit products, publish/hide products, change prices | Change | No |
| Change bank details, shop status or partnerships | Change | No |
| Queue/retry Google Sheets syncs | Change | No |
| Grant/revoke memberships | Trusted SQL operation | No |

Viewer access includes the same private delegate information and files shown to
the administrator. Assign it only to people intended to have that visibility.

## Existing database upgrade

1. Apply any missing earlier migrations in filename order, including
   `202611120001_registration_sheet_sync.sql` if it is not applied yet.
2. Run **only** the new `supabase/migrations/202611120002_viewer_access.sql`
   migration in Supabase SQL Editor. This viewer migration can be rerun safely,
   including when its helper function or policies already exist. Do not rerun
   setup, seed or old migrations.
3. Deploy the updated frontend. An old frontend continues to permit the admin
   only; the new frontend recognizes both roles.
4. Create `eb@cat.com` as an email/password user in Supabase Authentication if
   it does not exist. Set its password using the trusted Auth administration flow.
   There is no public admin signup. Creating an Auth user alone grants no panel access.
5. Run `supabase/templates/provision-viewer.sql` in SQL Editor. It assigns the
   existing Auth identity the viewer role and refuses to demote an admin.
6. Sign in at `/admin` using the viewer's email and password. Confirm the Viewer
   label and view-only notice. Browse each section, a delegate and their files.
   Edit, approval, payment and sync controls are unavailable.

For another viewer, change the email in the provisioning template before running
it. To revoke access, set that user's `admin_memberships.is_active` to `false`
through trusted SQL. Database access is denied on subsequent requests, including
from an already signed-in browser. Previously loaded records or downloaded files
cannot be recalled by revoking access.

## Enforcement and checks

The single-admin unique index counts active `admin` memberships only. A role
constraint permits exactly `admin` or `viewer`. Clients have no membership write
grants, so they cannot promote themselves or invite another user.

`private.can_view_admin()` grants read policies and the two read-only summary
RPCs to active admins/viewers. Existing `private.has_role()` remains admin-only,
including historical checks for owner/manager roles. Every administrative mutation
continues to reject viewers at the database. Storage read policies permit only
files linked to registration/receipt records. Public and delegate access remain
governed by their existing policies.

Run `npm run test:database`, `node scripts/test-database.mjs --skip-006`,
`npm run test:admin-guard`, `npm run lint` and `npm run build`. The isolated
database checks cover multiple viewers, the admin limit, private reads, every
admin mutation RPC, direct writes, self-promotion, inactive viewers, ordinary
delegates and anonymous users. They do not contact the live project or send email.
