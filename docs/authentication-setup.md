# Catalyst authentication

Registration uses a Supabase anonymous session and does not ask for an email code. Checkout verifies the personal email and links the registration to that verified account. There is no separate merchandise account. See [registration setup](registration-without-verification.md).

The registration RPC accepts only the caller’s own anonymous Auth identity and validates the personal email format. It cannot be called by the unauthenticated browser role. The original authenticated registration RPC continues to require a verified email. The order RPC resolves the registration from auth.uid(); callers cannot choose another delegate's registration ID.

Admin sign-in uses signInWithPassword with the supplied email and password. It does not send OTP codes or offer public admin signup. A pre-existing Auth user must be provisioned with the admin role through a trusted database operation. The single-active-admin constraint prevents multiple active administrators. Public signups cannot assign this role. All admin RPCs check the authenticated membership in the database.

Supabase configuration still required:

1. Apply the project migrations.
2. Enable email authentication and configure email delivery.
3. In the Magic Link template, include {{ .Token }} so the email contains a code. The app verifies it with verifyOtp(type:'email'). Configure the confirmation email consistently for new delegate identities.
4. Provision the chosen administrator's Auth identity with a password (or set a password for their existing identity), then insert their user ID into public.admin_memberships with role='admin' and is_active=true. Do not put a service role key in the browser.
5. Enable anonymous sign-ins and test registration without a code, optional CV upload, checkout email verification and registration linking, linked pre-order submission, non-admin access denial and admin email/password sign-in.

Documentation: https://supabase.com/docs/guides/auth/auth-email-passwordless and https://supabase.com/docs/reference/javascript/auth-signinwithotp

The public catalogue is readable while the shop is open. Browsing and registration do not require email verification; checkout does.

Existing projects also need the UI/receipt upgrade described in `docs/supabase-upgrade-005.md`. Admin builds without Supabase configuration are blocked rather than entering preview mode.
