import { getTicket, updateTicket } from "../../../../packages/domain/ticket.js";
import { updateTicketSchema } from "../../../../packages/schemas/ticket.js";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";

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

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(ticket, null, 2),
            },
          ],
        };
      } catch (error) {
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