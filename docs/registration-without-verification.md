# Registration without email verification

The registration page creates a Supabase anonymous session, saves the validated
registration under that session, and sends no email. It does not need a Vercel
server key or server endpoint. At checkout the delegate verifies the personal
email with an OTP; a database function then links the existing registration to
the verified account.

## Existing Supabase project

1. In Supabase **Authentication → Sign In / Providers → Anonymous Sign-Ins**,
   enable anonymous sign-ins. Add CAPTCHA protection for anonymous sign-ins to
   reduce automated account creation.
2. Apply `202611090003_anonymous_registration.sql` once in SQL Editor. It depends
   on `202611090002_registration_without_verification.sql`, which must already
   have been applied. This final migration locks down the earlier helper and
   enables the safe browser entry point. Don’t rerun `setup.sql` on an existing
   database.
3. Deploy the frontend. No additional Vercel environment variable is needed.
4. Test a registration without an email code, then verify the same personal
   email at checkout. The existing registration should appear under the verified
   account and remain visible to the admin.

## Local development

The existing `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are enough.
The anonymous Auth setting must be enabled in the connected Supabase project.

A registration remains tied to its anonymous session until checkout verifies the
personal email. If a delegate clears browser data or changes device before
verifying, they lose access to that anonymous session and may need admin help.
An email address is not proven to belong to someone until checkout verification.
