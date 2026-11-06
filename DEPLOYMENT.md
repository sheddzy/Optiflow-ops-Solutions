# Deployment guide: GitHub + Netlify + Supabase + Resend

Do the steps in order. Never paste passwords or keys into chat, email or GitHub.

## 1. Supabase (database)

1. Create a project at supabase.com. Save the database password in a password manager.
2. SQL Editor > New query > paste `supabase/migrations/001_schema.sql` > Run.
3. Project Settings > API: copy the Project URL and the `anon` public key.
4. Authentication > Sign In / Providers: turn OFF "Allow new users to sign up".
5. Authentication > URL Configuration (needed once login is added in Stage 3):
   - Site URL: `https://optiflowops.online`
   - Redirect URLs: `https://optiflowops.online/**` and your Netlify preview pattern, for example `https://deploy-preview-*--YOUR-SITE-NAME.netlify.app/**`

## 2. GitHub

1. Create a private repository named `optiflow-website`.
2. Push this folder. `.env` files are git-ignored, so keys stay out of the repository.
3. Use `main` as the production branch.

## 3. Resend (email alerts)

1. Create an account at resend.com and add the domain. Use a sending subdomain such as `send.optiflowops.online`, not the root domain. Your root domain already receives mail, and a subdomain avoids clashes with existing MX and SPF records.
2. Resend shows DNS records (TXT for SPF and DKIM, and an MX for the subdomain). Add them exactly as shown, in your DNS provider, in step 5. Do not edit or delete your existing mail records.
3. When Resend shows the domain as Verified, create an API key (sending access only). Keep it for step 4.
4. Sender address to use: `OptiFlow Website <notifications@send.optiflowops.online>`.

## 4. Netlify (hosting)

1. Sign up at netlify.com with GitHub. Add new project > Import an existing project > GitHub > choose `optiflow-website`.
2. Build settings are read from `netlify.toml` (command `npm run build`, publish `.next`). Netlify detects Next.js and installs its Next.js runtime automatically. Do not add a plugin by hand.
3. Site configuration > Build & deploy > Continuous deployment: set the production branch to `main`. Leave Deploy Previews on so each pull request gets a test link.
4. Site configuration > Environment variables. Add each one for all deploy contexts:

   | Name | Value | Secret? | Scopes |
   |---|---|---|---|
   | `NEXT_PUBLIC_SITE_URL` | `https://optiflowops.online` | No | Builds |
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL from step 1 | No | Builds, Functions |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key | No (public by design) | Builds, Functions |
   | `RESEND_API_KEY` | key from step 3 | Yes, mark as secret | Builds, Functions |
   | `RESEND_FROM` | `OptiFlow Website <notifications@send.optiflowops.online>` | No | Builds, Functions |
   | `ENQUIRY_NOTIFY_TO` | `operations@optiflowops.online` | No | Builds, Functions |

   Rules: never use the `NEXT_PUBLIC_` prefix for a secret, and never add the Supabase service-role key. Variables are applied at build time, so after adding or changing any of them you must trigger a new deploy (Deploys > Trigger deploy > Deploy site) before they take effect.
5. Deploy. Open the `*.netlify.app` address and run the first part of the checklist below before touching DNS.

## 5. Domain and DNS (optiflowops.online)

Recommended: keep DNS where it is now and add records there. Your domain already receives email at operations@, and moving nameservers risks breaking it unless every record is copied across exactly.

1. Netlify: Domain management > Add a domain > `optiflowops.online`. Set it as primary and let `www.optiflowops.online` redirect to it.
2. Netlify shows the exact records to create. Use those values, because they are authoritative. Typically:
   - Apex (`optiflowops.online`): an A record pointing to Netlify's load balancer address shown in the panel (commonly `75.2.60.5`), or an ALIAS/ANAME to your `*.netlify.app` name if your provider supports it.
   - `www`: a CNAME to `YOUR-SITE-NAME.netlify.app`.
3. Add the Resend records from step 3 for the `send` subdomain.
4. Leave existing MX, SPF and other mail records untouched.
5. Back in Netlify, HTTPS: click Verify DNS configuration, then Provision certificate (Let's Encrypt). It can take from a few minutes to a few hours. Then turn on Force HTTPS.
6. Check with: `https://optiflowops.online` loads with a padlock, and `http://` redirects to `https://`.

If you ever choose Netlify DNS instead (changing nameservers at your registrar), first copy every existing DNS record, especially mail records, into Netlify DNS.

## 6. Production testing checklist

Run on the live domain, not only locally.

Site and HTTPS
- [ ] `https://optiflowops.online` and `https://www.optiflowops.online` both load over HTTPS, no certificate warning
- [ ] `http://` redirects to `https://`
- [ ] All pages load: Home, About, Services, OpsPilot, Portfolio, Contact, Privacy
- [ ] `/sitemap.xml` and `/robots.txt` load and show the correct domain
- [ ] Services appear (read from the database), and the Portfolio shows the "coming soon" state
- [ ] Pages look right at phone, tablet and desktop widths
- [ ] Email, WhatsApp, LinkedIn, Instagram and Facebook links open the right places

Contact form (server action, database, email)
- [ ] Valid submission shows "Enquiry received"
- [ ] The row appears in Supabase Table Editor > enquiries with status New
- [ ] An alert email arrives at operations@optiflowops.online, and Reply goes to the sender
- [ ] Empty or invalid fields show inline errors and save nothing
- [ ] Unticked consent is blocked
- [ ] Six quick submissions from one email: the later ones are refused
- [ ] Temporarily set a wrong `RESEND_API_KEY`, redeploy, submit: the enquiry is still saved and the visitor still sees success (restore the key afterwards)

Database permissions (Row Level Security)
- [ ] In a private browser, open `YOUR-SUPABASE-URL/rest/v1/enquiries?select=*` with the anon key as the `apikey` header: it returns an empty list, not enquiries
- [ ] The same request to `/rest/v1/profiles` returns an empty list
- [ ] Set a service to unpublished in the table editor: it disappears from the site within about a minute

Authentication callbacks (after Stage 3 is built)
- [ ] Admin sign-in works on the live domain
- [ ] Password reset email link returns to `https://optiflowops.online` and not to localhost
- [ ] `/admin` redirects to the login page when signed out
- [ ] The Supabase Site URL and Redirect URLs from step 1 are saved

Netlify health
- [ ] Deploys > latest deploy is Published with no secrets-scanning warning
- [ ] Logs > Functions shows no errors after a test submission
