import { createTicket } from "../../../../packages/domain/ticket.js";
import { createTicketSchema } from "../../../../packages/schemas/ticket.js";

export function registerCreateTicketTool(server: any) {
  server.registerTool(
    "create_ticket",
    {
      description: "Create a new helpdesk ticket",
      inputSchema: createTicketSchema,
    },
    async (input: {
      id: string;
      employeeId: string;
      deviceId?: string;
      title: string;
      description: string;
      category?: string;
      priority: string;
    }) => {
      try {
        const ticket = await createTicket(input);

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