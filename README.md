# OptiFlow Ops Solutions: website

Next.js 16, TypeScript, Tailwind CSS 4. Hosting architecture: GitHub, Netlify, Supabase, with Resend for email.

## Status (release 1: company website)

A content-rich company website with enquiries and package payments. No dashboard, CRM, client portal or renewal system is part of this release.

- Pages: Home, About, Services (plus a detail page for each of the six services), Packages (plus standalone Launch and Pro pages), OpsPilot, Portfolio (demonstration projects), Contact, FAQ, Privacy, Terms, Thank You, sitemap and robots
- Enquiries by email or WhatsApp from one form. Email goes to shedrackebete@optiflowops.online. WhatsApp opens +2349060914286 with a prefilled message
- Package purchase through Paystack (Launch 200,000 naira per year, Pro 500,000 naira per year), with an enquiry option beside every Buy option
- Original illustrations in the OptiFlow palette for every page and service (inline SVG, no image downloads)
- The admin dashboard code is kept in the repository but switched off (404 unless `ENABLE_ADMIN=true`)

The site works with no environment variables. Resend, Paystack and Supabase are optional extras. See DEPLOYMENT.md.

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
