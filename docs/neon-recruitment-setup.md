# Neon setup for the recruitment SaaS

This setup is intentionally separate from the public OptiFlow website's existing Supabase backend.

## 1. Open the Neon project

Open the Neon Console and select project `crimson-truth-34671824` in organization `org-noisy-lab-32122549`.

## 2. Enable Neon Auth

1. Open the project's **Auth** section.
2. Enable the current managed Neon Auth / Better Auth integration for the development branch.
3. Configure the allowed application origin for the recruitment app's development URL and later its production route.
4. Enable email/password sign-in initially. Add social sign-in only when its OAuth credentials and callback URLs are configured.
5. Copy the branch-specific Auth URL. Auth URLs are branch-specific; do not reuse a development URL for production.

Neon Auth creates its own managed schema. Do not edit tables in `neon_auth` directly.

## 3. Copy the database connection string

1. In the Neon Console, select the intended branch, compute, database and role.
2. Click **Connect**.
3. Keep **Connection pooling** enabled for the application's runtime connection.
4. Copy the generated PostgreSQL connection string.
5. Put it in `DATABASE_URL` in local `.env.local` and the recruitment app's Netlify environment configuration.

Use a direct (non-pooled) connection only for migration tooling that requires it. Never commit either connection string or share its password in chat.

## 4. Configure local environment

Copy `.env.example` to `.env.local` and replace both placeholders with the actual values from Neon. Keep `.env.local` out of Git.

## 5. Configure Netlify

In the Netlify site that hosts the OptiFlow Next.js application, add the recruitment-only variables:

- `DATABASE_URL`
- `NEXT_PUBLIC_NEON_AUTH_URL`

Set them for the appropriate deploy contexts. Use the production Neon branch/Auth URL for production and a separate Neon development branch/Auth URL for deploy previews. Do not change or delete the existing Supabase variables used by the website.

Trigger a deploy only after the application code and database migration have been reviewed and tested.

## 6. Migration safety

The recruitment migration is in `supabase/migrations/004_recruitment_foundation.sql` only because that is the repository's existing migration folder. It is a standalone Neon PostgreSQL migration; it must be run against the Neon database, never against the website's Supabase project.

Before running it, confirm Neon Auth is enabled on that Neon branch and the JWT/RLS functions and authenticated database role are available. Run it on a development branch first, then verify workspace creation and tenant isolation. Do not apply it to production yet.
