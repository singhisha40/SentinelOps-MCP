import { getTicket } from "../../../../packages/domain/ticket.js";
import { getTicketSchema } from "../../../../packages/schemas/ticket.js";

export function registerGetTicketTool(server: any) {
  server.registerTool(
    "get_ticket",
    {
      description: "Get a ticket by ID",
      inputSchema: getTicketSchema,
    },
    async ({ id }: { id: string }) => {
      try {
        const ticket = await getTicket(id);

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