# IssueTracker

Next.js + Node API routes + Supabase version of the university complaint system.

## Setup

1. Create a Supabase project.
2. Open `supabase/schema.sql` in Supabase SQL Editor and run it.
3. Open `supabase/storage.sql` in Supabase SQL Editor and run it if the storage bucket was not created by `schema.sql`.
4. Copy `.env.local.example` to `.env.local` and fill Supabase keys.
5. Install and run:

```bash
npm install
npm run dev
```

## Roles

Supported roles match the original project:

- Student
- Faculty Member
- HOD
- DSA
- Supervisor

Students submit complaints. Complaints are routed to HOD or DSA by category/department routing. HOD/DSA can review and assign complaints to faculty. Faculty resolve complaints. Supervisor manages departments, staff, activity, analytics, and reports.

## First Supervisor

Create the first supervisor from Supabase Auth, then insert the matching profile:

```sql
insert into profiles (id, username, email, role)
values ('AUTH_USER_UUID_HERE', 'supervisor', 'supervisor@example.com', 'Supervisor');
```

After that, login as Supervisor and create departments, HOD, DSA, and faculty accounts from the dashboard.
