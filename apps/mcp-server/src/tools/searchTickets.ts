import { searchTickets } from "../../../../packages/domain/ticket.js";
import { searchTicketsSchema } from "../../../../packages/schemas/ticket.js";

export function registerSearchTicketsTool(server: any) {
  server.registerTool(
    "search_tickets",
    {
      description: "Search tickets by title or description",
      inputSchema: searchTicketsSchema,
    },
    async ({ query }: { query?: string }) => {
      try {
        const tickets = await searchTickets(query);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(tickets, null, 2),
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