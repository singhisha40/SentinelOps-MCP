import { createTicket } from "../../../../packages/domain/ticket.js";
import { createTicketSchema } from "../../../../packages/schemas/ticket.js";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";

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
        const actor = getCurrentActor();

        const effectiveEmployeeId =
          actor.role === "EMPLOYEE"
            ? actor.employeeId
            : input.employeeId;

        const policy = policies.create_ticket;

        const decision = authorize(actor, policy, {
          employee_id: effectiveEmployeeId,
        });

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

        const ticket = await createTicket({
          ...input,
          employeeId: effectiveEmployeeId,
        });

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