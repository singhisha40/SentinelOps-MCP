import { getEmployee } from "../../../../packages/domain/employee.js";
import { getEmployeeSchema } from "../../../../packages/schemas/employee.js";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";

export function registerGetEmployeeTool(server: any) {
  server.registerTool(
    "get_employee",
    {
      description: "Get an employee by ID",
      inputSchema: getEmployeeSchema,
    },
    async ({ id }: { id: string }) => {
      try {
        const actor = getCurrentActor();

        const policy = policies.get_employee;

        const decision = authorize(actor, policy, {
          employee_id: id,
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

        const employee = await getEmployee(id);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(employee, null, 2),
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