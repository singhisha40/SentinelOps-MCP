import { getTicket, updateTicket } from "../../../../packages/domain/ticket.js";
import { updateTicketSchema } from "../../../../packages/schemas/ticket.js";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";
import { audit } from "../audit/audit.js";

export function registerUpdateTicketTool(server: any) {
  server.registerTool(
    "update_ticket",
    {
      description: "Update an existing helpdesk ticket",
      inputSchema: updateTicketSchema,
    },
    async (input: {
      id: string;
      title?: string;
      description?: string;
      category?: string;
      priority?: string;
      status?: string;
      assignedTo?: string;
    }) => {
      try {
        const actor = getCurrentActor();

        const existingTicket = await getTicket(input.id);

        const policy = policies.update_ticket;

        const decision = authorize(actor, policy, existingTicket);

        if (!decision.allowed) {
          audit({
            actor: actor.id,
            operation: "update_ticket",
            resource: input.id,
            result: "auth_rejection",
            timestamp: new Date().toISOString(),
            metadata: {
              tool: "update_ticket",
              reason: decision.reason,
            },
          });

          return {
            content: [
              {
                type: "text",
                text: decision.reason,
              },
            ],
            isError: true,
          };
        }

        const ticket = await updateTicket(input);

        audit({
          actor: actor.id,
          operation: "update_ticket",
          resource: input.id,
          result: "success",
          timestamp: new Date().toISOString(),
          metadata: {
            tool: "update_ticket",
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(ticket, null, 2),
            },
          ],
        };
      } catch (error) {
        audit({
          actor: getCurrentActor().id,
          operation: "update_ticket",
          resource: input.id,
          result: "failure",
          timestamp: new Date().toISOString(),
          metadata: {
            tool: "update_ticket",
            error:
              error instanceof Error ? error.message : "Unknown error",
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