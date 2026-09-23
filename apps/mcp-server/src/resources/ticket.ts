import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import { getTicket } from "../../../../packages/domain/ticket.js";

export function registerTicketResource(server: McpServer) {
  server.registerResource(
    "ticket",
    new ResourceTemplate("ticket://{id}", {
      list: undefined,
    }),
    {
      title: "Ticket",
      description: "Helpdesk ticket information",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const id = variables.id;

      if (typeof id !== "string") {
        throw new Error("Invalid ticket ID");
      }

      const ticket = await getTicket(id);

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(ticket, null, 2),
          },
        ],
      };
    }
  );
}