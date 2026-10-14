import { supabase } from "../db/client.js";

export interface AuditEntry {
  actor: string;
  operation: string;
  resource: string;
  result: "success" | "failure" | "auth_rejection";
  approval_id?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export async function audit(entry: AuditEntry): Promise<void> {
  console.error("[AUDIT]", JSON.stringify(entry));

  const { error } = await supabase
    .from("audit_logs")
    .insert({
      actor: entry.actor,
      operation: entry.operation,
      resource: entry.resource,
      result: entry.result,
      approval_id: entry.approval_id ?? null,
      timestamp: entry.timestamp,
      metadata: entry.metadata ?? {},
    });

  if (error) {
    console.error(
      "[AUDIT_PERSISTENCE_ERROR]",
      error.message
    );
  }
}