import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => ({
  row: null as any,
  error: null as { message: string } | null,
  eqCalls: [] as [string, unknown][],
  updatePayload: undefined as any,
  insertPayload: undefined as any,
}));

vi.mock("../db/client.js", () => {
  const chain: any = {
    select: () => chain,
    insert: (payload: unknown) => {
      db.insertPayload = payload;
      db.row = { ...(payload as object) };
      return chain;
    },
    update: (payload: unknown) => {
      db.updatePayload = payload;
      return chain;
    },
    eq: (column: string, value: unknown) => {
      db.eqCalls.push([column, value]);
      return chain;
    },
    single: async () => ({ data: db.row, error: db.error }),
  };

  return { supabase: { from: () => chain } };
});

import {
  approveApproval,
  createApproval,
  getApproval,
  rejectApproval,
  validateApproval,
} from "./approval.js";

const params = { employeeId: "EMP001" };

function sha256(value: unknown) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");
}

function approvalRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "APR1",
    operation: "reset_vpn",
    target_resource: "EMP001",
    requested_by: "EMP001",
    risk_level: "HIGH",
    status: "APPROVED",
    approved_by: "ADMIN001",
    expires_at: new Date(Date.now() + 60_000).toISOString(),
    created_at: "2026-01-01T00:00:00Z",
    parameters_hash: sha256(params),
    ...overrides,
  };
}

beforeEach(() => {
  db.row = null;
  db.error = null;
  db.eqCalls = [];
  db.updatePayload = undefined;
  db.insertPayload = undefined;
});

describe("validateApproval", () => {
  it("accepts a valid, approved, unexpired approval that matches exactly", async () => {
    db.row = approvalRow();

    const result = await validateApproval(
      "APR1",
      "reset_vpn",
      "EMP001",
      params
    );

    expect(result.id).toBe("APR1");
    expect(result.status).toBe("APPROVED");
  });

  it.each(["PENDING", "REJECTED", "EXPIRED"])(
    "rejects an approval whose status is %s",
    async (status) => {
      db.row = approvalRow({ status });

      await expect(
        validateApproval("APR1", "reset_vpn", "EMP001", params)
      ).rejects.toThrow("Approval is not approved");
    }
  );

  it("rejects an approval that has expired", async () => {
    db.row = approvalRow({
      expires_at: new Date(Date.now() - 1000).toISOString(),
    });

    await expect(
      validateApproval("APR1", "reset_vpn", "EMP001", params)
    ).rejects.toThrow("Approval has expired");
  });

  it("rejects an approval granted for a different operation", async () => {
    db.row = approvalRow({ operation: "close_ticket" });

    await expect(
      validateApproval("APR1", "reset_vpn", "EMP001", params)
    ).rejects.toThrow("Approval operation does not match");
  });

  it("rejects an approval granted for a different target", async () => {
    db.row = approvalRow({ target_resource: "EMP002" });

    await expect(
      validateApproval("APR1", "reset_vpn", "EMP001", params)
    ).rejects.toThrow("Approval target does not match");
  });

  it("rejects when the parameters were changed after approval", async () => {
    db.row = approvalRow();

    await expect(
      validateApproval("APR1", "reset_vpn", "EMP001", {
        employeeId: "EMP001",
        extra: "tampered",
      })
    ).rejects.toThrow("Approval parameters do not match");
  });

  it("rejects an unknown approval id", async () => {
    db.error = { message: "no rows" };

    await expect(
      validateApproval("NOPE", "reset_vpn", "EMP001", params)
    ).rejects.toThrow("Approval not found");
  });
});

describe("createApproval", () => {
  it("stores a PENDING approval with a sha256 hash of the parameters", async () => {
    const result = await createApproval({
      operation: "reset_vpn",
      targetResource: "EMP001",
      requestedBy: "EMP001",
      riskLevel: "HIGH",
      parameters: params,
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    });

    expect(db.insertPayload.status).toBe("PENDING");
    expect(db.insertPayload.approved_by).toBeNull();
    expect(db.insertPayload.parameters_hash).toBe(sha256(params));
    expect(result.status).toBe("PENDING");
    expect(result.parametersHash).toBe(sha256(params));
  });

  it("produces different hashes for different parameters", async () => {
    expect(sha256({ employeeId: "EMP001" })).not.toBe(
      sha256({ employeeId: "EMP002" })
    );
  });
});

describe("approveApproval / rejectApproval", () => {
  it("only updates approvals that are still PENDING when approving", async () => {
    db.row = approvalRow({ status: "APPROVED" });

    await approveApproval("APR1", "ADMIN001");

    expect(db.updatePayload).toEqual({
      status: "APPROVED",
      approved_by: "ADMIN001",
    });
    expect(db.eqCalls).toContainEqual(["id", "APR1"]);
    expect(db.eqCalls).toContainEqual(["status", "PENDING"]);
  });

  it("only updates approvals that are still PENDING when rejecting", async () => {
    db.row = approvalRow({ status: "REJECTED" });

    await rejectApproval("APR1", "ADMIN001");

    expect(db.updatePayload).toEqual({
      status: "REJECTED",
      approved_by: "ADMIN001",
    });
    expect(db.eqCalls).toContainEqual(["status", "PENDING"]);
  });

  it("fails when the approval is no longer pending", async () => {
    db.error = { message: "no rows returned" };

    await expect(approveApproval("APR1", "ADMIN001")).rejects.toThrow(
      "Failed to approve request"
    );
    await expect(rejectApproval("APR1", "ADMIN001")).rejects.toThrow(
      "Failed to reject request"
    );
  });
});

describe("getApproval", () => {
  it("returns the approval including who requested it", async () => {
    db.row = approvalRow({ requested_by: "ADMIN001" });

    const result = await getApproval("APR1");

    expect(result.requestedBy).toBe("ADMIN001");
    expect(db.eqCalls).toContainEqual(["id", "APR1"]);
  });

  it("fails for an unknown approval", async () => {
    db.error = { message: "no rows" };

    await expect(getApproval("NOPE")).rejects.toThrow("Approval not found");
  });
});