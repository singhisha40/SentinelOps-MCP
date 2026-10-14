import { z } from "zod";
import { getCurrentActor } from "../auth/auth.js";
import {
  createApproval,
  approveApproval,
  rejectApproval,
} from "../approvals/approval.js";
import { audit } from "../audit/audit.js";

const requestApprovalSchema = {
  operation: z.string().min(1),
  targetResource: z.string().min(1),
  riskLevel: z.enum(["MEDIUM", "HIGH", "CRITICAL"]),
  parameters: z.record(z.string(), z.unknown()),
  expiresAt: z.string().datetime(),
};

const approvalActionSchema = {
  approvalId: z.string().min(1),
};

export function registerApprovalTools(server: any) {
  server.registerTool(
    "request_approval",
    {
      description: "Create a human approval request for a sensitive operation",
      inputSchema: requestApprovalSchema,
    },
    async ({
      operation,
      targetResource,
      riskLevel,
      parameters,
      expiresAt,
    }: {
      operation: string;
      targetResource: string;
      riskLevel: "MEDIUM" | "HIGH" | "CRITICAL";
      parameters: Record<string, unknown>;
      expiresAt: string;
    }) => {
      try {
        const actor = getCurrentActor();

        const approval = await createApproval({
          operation,
          targetResource,
          requestedBy: actor.id,
          riskLevel,
          parameters,
          expiresAt,
        });

        audit({
          actor: actor.id,
          operation: "request_approval",
          resource: targetResource,
          result: "success",
          approval_id: approval.id,
          timestamp: new Date().toISOString(),
          metadata: {
            requestedOperation: operation,
            riskLevel,
          },
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(approval, null, 2),
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

  server.registerTool(
    "approve_request",
    {
      description: "Approve a pending sensitive operation",
      inputSchema: approvalActionSchema,
    },
    async ({ approvalId }: { approvalId: string }) => {
      try {
        const actor = getCurrentActor();

        if (
          actor.role !== "IT_ADMINISTRATOR" &&
          actor.role !== "SECURITY_ADMIN"
        ) {
          audit({
            actor: actor.id,
            operation: "approve_request",
            resource: approvalId,
            result: "auth_rejection",
            timestamp: new Date().toISOString(),
          });

          return {
            content: [
              {
                type: "text",
                text: "Only an administrator can approve requests.",
              },
            ],
            isError: true,
          };
        }

        const approval = await approveApproval(
          approvalId,
          actor.id
        );

        audit({
          actor: actor.id,
          operation: "approve_request",
          resource: approvalId,
          result: "success",
          approval_id: approvalId,
          timestamp: new Date().toISOString(),
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(approval, null, 2),
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

  server.registerTool(
    "reject_request",
    {
      description: "Reject a pending sensitive operation",
      inputSchema: approvalActionSchema,
    },
    async ({ approvalId }: { approvalId: string }) => {
      try {
        const actor = getCurrentActor();

        if (
          actor.role !== "IT_ADMINISTRATOR" &&
          actor.role !== "SECURITY_ADMIN"
        ) {
          audit({
            actor: actor.id,
            operation: "reject_request",
            resource: approvalId,
            result: "auth_rejection",
            timestamp: new Date().toISOString(),
          });

          return {
            content: [
              {
                type: "text",
                text: "Only an administrator can reject requests.",
              },
            ],
            isError: true,
          };
        }

        const approval = await rejectApproval(
          approvalId,
          actor.id
        );

        audit({
          actor: actor.id,
          operation: "reject_request",
          resource: approvalId,
          result: "success",
          approval_id: approvalId,
          timestamp: new Date().toISOString(),
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(approval, null, 2),
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