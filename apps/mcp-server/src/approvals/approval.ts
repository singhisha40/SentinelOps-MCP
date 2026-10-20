import crypto from "node:crypto";
import { supabase } from "../db/client.js";

export type ApprovalStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export interface CreateApprovalInput {
  operation: string;
  targetResource: string;
  requestedBy: string;
  riskLevel: string;
  parameters: unknown;
  expiresAt: string;
}

export interface ApprovalRecord {
  id: string;
  operation: string;
  targetResource: string;
  requestedBy: string;
  riskLevel: string;
  status: ApprovalStatus;
  approvedBy: string | null;
  expiresAt: string | null;
  createdAt: string;
  parametersHash: string;
}

function hashParameters(parameters: unknown): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(parameters))
    .digest("hex");
}

export async function createApproval(
  input: CreateApprovalInput
): Promise<ApprovalRecord> {
  const parametersHash = hashParameters(input.parameters);

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const { data, error } = await supabase
    .from("approvals")
    .insert({
      id,
      operation: input.operation,
      target_resource: input.targetResource,
      requested_by: input.requestedBy,
      risk_level: input.riskLevel,
      status: "PENDING",
      approved_by: null,
      expires_at: input.expiresAt,
      created_at: createdAt,
      parameters_hash: parametersHash,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to create approval: ${error.message}`);
  }

  return {
    id: data.id,
    operation: data.operation,
    targetResource: data.target_resource,
    requestedBy: data.requested_by,
    riskLevel: data.risk_level,
    status: data.status as ApprovalStatus,
    approvedBy: data.approved_by,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
    parametersHash: data.parameters_hash,
  };
}

export async function approveApproval(
  approvalId: string,
  approverId: string
): Promise<ApprovalRecord> {
  const { data, error } = await supabase
    .from("approvals")
    .update({
      status: "APPROVED",
      approved_by: approverId,
    })
    .eq("id", approvalId)
    .eq("status", "PENDING")
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to approve request: ${error.message}`);
  }

  return {
    id: data.id,
    operation: data.operation,
    targetResource: data.target_resource,
    requestedBy: data.requested_by,
    riskLevel: data.risk_level,
    status: data.status as ApprovalStatus,
    approvedBy: data.approved_by,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
    parametersHash: data.parameters_hash,
  };
}

export async function rejectApproval(
  approvalId: string,
  approverId: string
): Promise<ApprovalRecord> {
  const { data, error } = await supabase
    .from("approvals")
    .update({
      status: "REJECTED",
      approved_by: approverId,
    })
    .eq("id", approvalId)
    .eq("status", "PENDING")
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to reject request: ${error.message}`);
  }

  return {
    id: data.id,
    operation: data.operation,
    targetResource: data.target_resource,
    requestedBy: data.requested_by,
    riskLevel: data.risk_level,
    status: data.status as ApprovalStatus,
    approvedBy: data.approved_by,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
    parametersHash: data.parameters_hash,
  };
}

export async function validateApproval(
  approvalId: string,
  operation: string,
  targetResource: string,
  parameters: unknown
): Promise<ApprovalRecord> {
  const { data, error } = await supabase
    .from("approvals")
    .select("*")
    .eq("id", approvalId)
    .single();

  if (error) {
    throw new Error(`Approval not found: ${error.message}`);
  }

  if (data.status !== "APPROVED") {
    throw new Error("Approval is not approved");
  }

  if (
    data.expires_at &&
    new Date(data.expires_at).getTime() <= Date.now()
  ) {
    throw new Error("Approval has expired");
  }

  if (data.operation !== operation) {
    throw new Error("Approval operation does not match");
  }

  if (data.target_resource !== targetResource) {
    throw new Error("Approval target does not match");
  }

  const currentHash = hashParameters(parameters);

  if (data.parameters_hash !== currentHash) {
    throw new Error("Approval parameters do not match");
  }

  return {
    id: data.id,
    operation: data.operation,
    targetResource: data.target_resource,
    requestedBy: data.requested_by,
    riskLevel: data.risk_level,
    status: data.status as ApprovalStatus,
    approvedBy: data.approved_by,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
    parametersHash: data.parameters_hash,
  };
}

export async function getApproval(
  approvalId: string
): Promise<ApprovalRecord> {
  const { data, error } = await supabase
    .from("approvals")
    .select("*")
    .eq("id", approvalId)
    .single();

  if (error) {
    throw new Error(`Approval not found: ${error.message}`);
  }

  return {
    id: data.id,
    operation: data.operation,
    targetResource: data.target_resource,
    requestedBy: data.requested_by,
    riskLevel: data.risk_level,
    status: data.status as ApprovalStatus,
    approvedBy: data.approved_by,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
    parametersHash: data.parameters_hash,
  };
}