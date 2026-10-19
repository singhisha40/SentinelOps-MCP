import { getPolicySchema } from "../../../../packages/schemas/policy.js";
import { getCurrentActor } from "../auth/auth.js";
import { permissions } from "../auth/permissions.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";
import type { OperationPolicy } from "../policies/policy.js";
import type { Operation } from "../policies/operation.js";
import { audit } from "../audit/audit.js";

const policyMap: Record<string, OperationPolicy> = policies;

export function registerGetPolicyTool(server: any) {
  server.registerTool(
    "get_policy",
    {
      description:
        "Show the security policy (risk level, required roles, approval rules) for one operation, or for all operations.",
      inputSchema: getPolicySchema,
    },
    async ({ operation }: { operation?: string }) => {
      const resource = operation ?? "all";

      try {
        const actor = getCurrentActor();

        // get_policy has no owned resource; scope it to the caller.
        const decision = authorize(actor, policies.get_policy, {
          employee_id: actor.employeeId,
        });

        if (!decision.allowed) {
          audit({
            actor: actor.id,
            operation: "get_policy",
            resource,
            result: "auth_rejection",
            timestamp: new Date().toISOString(),
            metadata: { tool: "get_policy", reason: decision.reason },
          });

          return {
            content: [{ type: "text", text: decision.reason }],
            isError: true,
          };
        }

        const describe = (policy: OperationPolicy) => ({
          operation: policy.operation,
          riskLevel: policy.riskLevel,
          requiredRoles: policy.requiredRoles,
          approvalRequired: policy.approvalRequired,
          approvalCount: policy.approvalCount,
          allowedForCurrentRole:
            permissions[actor.role].includes(
              policy.operation as Operation
            ) && policy.requiredRoles.includes(actor.role),
        });

        let body: unknown;

        if (operation === undefined) {
          body = Object.values(policyMap).map(describe);
        } else {
          // Object.hasOwn avoids prototype keys such as "constructor".
          const policy = Object.hasOwn(policyMap, operation)
            ? policyMap[operation]
            : undefined;

          if (!policy) {
            audit({
              actor: actor.id,
              operation: "get_policy",
              resource,
              result: "failure",
              timestamp: new Date().toISOString(),
              metadata: { tool: "get_policy", reason: "unknown_operation" },
            });

            return {
              content: [
                {
                  type: "text",
                  text: `Unknown operation: ${operation}. Known operations: ${Object.keys(policyMap).join(", ")}`,
                },
              ],
              isError: true,
            };
          }

          body = describe(policy);
        }

        audit({
          actor: actor.id,
          operation: "get_policy",
          resource,
          result: "success",
          timestamp: new Date().toISOString(),
          metadata: { tool: "get_policy" },
        });

        return {
          content: [{ type: "text", text: JSON.stringify(body, null, 2) }],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";

        audit({
          actor: getCurrentActor().id,
          operation: "get_policy",
          resource,
          result: "failure",
          timestamp: new Date().toISOString(),
          metadata: { tool: "get_policy", error: message },
        });

        return {
          content: [{ type: "text", text: message }],
          isError: true,
        };
      }
    }
  );
}