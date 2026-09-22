# SentinelOps — Project Progress

## 2026-09-22

### Completed

- Set up Supabase for the SentinelOps project.
- Created `employees` and `devices` database tables.
- Added initial employee and device test data.
- Configured the relationship between `devices.employee_id` and `employees.id`.
- Enabled Row Level Security on the database tables.
- Added temporary development SELECT policies.
- Configured environment variables using `.env` and `dotenv`.
- Created the typed Supabase client in `src/db/client.ts`.
- Installed and initialized the Supabase CLI.
- Logged into and linked the local project to the hosted Supabase project.
- Generated `src/db/database.types.ts`.
- Updated the Supabase client to use the generated `Database` type.
- Successfully tested the typed Supabase connection