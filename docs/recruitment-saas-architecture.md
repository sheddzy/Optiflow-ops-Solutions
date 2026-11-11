# OptiFlow Recruitment Operations SaaS

## Product boundary

A multi-tenant recruitment agency management product sold by OptiFlow Ops Solutions and accessed from the existing `optiflowops.online` domain. It is a separate application area in the existing Next.js 16 + TypeScript + Tailwind repository, deployed on Wasmer. Recruitment data and authentication use a separate Neon project with Neon Auth. The existing website continues using its current Supabase project and Supabase Auth without modification. It does not replace the public website or the existing single-administrator CMS.

Initial application route: `/app`. Individual recruiter route: `/app/agents/[slug]`. Client portal route: `/portal/[agencySlug]`. Product marketing route: `/products/recruitment-operations`.

## Account types and permissions

- OptiFlow platform administrator: retains the existing the existing platform-admin profile access and manages the public website/CMS. This is not an agency role.
- Agency owner: owns one agency workspace and manages its settings, team and recruitment records.
- Agency admin: manages agency records and team access, except ownership/billing transfer.
- Recruiter: works on assigned or permitted clients, projects, roles, candidates and applications. Each active recruiter has a stable agency-scoped URL at `/app/agents/[slug]`; the URL is an authenticated workspace route, not a public access token.
- Client hiring manager: external portal user tied to a specific client record; can view that client's authorised projects and roles, review candidates explicitly shared for review, submit hiring requests and provide candidate feedback. They must not see internal recruiter notes, other clients, unshared candidate records, private candidate contact details or agency financial information. Client portal route: `/portal/[agencySlug]`.

Agency membership roles and client portal access must be stored separately from the existing platform administrator role. Never expand the existing single-admin `profiles.role` check to represent agency roles.

## Core relational model

- `agencies`: one workspace per subscribing recruitment agency; owner, display name, unique workspace slug and lifecycle state.
- `agency_memberships`: joins Neon Neon Neon Auth users to agencies with `owner`, `admin`, or `recruiter` role. A user may belong to more than one agency.
- `clients`: hiring companies owned by an agency; company details, primary contact and relationship status.
- `client_portal_memberships`: joins Neon Neon Auth users to a specific client and agency, with a client-side role and invitation/activation state.
- `projects`: recruitment engagements belonging to one agency and one client; scope, description, dates, owner, priority, budget/fee and status.
- `roles`: vacancies belonging to an agency, client and optionally a project; title, department, description, requirements, employment type, location, salary range, headcount, hiring manager, deadline and status.
- `candidates`: agency-owned candidate profiles and private contact/CV data.
- `applications`: candidate-to-role relationship; pipeline status, assigned recruiter, source, screening notes and timestamps.
- `interviews`: application-linked interview schedule, type, participants, feedback and outcome.
- `recruiter_profiles`: agency-scoped recruiter display identity and unique URL slug, linked to an active agency membership.\n- `candidate_shares`: explicit per-client sharing/visibility record for a candidate/application. Client portal access is denied unless an active, unexpired share exists; the safe review projection excludes private contact details and recruiter notes.\n- `client_hiring_requests`: client-submitted vacancy requests for agency review and conversion into roles.\n- `communication_templates` and `communication_logs`: reusable email content and message delivery history.\n- `job_board_connections` and `job_board_publications`: agency-level channel metadata and vacancy publication tracking. Provider credentials must be encrypted server-side; actual publication requires supported provider APIs/approval.\n- `placement_checkins`: 7/30/60/90/180/365-day employment retention follow-ups.
- `placements`: successful application outcomes, offer/acceptance/start dates and agreed placement fee.
- `activity_events` (later increment): auditable business actions for agency records.

All agency-owned rows carry a non-null `agency_id`. Foreign keys should include agency identity where practical so cross-agency references cannot be created accidentally.

## Data access and isolation

1. Enable PostgreSQL Row Level Security on every SaaS table. Neon Auth must be enabled, and authenticated queries must carry the Neon Auth JWT so `auth.user_id()` resolves correctly.
2. Agency members can access rows only when an active membership exists for the row's `agency_id`.
3. Agency owner/admin/recruiter permissions are enforced by database policies or narrowly scoped database functions, not only by UI hiding. Use Neon Auth's JWT-aware Data API or a verified JWT-aware database connection for user-scoped access; never run tenant-facing requests through an unrestricted owner connection.
4. Client portal members are checked against both `agency_id` and `client_id`.
5. Client users see only explicitly shared candidate/application information; never internal notes or private CV/contact fields unless the agency explicitly shares them.
6. Public/anonymous users cannot query agency, client, project, role, candidate, application, interview or placement tables.
7. Do not expose the Neon database owner credentials in browser code.
8. Keep existing public website and CMS RLS policies unchanged.

## Initial release sequence

1. Database foundation: agencies, memberships, clients, projects, roles; constraints, indexes, updated-at triggers and RLS helper functions.
2. Agency signup, workspace creation, sign-in and invitation flow.
3. Agency dashboard shell and navigation.
4. Client CRUD.
5. Project CRUD.
6. Role/vacancy CRUD.
7. Candidate and application pipeline.
8. Interviews and placements.
9. Recruiter workload and reports.
10. Client portal and explicit candidate sharing.
11. Subscription plans, Paystack billing, renewals and plan limits.
12. Security, tenant-isolation and production tests.

## Neon environment configuration

- `DATABASE_URL`: Neon pooled PostgreSQL connection string for server-side migrations and trusted backend jobs; never expose it with a `NEXT_PUBLIC_` prefix.
- `NEXT_PUBLIC_NEON_AUTH_URL`: Auth endpoint for the selected Neon branch; this is public configuration, not a password.
- Use a separate Neon development branch and its corresponding Auth URL for preview/testing.
- Do not commit `.env.local`, database passwords, Neon API keys or any secret values.
- Existing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and the website's `proxy.ts` remain untouched.

## Implementation safeguards

- Add new numbered Neon SQL migrations; never edit migrations already applied in production.
- Keep the existing website's `profiles` table, `is_admin()` function, Supabase Auth and CMS integration entirely unchanged. Do not import recruitment users into the website's Supabase project.
- Do not enable public self-signup or change Neon Auth settings until the signup flow and anti-abuse controls are ready.
- Do not run a migration against production until it has been reviewed and tested on a development Neon branch/project.
- No fake customer data or illustrative counts in production dashboards.
- Subscription and payment tables are deferred until the core product workflows are stable.
