# Registration → Google Sheets

Destination: https://docs.google.com/spreadsheets/d/1czkQD3vo7NQ0vi2xU8RCCjXYBsYJkM_n5FbFotml61k/edit

The **Google Sheets** admin tab shows pending/failed rows, the last successful write,
and buttons to queue all registrations or retry failed writes. Updates run when
admins are offline. This is a one-way export; Supabase is the source of truth.

## Activate once

1. Apply `supabase/migrations/202611120001_registration_sheet_sync.sql` in the
   Supabase SQL Editor. It creates the durable queue, seeds existing registrations,
   and installs an insert/update trigger. Deploy the frontend with the new admin tab.
2. In the destination Sheet, open **Extensions → Apps Script**. Use the contents of
   `google-apps-script/RegistrationSync.gs` as the script. The old `Code.gs` is a
   legacy public form receiver and is not needed for this integration.
3. In Apps Script **Project Settings → Script Properties**, add:
   - `SUPABASE_URL`: your project's `https://<ref>.supabase.co` URL.
   - `SUPABASE_SECRET_KEY`: a dedicated Supabase backend secret API key
     (`sb_secret_…`). A legacy service-role key is also supported.
   Never place this key in a `VITE_` variable, a sheet cell, source control, or chat.
   Script editors can access properties, so restrict spreadsheet and script edit
   access to trusted administrators before installing credentials.
4. Run `installRegistrationSync` and authorize Google Sheets, external requests,
   and trigger access. This creates/validates the **Registrations** tab and sets a
   minute-based trigger. Re-running replaces only this worker's own trigger.
   No public web-app deployment is required.
5. Open **Admin → Google Sheets**. Confirm the first successful write, zero pending
   records, and one spreadsheet row per registration ID. Approve/check in a test
   registration and confirm its existing row changes on the next scheduled run.

## Columns and ownership

28 columns: registration ID, reference, registration time, name, gender, NIC,
AIESEC email, personal email, phone, university/other university, study year,
semester, faculty/other faculty, programme, rank, function/other function,
warrior persona, aspiration, motivation, final note, CV partner consent, status,
check-in time, updated time, and last synced time. Dates use ISO 8601 text.
Wellbeing/emergency details, auth user IDs, submission keys, and CV/receipt files
are not exported. Keep the ID column and headers intact. Sorting entire rows is
supported; sorting just one column will break row associations. Sheet edits may
be overwritten on the next registration update or full requeue.

## Reliability and troubleshooting

Each minute, the script processes up to 100 due records under a script lock. IDs
identify rows; a failed acknowledgement causes an update to the same row on retry.
Version-checked acknowledgements leave newer edits queued. Sheet write failures
retry after five minutes; admin retry resets this delay. Supabase/API failures or
script-wide failures leave records pending; inspect Apps Script **Executions** and
Google's trigger failure notifications. The last successful write is not a worker
heartbeat; an idle queue needs no writes. Google trigger times are approximate and
quotas apply. Deleted database registrations are not removed from Sheets; deletion
and privacy requests require deleting their exported row too.

Official references:
- https://developers.google.com/apps-script/guides/triggers/installable
- https://supabase.com/docs/guides/api/api-keys
