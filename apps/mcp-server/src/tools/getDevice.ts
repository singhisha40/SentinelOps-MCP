import { getDevice } from "../../../../packages/domain/device.js";
import { getDeviceSchema } from "../../../../packages/schemas/device.js";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";

export function registerGetDeviceTool(server: any) {
  server.registerTool(
    "get_device",
    {
      description: "Get a device by ID",
      inputSchema: getDeviceSchema,
    },
    async ({ id }: { id: string }) => {
      try {
        const actor = getCurrentActor();
        const device = await getDevice(id);

        const policy = policies.get_device;

        const decision = authorize(actor, policy, device);

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