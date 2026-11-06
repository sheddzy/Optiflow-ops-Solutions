-- Run AFTER you have created your admin user in Supabase (Authentication > Users > Add user).
-- Replace the email below with the address you used. Do not commit your real address to GitHub.

-- Guarantee there can only ever be ONE administrator.
create unique index if not exists one_admin_only on public.profiles (role) where role = 'admin';

update public.profiles set role = 'admin' where email = 'YOUR-ADMIN-EMAIL-HERE';

-- Check: this should return exactly one row.
select id, email, role from public.profiles where role = 'admin';
