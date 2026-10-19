import {
  canCloseTicket,
  closeTicket,
} from "../../../../packages/domain/ticket.js";
import { closeTicketSchema } from "../../../../packages/schemas/ticket.js";
import { policies } from "../policies/policies.js";
import { runTicketAction } from "./ticketAction.js";

export function registerCloseTicketTool(server: any) {
  server.registerTool(
    "close_ticket",
    {
      description:
        "Close a ticket. Employees can only close their own tickets.",
      inputSchema: closeTicketSchema,
    },
    async ({ id }: { id: string }) =>
      runTicketAction({
        policy: policies.close_ticket,
        ticketId: id,
        guard: (ticket) =>
          canCloseTicket(ticket.status)
            ? null
            : "Ticket is already closed",
        execute: () => closeTicket(id),
      })
  );
}