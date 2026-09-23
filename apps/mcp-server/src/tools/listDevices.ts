import { listDevices } from "../../../../packages/domain/device.js";
import { listDevicesSchema } from "../../../../packages/schemas/device.js";

export function registerListDevicesTool(server: any) {
  server.registerTool(
    "list_devices",
    {
      description: "List devices, optionally filtered by employee ID",
      inputSchema: listDevicesSchema,
    },
    async ({ employeeId }: { employeeId?: string }) => {
      try {
        const devices = await listDevices(employeeId);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(devices, null, 2),
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