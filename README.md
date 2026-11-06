# OptiFlow Ops Solutions: website

Next.js 16, TypeScript, Tailwind CSS 4. Hosting architecture: GitHub, Netlify, Supabase, with Resend for email.

## Status

Built and verified (type check and production build pass; enquiry validation and email logic tested with mocks):
- Public site: Home, About, Services, OpsPilot, Portfolio, Contact, Privacy, sitemap, robots, SEO metadata
- Contact form that saves to the database (server-side validation, honeypot, rate limits)
- Email alert to operations@optiflowops.online on every enquiry (Resend)
- Database schema, Row Level Security policies, image storage rules, seed content
- Netlify configuration (netlify.toml)

Not built yet (next stages): admin login, dashboard, lead/service/portfolio/content management.

Not yet tested against live Supabase, Resend or Netlify accounts. Use the checklist in DEPLOYMENT.md.

## Quick start (local)

1. Create a Supabase project and run `supabase/migrations/001_schema.sql` in the SQL Editor.
2. Install Node.js 20.9 or newer, then:
   ```
   npm install
   cp .env.example .env.local     # fill in the Supabase values (Resend is optional locally)
   npm run dev                    # http://localhost:3000
   ```
3. Follow DEPLOYMENT.md to publish on Netlify and connect optiflowops.online.

## Admin account (used from Stage 3)

Create your admin user in Supabase (Authentication > Users > Add user), then run `supabase/migrations/002_make_admin.sql` after replacing the placeholder email. No admin email is stored in the source code.

## Known limits

- Supabase free projects pause after roughly a week of inactivity, which would make the contact form fail. Plan a keep-alive request or the paid tier.
- The in-memory rate limiter is per server instance; the database trigger is the dependable limit.
- If Resend is not configured or is down, enquiries are still saved; only the alert email is skipped.
