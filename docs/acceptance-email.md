Interest acknowledgement email
===============================

Subject: Your spark has reached us | Catalyst 7.0

Template: `supabase/templates/registration-accepted.html`

The design uses a six-second looping sakura GIF around the actual `public/assets/catalyst_7_logo.png` logo on an ivory background, ivory paper palette, vermilion accents, serif headline and AIESEC logos. Text and confirmation remain readable when images are blocked. Layout uses presentation tables, inline styles, standard font fallbacks and a mobile media query. Real inbox rendering still needs verification before sending.

Personalization fields: `{{ full_name }}` and `{{ reference }}`. The backend HTML-escapes both values before substituting them. These are application placeholders, not Supabase Auth template variables. This is a transactional registration email; do not replace the verification-code Auth template with it.

Links and image URLs use the production origin already present in the verification email. Verify that origin when wiring delivery. The preview has demonstration values only and uses relative local artwork paths.

Plain-text alternative:

    Your spark has reached us | Catalyst 7.0

    Hey {{ full_name }},

    We’ve received your interest in Catalyst 7.0. Thank you for taking the
    first step towards a chapter of bold ideas, new connections, and discovery.

    Every journey begins with a spark of curiosity. Our team will review your
    details and share the next steps. Until then, keep that spark alive.

    Your reference: {{ reference }}
    Keep this reference handy when contacting the team.

    Explore Catalyst: https://catalyst-7-0.vercel.app
    Contact the team: https://catalyst-7-0.vercel.app/#contact

    Until the next chapter,
    The Catalyst 7.0 Team
    AIESEC in SLIIT

Sending setup
-------------

Submission-triggered sending is implemented through `POST /api/registration-acceptance` on Vercel (also available under `npm run dev`). It uses the same Gmail account/app password as Supabase SMTP, configured separately as private server settings. Supabase Auth SMTP settings are not automatically shared with this API. No live email has been sent during implementation.

1. If the original acceptance-email migration is already applied, run only `supabase/migrations/202611130002_interest_acknowledgement.sql` in the existing Supabase project’s SQL Editor. Otherwise apply `202611130001_acceptance_emails.sql` followed by `202611130002_interest_acknowledgement.sql`, after the earlier viewer-access migration. New databases can use the updated `supabase/setup.sql` instead. Do not rerun setup on an existing database.
2. In Vercel → Project → Settings → Environment Variables, configure the following for the intended environment:

   | Variable | Value |
   | --- | --- |
   | `SUPABASE_SERVICE_ROLE_KEY` | The project's private service-role key, available in Supabase API settings |
   | `GMAIL_USER` | `ais.catalyst.7.0@gmail.com` |
   | `GMAIL_APP_PASSWORD` | That account's Google app password, not its regular password |
   | `EMAIL_SITE_URL` | The public HTTPS origin hosting the website and GIF, e.g. `https://catalyst-7-0.vercel.app` |

   The API uses `SUPABASE_URL`, falling back to the existing `VITE_SUPABASE_URL`. Only the project URL/publishable key belong in `VITE_` settings. Keep the service-role key and Gmail credentials private. For local development, use the ignored `.env.local` file and restart Vite.
3. Deploy the code, HTML template and GIF together. Vercel explicitly includes the email template in the function bundle. The function has a 60-second limit.
4. Verify the public GIF URL loads, then submit a new controlled registration whose email address you own. The acknowledgement should send while the registration is still pending. Check its inbox, Gmail Sent folder and panel status. Repeat approval/check-in must not create a second email. This is the final live validation; the automated tests use fake SMTP and a local database.

The caller’s token is verified with Supabase Auth. The owner of a saved pending/approved registration can request only their own acknowledgement, including from the anonymous Auth session used during registration. An active admin can retry eligible jobs. A viewer cannot send for other delegates. The browser supplies only a registration ID; recipient, name and reference are snapshotted by the database on insertion, so callers cannot choose arbitrary recipients or content.

Submitting a registration creates one durable email job in the same database transaction. After a successful submission, the form immediately requests the acknowledgement without waiting for SMTP or blocking the success screen. A closed tab or unavailable backend can leave a pending job, which the admin can send later. There is no unattended scheduled worker. Approve and check-in do not request or queue another email. Deploy the new migration before the new frontend. Existing records can now be queued using migration `202611130003_existing_registration_emails.sql`; already sent emails are not resent. The original queue table, API route, filenames and message IDs retain their acceptance-related technical names for compatibility with the already-applied migration; the email content and panel labels now describe an interest acknowledgement.

Statuses and recovery
---------------------

- `pending`: registration received and queued, awaiting a send request. Admins can use **Send acknowledgement** for pending or approved registrations.
- `sending`: exclusively claimed by a request. Refresh after a moment. If the function was interrupted, reconcile against Gmail Sent before resetting it.
- `sent`: Gmail SMTP accepted the message. This is not a guarantee of inbox delivery; no bounce/open tracking is implemented.
- `failed`: SMTP definitively rejected the send or failed before message submission. Use **Retry email**.
- `uncertain`: the connection ended at an ambiguous point or the result could not be persisted. Check Gmail Sent and server function logs before any further send.

SMTP has no exactly-once delivery guarantee. A database claim prevents concurrent requests and already-sent jobs from sending again. The backend deliberately does not auto-expire claims or retry uncertain submissions, because Gmail may already have accepted them. Message IDs are deterministic per registration to aid reconciliation, but Gmail deduplication is not assumed.

For a stuck `sending`/`uncertain` job, a trusted operator must reconcile the deterministic message ID (`catalyst-acceptance-REGISTRATION_UUID@SENDER_DOMAIN`) in Gmail. Only after confirming no submission occurred should they reset that specific row to `failed` in the Supabase SQL Editor to enable retry. If it was sent, record `status='sent'`, its actual `sent_at` and `message_id` instead. Never reset all jobs or automatically retry ambiguous sends.

Validation: `npm run test:acceptance-email`, `npm run test:database`, `node scripts/test-database.mjs --setup`, `npm run lint`, and `npm run build`.

References: [Supabase SMTP configuration](https://supabase.com/docs/guides/auth/auth-smtp), [Nodemailer Gmail setup](https://nodemailer.com/usage/using-gmail/).

Animation asset: `public/assets/brand/catalyst-interest-logo-sakura.gif` (600 × 315, 72 frames at 12 fps, approximately 178 KiB). The first frame contains the complete artwork for clients that do not animate GIFs. All acknowledgement information remains live text outside the animation. Some email apps or user preferences can disable animation or remote images.

Regenerate with `node scripts/generate-acceptance-banner.mjs` (requires FFmpeg and ImageMagick). Publish the asset together with the template before enabling delivery.

Existing registrations
----------------------

After the submission-triggered migration, apply `supabase/migrations/202611130003_existing_registration_emails.sql`. It queues existing pending and approved registrations that have no email job. It does not send mail while the migration runs, reset failed/in-flight/uncertain jobs, or resend delivered emails. The migration is safe to rerun.

Deploy the updated admin panel and configure the private Vercel email settings. In **Admin → Registrations**, use **Send pending acknowledgements**. The count includes eligible older records and any newer pending jobs. It covers all records, regardless of the directory's loaded pages, search or filters. The sender processes one email at a time, shows progress, and can stop after the current email. Keep the tab open; closing or changing tabs stops the remaining batch. Opening another batch cannot resend claimed or sent jobs.

If backend configuration, authentication or a network request fails, the batch stops. The current email may need status reconciliation, and remaining unclaimed jobs stay pending. Individual definitive SMTP failures are reported and remain available for **Retry email** in the directory. The bulk button sends pending jobs; it does not automatically retry failed or uncertain jobs. Gmail SMTP acceptance is shown as sent; inbox delivery still needs a controlled live test.
