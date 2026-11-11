# Neon setup for the recruitment SaaS

This setup is intentionally separate from the public OptiFlow website's existing Supabase backend. Do not change the existing Supabase environment variables, login routes, or admin proxy.

## 1. Open the Neon project

Open the Neon Console and select project `crimson-truth-34671824` in organization `org-noisy-lab-32122549`.

## 2. Enable Managed Neon Auth

1. Select the intended Neon branch.
2. Open the **Auth** section and enable Managed Neon Auth / Better Auth.
3. Enable email/password sign-in.
4. Confirm the branch's trusted application origins. Localhost is normally pre-approved; add the deployed recruitment application origin before production use.
5. Keep development and production branch Auth URLs separate.

Neon Auth creates and manages its own `neon_auth` schema. Do not edit its tables directly.

## 3. Pull the Neon environment variables

From the project root, run:

```bash
neon env pull --service postgres --service auth
```

This should populate `DATABASE_URL` and `NEON_AUTH_BASE_URL` in your local environment file. The pooled PostgreSQL connection string is appropriate for application runtime use. Use a direct connection only for migration tooling that requires it.

Generate the cookie secret locally:

```bash
openssl rand -base64 32
```

Add the generated value as `NEON_AUTH_COOKIE_SECRET`. Do not commit `.env.local`, paste credentials into chat, or expose these values with a `NEXT_PUBLIC_` prefix.

## 4. Configure Netlify

In the Netlify site that hosts the OptiFlow Next.js application, add these recruitment-only environment variables:

- `DATABASE_URL`
- `NEON_AUTH_BASE_URL`
- `NEON_AUTH_COOKIE_SECRET`

Set development/deploy-preview values separately from production values. Do not change or delete the existing Supabase variables used by the public website.

## 5. Migration safety

The recruitment migration is in `neon/migrations/001_recruitment_foundation.sql`. It is a standalone Neon PostgreSQL migration and must be run against the Neon database, never against the website's Supabase project.

Before applying it, confirm Managed Neon Auth is enabled on the target Neon branch and that its `auth.user_id()` function and `authenticated` database role are available. Apply it to a development branch first, then verify workspace creation and tenant isolation. Do not apply it to production yet.

The SQL migration's function delimiters must be valid PostgreSQL dollar-quoting. Review the migration and test it on a disposable/development branch before production use.
