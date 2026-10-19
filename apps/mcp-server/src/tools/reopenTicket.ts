import {
  canReopenTicket,
  reopenTicket,
} from "../../../../packages/domain/ticket.js";
import { reopenTicketSchema } from "../../../../packages/schemas/ticket.js";
import { policies } from "../policies/policies.js";
import { runTicketAction } from "./ticketAction.js";

export function registerReopenTicketTool(server: any) {
  server.registerTool(
    "reopen_ticket",
    {
      description:
        "Reopen a closed or resolved ticket. Employees can only reopen their own tickets.",
      inputSchema: reopenTicketSchema,
    },
    async ({ id }: { id: string }) =>
      runTicketAction({
        policy: policies.reopen_ticket,
        ticketId: id,
        guard: (ticket) =>
          canReopenTicket(ticket.status)
            ? null
            : `Only closed or resolved tickets can be reopened (current status: ${ticket.status})`,
        execute: () => reopenTicket(id),
      })
  );
}