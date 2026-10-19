import {
  assignTicket,
  canAssignTicket,
} from "../../../../packages/domain/ticket.js";
import { getEmployee } from "../../../../packages/domain/employee.js";
import { assignTicketSchema } from "../../../../packages/schemas/ticket.js";
import { policies } from "../policies/policies.js";
import { runTicketAction } from "./ticketAction.js";

// Only these employee roles may be assigned to work on a ticket.
const ASSIGNABLE_ROLES = [
  "IT_SUPPORT",
  "IT_ADMINISTRATOR",
  "SECURITY_ADMIN",
];

export function registerAssignTicketTool(server: any) {
  server.registerTool(
    "assign_ticket",
    {
      description:
        "Assign a ticket to an IT staff member. Restricted to IT and security roles.",
      inputSchema: assignTicketSchema,
    },
    async ({ id, assigneeId }: { id: string; assigneeId: string }) =>
      runTicketAction({
        policy: policies.assign_ticket,
        ticketId: id,
        metadata: { assigneeId },
        guard: async (ticket) => {
          if (!canAssignTicket(ticket.status)) {
            return "Cannot assign a closed ticket. Reopen it first.";
          }

          const assignee = await getEmployee(assigneeId);

          if (!ASSIGNABLE_ROLES.includes(assignee.role)) {
            return `Employee ${assigneeId} cannot be assigned tickets (role ${assignee.role})`;
          }

          return null;
        },
        execute: () => assignTicket(id, assigneeId),
      })
  );
}