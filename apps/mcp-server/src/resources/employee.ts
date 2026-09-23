import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import { getEmployee } from "../../../../packages/domain/employee.js";

export function registerEmployeeResource(server: McpServer) {
  server.registerResource(
    "employee",
    new ResourceTemplate("employee://{id}", {
      list: undefined,
    }),
    {
      title: "Employee",
      description: "Employee information",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const id = variables.id;

      if (typeof id !== "string") {
        throw new Error("Invalid employee ID");
      }

      const employee = await getEmployee(id);

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(employee, null, 2),
          },
        ],
      };
    }
  );
}