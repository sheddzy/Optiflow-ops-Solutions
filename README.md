# OptiFlow Ops Solutions: website

Next.js 16, TypeScript, Tailwind CSS 4. Hosting architecture: GitHub, Netlify, Supabase, with Resend for email.

## Status (release 2: website with admin backend)

- Public site: Home, About, Services (six detail pages), Packages (landing page plus a page per package), OpsPilot, Portfolio, Contact, FAQ, Privacy, Terms, Thank You, Blog, promotion landing pages (`/offers/...`) and CMS pages
- Free business email setup promotion landing page, live from the built-in copy even before the database is connected
- Enquiries by email or WhatsApp. Package purchase through Paystack with prices read on the server
- Admin backend (single administrator): enquiries and promotion claims, promotions manager, packages and prices (with price history), pages, blog with scheduling, media library
- Content is stored in Supabase after migration 003. Without Supabase the site falls back to the built-in packages and promotion
- Original illustrations in the OptiFlow palette (inline SVG)

See DEPLOYMENT.md for setup, including the admin backend (section 10) and Paystack.

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
