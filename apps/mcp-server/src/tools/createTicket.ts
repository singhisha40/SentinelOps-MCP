import { createTicket } from "../../../../packages/domain/ticket.js";
import { createTicketSchema } from "../../../../packages/schemas/ticket.js";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";
import { audit } from "../audit/audit.js";

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
          audit({
            actor: actor.id,
            operation: "create_ticket",
            resource: input.id,
            result: "auth_rejection",
            timestamp: new Date().toISOString(),
            metadata: {
              tool: "create_ticket",
              reason: decision.reason,
            },
          });

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

        audit({
          actor: actor.id,
          operation: "create_ticket",
          resource: input.id,
          result: "success",
          timestamp: new Date().toISOString(),
          metadata: {
            tool: "create_ticket",
          },
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
        audit({
          actor: getCurrentActor().id,
          operation: "create_ticket",
          resource: input.id,
          result: "failure",
          timestamp: new Date().toISOString(),
          metadata: {
            tool: "create_ticket",
            error:
              error instanceof Error ? error.message : "Unknown error",
          },
        });

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