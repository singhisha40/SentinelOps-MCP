# SentinelOps — Project Progress


### Initial Setup

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

**### Security & Authorization**

\- Added an actor/authentication stub with employee identity and role information.
\- Defined RBAC roles:
  - `EMPLOYEE`
  - `IT_SUPPORT`
  - `IT_ADMINISTRATOR`
  - `SECURITY_ADMIN`
\- Implemented resource ownership checks using `employee_id`.
\- Added risk levels and the `OperationPolicy` structure.
\- Implemented deterministic server-side authorization using role and ownership checks.
\- Added explicit policies for:
  - `get_employee`
  - `get_device`
  - `list_devices`
  - `get_ticket`
  - `search_tickets`
  - `create_ticket`
  - `update_ticket`
\- Integrated authorization and ownership enforcement into the employee, device, and ticket MCP tools.
\- Updated `create_ticket` to enforce the authenticated employee's ownership scope.
\- Updated `update_ticket` to verify ticket ownership before allowing updates.
\- Updated `list_devices` to enforce employee-specific device scope.
\- Updated `search_tickets` to filter employee searches at the database query level.
\- Updated `get_employee`, `get_device`, and `get_ticket` with server-side authorization.
\- Registered all secured MCP tools in the MCP server.
\- Added Vitest authorization and tool-level security tests for employee ownership checks.
\- Verified all tests pass.


**###  Security, RBAC, Ownership & Policy Engine**

\- Implemented role-based access control for EMPLOYEE, IT_SUPPORT, IT_ADMINISTRATOR, and SECURITY_ADMIN.
\- Added centralized role-to-operation permissions.
\- Implemented resource ownership checks for employee-owned devices, tickets, and employee records.
\- Added deterministic server-side authorization through the policy engine.
\- Added typed operation and risk-level definitions.
\- Added explicit policies for employee, device, and ticket operations.
\- Strengthened Zod validation for employee, device, and ticket inputs.
\- Added update-ticket validation requiring at least one field to be changed.
\- Integrated authorization checks into MCP tools before resource access or modification.