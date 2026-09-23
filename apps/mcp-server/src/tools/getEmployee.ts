import { getEmployee } from "../../../../packages/domain/employee.js";
import { getEmployeeSchema } from "../../../../packages/schemas/employee.js";

export function registerGetEmployeeTool(server: any) {
  server.registerTool(
    "get_employee",
    {
      description: "Get an employee by ID",
      inputSchema: getEmployeeSchema,
    },
    async ({ id }: { id: string }) => {
      try {
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
              text: error instanceof Error ? error.message : "Unknown error",
            },
          ],
          isError: true,
        };
      }
    }
  );
}