import { getDevice } from "../../../../packages/domain/device.js";
import { getDeviceSchema } from "../../../../packages/schemas/device.js";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";
import { audit } from "../audit/audit.js";

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
          audit({
            actor: actor.id,
            operation: "get_device",
            resource: id,
            result: "auth_rejection",
            timestamp: new Date().toISOString(),
            metadata: {
              tool: "get_device",
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

        audit({
          actor: actor.id,
          operation: "get_device",
          resource: id,
          result: "success",
          timestamp: new Date().toISOString(),
          metadata: {
            tool: "get_device",
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(device, null, 2),
            },
          ],
        };
      } catch (error) {
        audit({
          actor: getCurrentActor().id,
          operation: "get_device",
          resource: id,
          result: "failure",
          timestamp: new Date().toISOString(),
          metadata: {
            tool: "get_device",
            error:
              error instanceof Error ? error.message : "Unknown error",
          },
        });

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