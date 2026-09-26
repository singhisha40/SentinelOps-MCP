import { getTicket } from "../../../../packages/domain/ticket.js";
import { getTicketSchema } from "../../../../packages/schemas/ticket.js";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";

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
              text: error instanceof Error ? error.message : "Unknown error",
            },
          ],
          isError: true,
        };
      }
    }
  );
}