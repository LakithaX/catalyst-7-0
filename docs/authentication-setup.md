# Catalyst authentication

Delegates use passwordless email verification. Registration and pre-orders share one Supabase Auth identity and one registration record. There is no separate merchandise account.

The registration RPC checks that the verified identity email matches one of the submitted registration email addresses. The order RPC resolves the registration from auth.uid(); callers cannot choose another delegate's registration ID.

Admin sign-in uses signInWithPassword with the supplied email and password. It does not send OTP codes or offer public admin signup. A pre-existing Auth user must be provisioned with the admin role through a trusted database operation. The single-active-admin constraint prevents multiple active administrators. Public signups cannot assign this role. All admin RPCs check the authenticated membership in the database.

Supabase configuration still required:

1. Apply the project migrations.
2. Enable email authentication and configure email delivery.
3. In the Magic Link template, include {{ .Token }} so the email contains a code. The app verifies it with verifyOtp(type:'email'). Configure the confirmation email consistently for new delegate identities.
4. Provision the chosen administrator's Auth identity with a password (or set a password for their existing identity), then insert their user ID into public.admin_memberships with role='admin' and is_active=true. Do not put a service role key in the browser.
5. Test new delegate verification, registration, returning sign-in, linked pre-order submission, non-admin access denial and admin email/password sign-in.

Documentation: https://supabase.com/docs/guides/auth/auth-email-passwordless and https://supabase.com/docs/reference/javascript/auth-signinwithotp

The public catalogue is readable while the shop is open. Browsing does not require sign-in; registration and checkout do.
