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

## 2026-09-23

### Supabase + MCP Tools & Resources

- Restructured the repo into `apps/mcp-server`, `packages/domain`, and `packages/schemas`.
- Moved MCP server DB files and entry point into the new structure.
- Added typed Supabase database access using generated TypeScript types.
- Implemented Zod schemas and MCP tools:
  - `get_employee`
  - `get_device`
  - `list_devices`
  - `get_ticket`
  - `search_tickets`
  - `create_ticket`
  - `update_ticket`
- MCP handlers : delegating database logic to domain functions.
- Registered MCP resources:
  - `employee://{id}`
  - `device://{id}`
  - `ticket://{id}`
- Connected the server through stdio and verified the MCP handshake.
- Manually tested all 7 tools against seeded Supabase data.
- Manually tested all 3 MCP resources.
- Verified read and low-risk write operations end-to-end through MCP.