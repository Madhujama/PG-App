RADHA KRISHNA PG MANAGER — COMPLETE STARTER PROJECT

FILES
- index.html: administrator login and dashboard
- register.html: public resident admission form (share this URL /register.html)
- app.js: admin login, residents, meal register, totals and delete actions
- register.js: registration form and private document uploads
- styles.css: mobile-friendly layout
- config.js: Supabase URL, publishable/anon key and admin email
- supabase/01_schema.sql: create database tables and indexes
- supabase/02_security_policies.sql: table permissions and row-level security
- supabase/03_private_storage.sql: private storage bucket and policies

START FROM THE BEGINNING
1. In Supabase, open the NEW project → SQL Editor → New query.
2. Open supabase/01_schema.sql, copy all its text into the SQL Editor, then Run.
3. Open a new SQL query; copy supabase/02_security_policies.sql; Run.
4. Open a new SQL query; copy supabase/03_private_storage.sql; Run.
5. In Supabase Authentication → Users, create/confirm the user malleshwari.c69@gmail.com. Set a strong password and confirm the user if the UI offers that option.
6. In Project Settings → API Keys, copy Project URL and publishable key (or legacy anon key). Never use secret/service-role key in this website.
7. Edit config.js: replace PASTE_YOUR_NEW_SUPABASE_PROJECT_URL_HERE and PASTE_YOUR_NEW_PUBLISHABLE_OR_ANON_KEY_HERE with the real values. Keep quotes. ADMIN_EMAIL should remain malleshwari.c69@gmail.com.
8. Upload all project files and the supabase folder to the ROOT of the GitHub repository. index.html must appear directly on the repo main page, not inside a nested folder. Commit changes.
9. In Netlify, open your site → Site configuration / Build & deploy. Connect the GitHub repository if needed. For this plain static site, build command can be blank and publish directory should be `.`. Trigger deploy and wait for Published.
10. Test the Netlify site root for admin sign-in and append /register.html for the public form. Test using fake sample data first. Do not share QR code or collect real identity documents until all permissions are verified.

ADMIN / SECURITY
- Admin email is malleshwari.c69@gmail.com.
- Use only the Supabase publishable/anon key in config.js. It is intended for public clients; RLS policies are the security boundary.
- Keep resident-private-files bucket private.
- Public registration allows inserts and registration-path uploads but does not allow public resident SELECT.
- This starter needs further anti-spam/rate-limiting (e.g., CAPTCHA or server-side validation) before public production use. The public insert policy alone cannot stop fake registrations or abusive uploads.
- The app's download action currently downloads an HTML copy of the entered text details, not the uploaded image/PDF documents. Document links are not made public.
- Meal table records outside customers by phone number in customer_id. The outside_customers table exists but the UI does not need a separate row there for every meal.
- This project does not migrate old-project data. Keep the old Supabase project until you have exported any records you need.
- The registration form was drafted from the fields known in the conversation; compare it with your original paper form and add any missing paper fields before production.

TROUBLESHOOTING
- “Edit config.js…” means the placeholders were not replaced or the new deploy did not publish.
- “Invalid login credentials” means the Auth user/password in the NEW project must be checked/reset.
- “Permission denied” / “row-level security” means the corresponding SQL file did not run successfully or the logged-in email does not match the configured admin.
- Do not send passwords, secret keys, service-role keys, or actual resident identity documents in chat.
