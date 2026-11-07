# Deployment guide: GitHub + Netlify + Supabase + Resend + Paystack

## Release 1 summary (read this first)

- The public site works with NO environment variables. Services, packages and all page content are part of the code.
- **Enquiries** (email or WhatsApp): WhatsApp always works. Email: with Resend configured, the form emails shedrackebete@optiflowops.online and the visitor sees the thank-you page. Without Resend, the visitor is given a prefilled email to send from their own email app.
- **Paystack payments**: the Buy buttons on the package pages need `PAYSTACK_SECRET_KEY`. Without it, visitors see "Online payment is not available yet" and can still send an enquiry. See the Paystack section below.
- **Supabase** is optional. When connected it keeps a copy of each email enquiry (visible in Table Editor) and adds database spam limits.
- The admin dashboard is switched off (returns 404). To bring it back later: set `ENABLE_ADMIN=true`, redeploy, and follow section 6.
- `/api/health` checks the Supabase connection only. A 503 there is expected until Supabase variables are added and does not affect the website.

### Environment variables (Netlify > Site configuration > Environment variables)

| Name | Needed for | Secret? |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Correct links and the payment return address. Set to `https://optiflowops.online` | No |
| `RESEND_API_KEY` | Emailing enquiries and payment alerts | Yes |
| `RESEND_FROM` | Sender, e.g. `OptiFlow Website <notifications@send.optiflowops.online>` | No |
| `ENQUIRY_NOTIFY_TO` | Optional. Defaults to shedrackebete@optiflowops.online | No |
| `PAYSTACK_SECRET_KEY` | Package payments. Test key (`sk_test_...`) first, live key (`sk_live_...`) when ready | **Yes. Never prefix with NEXT_PUBLIC_** |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional database copy of enquiries | No |
| `ENABLE_ADMIN` | Optional. Leave unset in release 1 | No |

After adding or changing any variable, run Deploys > Trigger deploy > Clear cache and deploy site.

### Paystack setup

1. Create or open your Paystack business account (paystack.com). Complete business verification so you can go live.
2. Settings > API Keys & Webhooks. Copy the **Test Secret Key** first. Add it in Netlify as `PAYSTACK_SECRET_KEY` (mark as secret, scopes Builds and Functions), then redeploy.
3. In the same Paystack page set the **Test Webhook URL** to `https://optiflowops.online/api/paystack/webhook`. The webhook tells us about successful payments even if the customer closes their browser, and it emails you through Resend.
4. Test: open a package page, tick the box, press Pay, and use a Paystack test card from Paystack's documentation. You should land on "Payment received", and Paystack's dashboard should list the transaction.
5. Going live: replace `PAYSTACK_SECRET_KEY` with the **Live Secret Key**, set the **Live Webhook URL** to the same address, redeploy, and make one small real payment yourself to confirm the whole flow before announcing it.
6. Check in Paystack which payment channels (card, bank transfer, USSD) are enabled for your account, and who pays the transaction fee. Larger amounts such as 500,000 naira can be declined on cards, so bank transfer is worth enabling.

How payment is protected: the price is read from the code on the server and never from the browser; the success page asks Paystack to confirm the payment and checks the amount and currency; the webhook is accepted only with a valid Paystack signature; the secret key never reaches the browser.

There is no payments database in release 1. Paystack's dashboard is the record of payments, and you also receive an email per payment when Resend is configured.

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

## 6. Create the administrator

1. Supabase > Authentication > Users > Add user. Use the email and a strong password you choose. Tick "Auto confirm user".
2. SQL Editor: open `supabase/migrations/002_make_admin.sql`, replace `YOUR-ADMIN-EMAIL-HERE` with that email, run it. It must return exactly one row.
3. Open `https://optiflowops.online/login` and sign in. Password resets are done in Supabase (Authentication > Users) for now.

## 7. Troubleshooting: "no services appear" or "Our services are being updated"

Open `https://optiflowops.online/api/health`, then match the result:

| Result | Meaning | Fix |
|---|---|---|
| `"configured": false` | The Supabase variables were missing when the site was built. Variables are baked in at build time. | Check the names exactly (see the table in step 4), then Deploys > Trigger deploy > Clear cache and deploy site. |
| `"database": "error"` | The variables exist but the database refused the request. Typical causes: wrong URL (it must be just `https://xxxx.supabase.co`, no `/rest/v1`, no trailing slash), wrong key, paused project, or `001_schema.sql` never ran. | Re-copy URL and anon key from Supabase Project Settings > API. Restore the project if paused. Run `001_schema.sql`. |
| `"database": "ok"` and `"publishedServices": 0` | Connected, but there are no published services. The seed did not run, or the rows are unpublished. | Run the whole of `001_schema.sql` once, or in Table Editor > services set `published` to true. Do not run it twice: the tables already exist. |
| `"database": "ok"` and `"publishedServices": 6` | The database is fine. The page is showing an older version. | Wait one minute, hard refresh, or redeploy. |

## 8. Production testing checklist

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

Quick check
- [ ] `/api/health` shows `"database": "ok"` and the expected number of published services

Netlify health
- [ ] Deploys > latest deploy is Published with no secrets-scanning warning
- [ ] Logs > Functions shows no errors after a test submission

## 9. Payment and enquiry checks (release 1)

Enquiries
- [ ] Contact form, email route with Resend set: thank-you page appears and the email arrives at shedrackebete@optiflowops.online
- [ ] Contact form, email route without Resend: "Open my email app" button appears with the message prefilled
- [ ] Contact form, WhatsApp route: WhatsApp opens with +2349060914286 and the prefilled message
- [ ] Opening `/thank-you` directly sends you to `/contact`
- [ ] Empty or invalid fields show clear errors and send nothing

Payments (test mode first)
- [ ] Launch page: Pay button shows 200,000 naira and opens Paystack at the same amount
- [ ] Pro page: Pay button shows 500,000 naira and opens Paystack at the same amount
- [ ] Test payment returns to "Payment received" with a reference
- [ ] A cancelled or failed test payment shows "not completed", not a success message
- [ ] Paystack dashboard shows the transaction, and the webhook delivery shows status 200
- [ ] A payment alert email arrives (Resend set)
- [ ] Buying without ticking the terms box is blocked
- [ ] Live key swapped in and one small real payment checked before announcing

Site
- [ ] Every page loads over HTTPS on phone, tablet and desktop widths
- [ ] Old service addresses (for example /services/website-digital-solutions) redirect to the new ones
- [ ] /admin and /login show 404
