Merch checkout and order emails
==============================

Registration remains available without email verification. Merchandise checkout requires a code sent to the personal email recorded on an active (pending or approved) registration. An anonymous registration session is not sufficient. The database checks the verified Auth identity, matching personal email and active registration before accepting an order. Another device can link the existing anonymous registration after verifying that email; its registration ID and order history remain intact. Multiple active registrations sharing an email require team reconciliation rather than choosing a record arbitrarily.

Deployment
----------

Apply `supabase/migrations/202611140001_merch_order_emails.sql` after all earlier migrations, then deploy the updated frontend and API together. For a new database, `supabase/setup.sql` includes the same changes. Do not rerun setup on an existing database. The migration does not send emails or queue historical orders.

The new `POST /api/order-email` endpoint uses the same private server variables as registration acknowledgements: `SUPABASE_SERVICE_ROLE_KEY`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `EMAIL_SITE_URL`, plus `SUPABASE_URL` or `VITE_SUPABASE_URL`. Supabase Auth OTP delivery must also be configured separately. See `acceptance-email.md` for SMTP setup. The Gmail app password and service-role key must never use a `VITE_` prefix.

Order lifecycle
---------------

- Successful order/receipt submission atomically creates one `received` email job. The browser immediately requests delivery. The email says the order and receipt were received and payment is awaiting verification.
- In Admin → Orders, open the delegate/order and review the private receipt. **Verify bank transfer** records payment and atomically queues one `confirmed` job; the panel immediately requests delivery. **Reject receipt** does not queue confirmation. Payment verification of a legacy cash order also queues confirmation.
- The confirmed email says payment was verified and the order is confirmed. It explicitly does not promise readiness for collection; pickup arrangements are separate.
- Each email includes the order reference, snapshotted items/sizes/quantities, total and pickup location. Confirming a merchandise order does not approve the delegate registration.
- A received notice that is still pending or definitively failed when payment is verified becomes `skipped`, so an outdated awaiting-verification email is not sent after confirmation.

Recovery and limitations
------------------------

The delegate detail panel lists the two jobs and their statuses. Pending and definitively failed jobs have send/retry controls. Sent jobs have disabled grey buttons. Refresh status after an in-flight request. Viewers cannot send or verify payment. Database claims prevent concurrent sends and re-sending sent jobs. Repeated approval does not queue another confirmation.

There is no scheduled worker. Closing the submitting/admin tab, a backend outage or missing SMTP credentials can leave a durable pending job; send it from the order's admin details later. A `sending` or `uncertain` job requires checking Gmail Sent and function logs before a trusted operator changes its status. Never automatically retry an ambiguous SMTP result. Deterministic IDs are `catalyst-order-KIND-ORDER_UUID@SENDER_DOMAIN`. Gmail acceptance is not proof of inbox delivery; there is no bounce/open tracking.

Before rollout, use an inbox you control to verify: anonymous checkout shows the email code form; correct personal email links the delegate; submission saves an unpaid order and sends the awaiting-verification email; rejection sends no confirmation; approval sends exactly one confirmation; repeating approval and refresh does not resend. Test a different device too. No live email has been sent by the automated tests.

Validation: `npm run test:order-email`, `npm run test:acceptance-email`, `npm run test:database`, `node scripts/test-database.mjs --setup`, `npm run test:admin-guard`, `npm run lint`, `npm run build`.
