import { z } from "zod";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import { policies } from "../policies/policies.js";
import {
  createApproval,
  validateApproval,
} from "../approvals/approval.js";
import { audit } from "../audit/audit.js";

const resetVpnSchema = {
  employeeId: z.string().min(1),
  approvalId: z.string().min(1).optional(),
};

export function registerResetVpnTool(server: any) {
  server.registerTool(
    "reset_vpn",
    {
      description:
        "Reset VPN credentials. Requires human approval before execution.",
      inputSchema: resetVpnSchema,
    },
    async ({
      employeeId,
      approvalId,
    }: {
      employeeId: string;
      approvalId?: string;
    }) => {
      try {
        const actor = getCurrentActor();
        const policy = policies.reset_vpn;

        const decision = authorize(actor, policy, {
          employee_id: employeeId,
        });

        if (!decision.allowed) {
          audit({
            actor: actor.id,
            operation: "reset_vpn",
            resource: employeeId,
            result: "auth_rejection",
            timestamp: new Date().toISOString(),
            metadata: {
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

        const parameters = {
          employeeId,
        };

        // First call: create the approval request.
        if (!approvalId) {
          const expiresAt = new Date(
            Date.now() + 15 * 60 * 1000
          ).toISOString();

          const approval = await createApproval({
            operation: "reset_vpn",
            targetResource: employeeId,
            requestedBy: actor.id,
            riskLevel: policy.riskLevel,
            parameters,
            expiresAt,
          });

          audit({
            actor: actor.id,
            operation: "reset_vpn",
            resource: employeeId,
            result: "success",
            approval_id: approval.id,
            timestamp: new Date().toISOString(),
            metadata: {
              status: "approval_required",
              riskLevel: policy.riskLevel,
            },
          });

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(
                  {
                    message:
                      "Human approval is required before reset_vpn can execute.",
                    approvalId: approval.id,
                    status: approval.status,
                    expiresAt: approval.expiresAt,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }

        // Second call: revalidate the exact approval immediately
        // before the sensitive operation executes.
        const approval = await validateApproval(
          approvalId,
          "reset_vpn",
          employeeId,
          parameters
        );

        /*
         * There is currently no real VPN provider/API in this project.
         * Therefore we do not pretend to reset a real VPN credential.
         *
         * This is the protected execution boundary.
         * Replace this section with the real VPN API call when available.
         */
        const result = {
          operation: "reset_vpn",
          employeeId,
          executed: true,
          approvalId: approval.id,
          message:
            "VPN reset operation passed authorization and approval validation.",
        };

        audit({
          actor: actor.id,
          operation: "reset_vpn",
          resource: employeeId,
          result: "success",
          approval_id: approval.id,
          timestamp: new Date().toISOString(),
          metadata: {
            executed: true,
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        audit({
          actor: getCurrentActor().id,
          operation: "reset_vpn",
          resource: employeeId,
          result: "failure",
          timestamp: new Date().toISOString(),
          metadata: {
            error:
              error instanceof Error
                ? error.message
                : "Unknown error",
          },
        });

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