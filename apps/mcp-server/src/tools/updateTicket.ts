import { updateTicket } from "../../../../packages/domain/ticket.js";
import { updateTicketSchema } from "../../../../packages/schemas/ticket.js";

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
              text: error instanceof Error ? error.message : "Unknown error",
            },
          ],
          isError: true,
        };
      }
    }
  );
}