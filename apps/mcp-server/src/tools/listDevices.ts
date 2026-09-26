import { listDevices } from "../../../../packages/domain/device.js";
import { listDevicesSchema } from "../../../../packages/schemas/device.js";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";

export function registerListDevicesTool(server: any) {
  server.registerTool(
    "list_devices",
    {
      description: "List devices, optionally filtered by employee ID",
      inputSchema: listDevicesSchema,
    },
    async ({ employeeId }: { employeeId?: string }) => {
      try {
        const actor = getCurrentActor();

        const effectiveEmployeeId =
          actor.role === "EMPLOYEE"
            ? actor.employeeId
            : employeeId;

        const policy = policies.list_devices;

        const decision = authorize(actor, policy, {
          employee_id: effectiveEmployeeId ?? actor.employeeId,
        });

        if (!decision.allowed) {
          return {
            content: [
              { type: "text", text: decision.reason },
            ],
            isError: true,
          };
        }

        const devices = await listDevices(effectiveEmployeeId);

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