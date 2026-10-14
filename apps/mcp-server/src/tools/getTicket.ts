import { getTicket } from "../../../../packages/domain/ticket.js";
import { getTicketSchema } from "../../../../packages/schemas/ticket.js";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";
import { audit } from "../audit/audit.js";
import { markAsUntrustedContent } from "../security/untrustedContent.js";

export function registerGetTicketTool(server: any) {
  server.registerTool(
    "get_ticket",
    {
      description: "Get a ticket by ID",
      inputSchema: getTicketSchema,
    },
    async ({ id }: { id: string }) => {
      try {
        const actor = getCurrentActor();
        const ticket = await getTicket(id);

        const policy = policies.get_ticket;
        const decision = authorize(actor, policy, ticket);

        if (!decision.allowed) {
          audit({
            actor: actor.id,
            operation: "get_ticket",
            resource: id,
            result: "auth_rejection",
            timestamp: new Date().toISOString(),
            metadata: {
              tool: "get_ticket",
              reason: decision.reason,
            },
          });

          return {
            content: [{ type: "text", text: decision.reason }],
            isError: true,
          };
        }

        audit({
          actor: actor.id,
          operation: "get_ticket",
          resource: id,
          result: "success",
          timestamp: new Date().toISOString(),
          metadata: { tool: "get_ticket" },
        });

        return {
          content: [
            {
              type: "text",
              text: markAsUntrustedContent(
                JSON.stringify(ticket, null, 2)
              ),
            },
          ],
        };
      } catch (error) {
        audit({
          actor: getCurrentActor().id,
          operation: "get_ticket",
          resource: id,
          result: "failure",
          timestamp: new Date().toISOString(),
          metadata: {
            tool: "get_ticket",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });

        return {
          content: [
            {
              type: "text",
              text: error instanceof Error ? error.message : "Unknown error",
            },
          ],
          isError: true,
        };
      }
    }
  );
}