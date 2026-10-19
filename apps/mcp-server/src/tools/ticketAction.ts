import { getTicket } from "../../../../packages/domain/ticket.js";
import { getCurrentActor } from "../auth/auth.js";
import { authorize } from "../policies/authorize.js";
import type { OperationPolicy } from "../policies/policy.js";
import { audit } from "../audit/audit.js";
import { markAsUntrustedContent } from "../security/untrustedContent.js";

type Ticket = Awaited<ReturnType<typeof getTicket>>;

function errorResult(text: string) {
  return {
    content: [{ type: "text", text }],
    isError: true,
  };
}

/**
 * Shared flow for ticket workflow tools (assign / close / reopen):
 * load ticket -> authorize (role + ownership) -> business-rule guard
 * -> execute -> audit. Every outcome is audited.
 */
export async function runTicketAction(options: {
  policy: OperationPolicy;
  ticketId: string;
  metadata?: Record<string, unknown>;
  guard?: (ticket: Ticket) => Promise<string | null> | string | null;
  execute: (ticket: Ticket) => Promise<unknown>;
}) {
  const { policy, ticketId } = options;
  const operation = policy.operation;
  const baseMetadata = { tool: operation, ...options.metadata };

  try {
    const actor = getCurrentActor();
    const ticket = await getTicket(ticketId);

    const decision = authorize(actor, policy, ticket);

    if (!decision.allowed) {
      audit({
        actor: actor.id,
        operation,
        resource: ticketId,
        result: "auth_rejection",
        timestamp: new Date().toISOString(),
        metadata: { ...baseMetadata, reason: decision.reason },
      });

      return errorResult(decision.reason);
    }

    const guardMessage = options.guard
      ? await options.guard(ticket)
      : null;

    if (guardMessage) {
      audit({
        actor: actor.id,
        operation,
        resource: ticketId,
        result: "failure",
        timestamp: new Date().toISOString(),
        metadata: { ...baseMetadata, reason: guardMessage },
      });

      return errorResult(guardMessage);
    }

    const updated = await options.execute(ticket);

    audit({
      actor: actor.id,
      operation,
      resource: ticketId,
      result: "success",
      timestamp: new Date().toISOString(),
      metadata: { ...baseMetadata, previousStatus: ticket.status },
    });

    return {
      content: [
        {
          type: "text",
          text: markAsUntrustedContent(JSON.stringify(updated, null, 2)),
        },
      ],
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    audit({
      actor: getCurrentActor().id,
      operation,
      resource: ticketId,
      result: "failure",
      timestamp: new Date().toISOString(),
      metadata: { ...baseMetadata, error: message },
    });

    return errorResult(message);
  }
}