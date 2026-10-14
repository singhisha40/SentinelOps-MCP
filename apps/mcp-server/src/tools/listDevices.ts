import { listDevices } from "../../../../packages/domain/device.js";
import { listDevicesSchema } from "../../../../packages/schemas/device.js";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";
import { audit } from "../audit/audit.js";

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
          actor.role === "EMPLOYEE" ? actor.employeeId : employeeId;

        const policy = policies.list_devices;

        const decision = authorize(actor, policy, {
          employee_id: effectiveEmployeeId ?? actor.employeeId,
        });

        if (!decision.allowed) {
          audit({
            actor: actor.id,
            operation: "list_devices",
            resource: effectiveEmployeeId ?? "all",
            result: "auth_rejection",
            timestamp: new Date().toISOString(),
            metadata: {
              tool: "list_devices",
              reason: decision.reason,
            },
          });

          return {
            content: [{ type: "text", text: decision.reason }],
            isError: true,
          };
        }

        const devices = await listDevices(effectiveEmployeeId);

        audit({
          actor: actor.id,
          operation: "list_devices",
          resource: effectiveEmployeeId ?? "all",
          result: "success",
          timestamp: new Date().toISOString(),
          metadata: { tool: "list_devices" },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(devices, null, 2),
            },
          ],
        };
      } catch (error) {
        audit({
          actor: getCurrentActor().id,
          operation: "list_devices",
          resource: employeeId ?? "all",
          result: "failure",
          timestamp: new Date().toISOString(),
          metadata: {
            tool: "list_devices",
            error: error instanceof Error ? error.message : "Unknown error",
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