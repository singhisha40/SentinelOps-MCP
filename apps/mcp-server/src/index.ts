import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { registerGetEmployeeTool } from "./tools/getEmployee.js";
import { registerGetDeviceTool } from "./tools/getDevice.js";
import { registerListDevicesTool } from "./tools/listDevices.js";
import { registerGetTicketTool } from "./tools/getTicket.js";
import { registerSearchTicketsTool } from "./tools/searchTickets.js";
import { registerCreateTicketTool } from "./tools/createTicket.js";
import { registerUpdateTicketTool } from "./tools/updateTicket.js";
import { registerEmployeeResource } from "./resources/employee.js";
import { registerDeviceResource } from "./resources/device.js";
import { registerTicketResource } from "./resources/ticket.js";

const server = new McpServer({
  name: "sentinelops",
  version: "1.0.0",
});

registerGetEmployeeTool(server);
registerGetDeviceTool(server);
registerListDevicesTool(server);
registerGetTicketTool(server);
registerSearchTicketsTool(server);
registerCreateTicketTool(server);
registerUpdateTicketTool(server);

registerEmployeeResource(server);
registerDeviceResource(server);
registerTicketResource(server);

const transport = new StdioServerTransport();

await server.connect(transport);

console.error("SentinelOps MCP server running on stdio");