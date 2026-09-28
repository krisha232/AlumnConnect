# School Connect

A private network for your school's students, alumni and staff. Members sign in with email and password, verify themselves with the school ID number you give them, and wait for an admin to approve them. After that they can post, comment, like, create events and RSVP, browse the member directory, and message each other privately in real time.

It runs on two free services: **Supabase** (database and login) and **Vercel** (hosting the website). For 300 people, the free tiers are enough.

---

## What you need

- A computer with **Node.js 18 or newer** (download from nodejs.org)
- A free **Supabase** account (supabase.com)
- A free **GitHub** account and a free **Vercel** account (vercel.com), for putting the site online
- The list of people who may join, with the ID number you've assigned each one

---

## Step 1: Create the database

1. Sign in to Supabase and click **New project**. Pick the region closest to your school. Save the database password somewhere safe.
2. When the project is ready, open **SQL Editor → New query**.
3. Open `supabase/schema.sql` from this folder, copy all of it, paste it in, and click **Run**. You should see "Success".

That one file creates every table and every security rule.

## Step 2: Configure login

In the Supabase dashboard, go to **Authentication**:

1. **Sign In / Providers → Email**: keep "Confirm email" turned on. Set minimum password length to 8.
2. **URL Configuration**: for now set **Site URL** to `http://localhost:5173`. You'll change it in Step 6.
3. **SMTP Settings** (under Authentication → Emails): Supabase's built-in email sender only allows a few emails per hour, which isn't enough for 300 sign-ups. Connect a free email service such as Resend or Brevo here before inviting everyone. (For testing by yourself, the built-in sender is fine.)

## Step 3: Run the site on your computer

1. In Supabase, open **Project Settings → API** (or **API Keys**). Copy the **Project URL** and the public **anon / publishable** key.
   Never use the `service_role` / secret key in the website.
2. In this folder, copy `.env.example` to a new file named `.env` and paste those two values in. Also set your site and school names.
3. Open a terminal in this folder and run:
   ```
   npm install
   npm run dev
   ```
4. Open http://localhost:5173.

## Step 4: Make yourself the first admin

1. In Supabase **SQL Editor**, add yourself to the roster (use your own ID and exact name):
   ```sql
   insert into roster (id_number, full_name, role, batch_year, is_minor)
   values ('STF001', 'Your Full Name', 'staff', null, false);
   ```
2. On the site, click **Create account**, confirm your email, then enter that ID number and name.
3. Back in the SQL Editor, run (with your ID number):
   ```sql
   update profiles set is_admin = true, status = 'active'
   where id = (select claimed_by from roster where id_number = 'STF001');
   ```
4. Refresh the site. You'll now see the **Admin** section.

## Step 5: Load everyone's ID numbers

Go to **Admin → Roster → Import many from a spreadsheet**. Paste CSV rows in this format (see `supabase/roster-template.csv`):

```
id_number,full_name,role,batch_year,is_minor
STU1001,Arjun Mehta,student,2028,yes
ALU0450,Kavya Iyer,alumni,2015,no
```

- `role` is `student`, `alumni` or `staff`
- `batch_year` is the graduation year ("class of"); leave it empty for staff
- `is_minor` is `yes` for anyone under 18

From Excel or Google Sheets, arrange these five columns, then **File → Download/Save as CSV**, open the file in Notepad, and copy-paste. Re-importing an existing ID updates that person's details.

Then give each person their ID number privately (not in a group message).

## Step 6: Put it online

1. Create a new **private** repository on GitHub and upload this folder (the `.env` file is excluded automatically; keep it that way).
2. In Vercel, click **Add New → Project**, import the repository, and under **Environment Variables** add the same four values from your `.env`.
3. Click **Deploy**. You'll get an address like `your-school.vercel.app`.
4. Back in Supabase **Authentication → URL Configuration**, set **Site URL** to that address and add it under **Redirect URLs** too. Without this, confirmation and password-reset emails will link to the wrong place.

(Netlify works too: the `public/_redirects` file is already set up for it.)

---

## How joining works

1. A person creates an account with their email and a password, and confirms their email.
2. They enter their school ID number and full name. Both must match the roster (capital letters don't matter; spelling does). Each ID can be linked to only one account. After 5 wrong tries, they're locked out for an hour, so nobody can guess IDs.
3. An admin sees them under **Admin → Approvals**, with their ID and email, and approves or rejects them.

If the wrong person claims an ID, use **Unlink ID** in Admin → Members. The ID becomes available again.

## Who can see what

These rules are enforced by the database itself, so they hold even if someone tampers with the website.

| Information | Who can see it |
|---|---|
| ID numbers | Admins, and each member sees only their own |
| Email addresses | Admins only |
| Under-18 flag | Admins only |
| Posts, comments, events, member profiles | Approved members only |
| Private messages | Only the two people in the conversation |
| Reported content | Admins (a copy is saved with the report) |

Members can't change their own name, role, class year or admin status. Those come from the roster.

## Safety features

- **Report** on every post, comment, event, message and profile. Admins review reports under **Admin → Reports** and can delete the content or suspend the person.
- **Block**: stops private messages in both directions.
- **Announcements**: only admins can post them; they're highlighted in the feed.
- **Private messages and minors**: by default, alumni cannot privately message anyone marked under 18. They can still see and comment on each other's posts publicly. Staff and students can message minors.

To change the messaging rule, edit the `dm_allowed` function in `schema.sql` and run just that function again in the SQL Editor. For example, to block all adults (alumni and staff) from messaging minors privately, change `pa.role = 'alumni'` to `pa.role in ('alumni', 'staff')` and do the same for `pb`. Agree on the rule with the school before launch.

## Running it long-term

- **Free Supabase projects pause after a week with no activity.** Once people are using it daily this won't happen; during a quiet holiday it might. Unpause it from the dashboard.
- **Backups**: check what your Supabase plan includes. On the free plan, export your data now and then (**Database → Backups**, or `Table Editor → Export`), especially the roster.
- Add a second admin so you're never the only one who can approve people.

## Project layout

```
supabase/schema.sql          all tables, security rules and server functions
supabase/roster-template.csv sample roster file
src/pages/                   Feed, Events, Members, Profile, Messages, Admin, sign-in screens
src/components/              post card, ID card, report dialog, navigation
src/lib/                     database connection, login state, formatting
src/styles.css               all styling (light and dark mode)
```
