# Supabase preview migration troubleshooting

## `relation "admin_memberships" already exists`

The initial migration, `202611070001_catalyst.sql`, creates
`public.admin_memberships` as part of the base schema. This error means the
preview database already contains that table, but the preview is trying to
apply the base migration as if the schema were empty. The schema and the
migration history are out of sync.

For a disposable preview database, recreate/reset the preview database so it
starts empty, then let Supabase apply the migrations in filename order. This
removes preview data, so do this only when that database is disposable.

For a preview database whose data must be kept, first compare its schema and
migration history with the checked-in migrations. Reconcile the migration
history so the base migration is recognized as already applied, then apply
only migrations that are genuinely missing. Do not rerun `supabase/setup.sql`:
it is for an empty project only. Do not mark the base migration as applied
until confirming that the rest of its schema and policies are present.

Making only the `admin_memberships` creation conditional would not solve this
state: the base migration creates many related tables, functions, and policies,
and continuing against a partially existing schema can leave the preview
incomplete.
