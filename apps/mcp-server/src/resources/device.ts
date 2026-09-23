import { McpServer, ResourceTemplate } from "@modelcontextprotocol/server";
import { getDevice } from "../../../../packages/domain/device.js";

export function registerDeviceResource(server: McpServer) {
  server.registerResource(
    "device",
    new ResourceTemplate("device://{id}", {
      list: undefined,
    }),
    {
      title: "Device",
      description: "Device information",
      mimeType: "application/json",
    },
    async (uri, variables) => {
      const id = variables.id;

      if (typeof id !== "string") {
        throw new Error("Invalid device ID");
      }

      const device = await getDevice(id);

      return {
        contents: [
          {
            uri: uri.href,
            mimeType: "application/json",
            text: JSON.stringify(device, null, 2),
          },
        ],
      };
    }
  );
}