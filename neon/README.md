# Neon recruitment database

This database is separate from the public OptiFlow website's Supabase project.

## Migration order

Run these files in the Neon SQL Editor, in order, against the recruitment database:

1. `migrations/001_recruitment_foundation.sql` — agencies, memberships, clients, projects, roles and client portal memberships.
2. `migrations/002_recruitment_pipeline.sql` — candidates, applications, interviews, placements and recruitment activity.
3. `migrations/003_agency_portals_and_retention.sql` — recruiter profiles and assignment identifiers, explicit client candidate sharing, safe client review projection and feedback, hiring requests, communications, job-board metadata, and placement retention check-ins.

Do not rerun a migration that has already completed. Both migrations use explicit transactions; a successful run ends with `COMMIT`.

## Tenant isolation

Every recruitment record carries an `agency_id`. Foreign keys ensure related records belong to the same agency. RLS policies restrict staff access to agencies where the signed-in Neon Auth user has an active membership.

Client portal memberships permit client-scoped reads of clients, projects and roles. Migration 003 adds explicit candidate sharing, a restricted client review projection (without private contact/CV details or recruiter notes), client feedback, and hiring requests. Client users must not be granted direct access to candidate or application tables.

The initial migration provides `create_agency_workspace(name, slug)`, which atomically creates an agency and its owner membership for the authenticated user.

## Current implementation boundary

The recruitment UI and Neon Auth sign-in/session protection are in the application branch. The database schema is not the same thing as a working data layer: do not connect user-facing CRUD screens using a privileged database connection that bypasses RLS.

Before enabling live records, complete and test the authenticated Neon Data API/JWT integration, then verify tenant isolation using two separate agency users. Do not expose `DATABASE_URL`, database credentials, or privileged keys to the browser.
