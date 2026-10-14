import { searchTickets } from "../../../../packages/domain/ticket.js";
import { searchTicketsSchema } from "../../../../packages/schemas/ticket.js";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";
import { audit } from "../audit/audit.js";
import { markAsUntrustedContent } from "../security/untrustedContent.js";

export function registerSearchTicketsTool(server: any) {
  server.registerTool(
    "search_tickets",
    {
      description: "Search tickets by title or description",
      inputSchema: searchTicketsSchema,
    },
    async ({ query }: { query?: string }) => {
      try {
        const actor = getCurrentActor();

        const policy = policies.search_tickets;

        const decision = authorize(actor, policy, {
          employee_id: actor.employeeId,
        });

        if (!decision.allowed) {
          audit({
            actor: actor.id,
            operation: "search_tickets",
            resource: query ?? "all",
            result: "auth_rejection",
            timestamp: new Date().toISOString(),
            metadata: {
              tool: "search_tickets",
              reason: decision.reason,
            },
          });

          return {
            content: [{ type: "text", text: decision.reason }],
            isError: true,
          };
        }

        const effectiveEmployeeId =
          actor.role === "EMPLOYEE"
            ? actor.employeeId
            : undefined;

        const tickets = await searchTickets(
          query,
          effectiveEmployeeId
        );

        audit({
          actor: actor.id,
          operation: "search_tickets",
          resource: query ?? "all",
          result: "success",
          timestamp: new Date().toISOString(),
          metadata: { tool: "search_tickets" },
        });

        return {
          content: [
            {
              type: "text",
              text: markAsUntrustedContent(
                JSON.stringify(tickets, null, 2)
              ),
            },
          ],
        };
      } catch (error) {
        audit({
          actor: getCurrentActor().id,
          operation: "search_tickets",
          resource: query ?? "all",
          result: "failure",
          timestamp: new Date().toISOString(),
          metadata: {
            tool: "search_tickets",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });

        return {
          content: [
            {
              type: "text",
              text:
                error instanceof Error
                  ? error.message
                  : "Unknown error",
            },
          ],
          isError: true,
        };
      }
    }
  );
}