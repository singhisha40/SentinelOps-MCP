import { getDevice } from "../../../../packages/domain/device.js";
import { getDeviceSchema } from "../../../../packages/schemas/device.js";

export function registerGetDeviceTool(server: any) {
  server.registerTool(
    "get_device",
    {
      description: "Get a device by ID",
      inputSchema: getDeviceSchema,
    },
    async ({ id }: { id: string }) => {
      try {
        const device = await getDevice(id);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(device, null, 2),
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