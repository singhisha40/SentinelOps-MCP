import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../approvals/approval.js", () => ({
  createApproval: vi.fn(),
  validateApproval: vi.fn(),
}));
vi.mock("../audit/audit.js", () => ({ audit: vi.fn() }));

import {
  createApproval,
  validateApproval,
} from "../approvals/approval.js";
import { audit } from "../audit/audit.js";
import { registerResetVpnTool } from "./resetVpn.js";
import { actAs, auditResults, captureTools } from "../testing/testHelpers.js";

const resetVpn = captureTools(registerResetVpnTool)["reset_vpn"]!;

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createApproval).mockResolvedValue({
    id: "APR1",
    status: "PENDING",
    expiresAt: "2099-01-01T00:00:00Z",
  } as any);
  vi.mocked(validateApproval).mockResolvedValue({ id: "APR1" } as any);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("reset_vpn", () => {
  it("does not let an employee reset another employee's VPN", async () => {
    actAs("EMPLOYEE");

    const result = await resetVpn({ employeeId: "EMP002" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe(
      "Employee does not own this resource"
    );
    expect(createApproval).not.toHaveBeenCalled();
    expect(validateApproval).not.toHaveBeenCalled();
    expect(auditResults(vi.mocked(audit))).toEqual(["auth_rejection"]);
  });

  it("first call only creates a HIGH-risk approval request and does not execute", async () => {
    actAs("EMPLOYEE");

    const result = await resetVpn({ employeeId: "EMP001" });
    const body = JSON.parse(result.content[0].text);

    expect(createApproval).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: "reset_vpn",
        targetResource: "EMP001",
        riskLevel: "HIGH",
        parameters: { employeeId: "EMP001" },
      })
    );
    expect(body.approvalId).toBe("APR1");
    expect(body.executed).toBeUndefined();
    expect(validateApproval).not.toHaveBeenCalled();
  });

  it("sets the approval to expire in the future", async () => {
    actAs("EMPLOYEE");

    await resetVpn({ employeeId: "EMP001" });

    const input = vi.mocked(createApproval).mock.calls[0]![0];
    expect(new Date(input.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it("executes only after revalidating the exact approval", async () => {
    actAs("EMPLOYEE");

    const result = await resetVpn({
      employeeId: "EMP001",
      approvalId: "APR1",
    });
    const body = JSON.parse(result.content[0].text);

    expect(validateApproval).toHaveBeenCalledWith(
      "APR1",
      "reset_vpn",
      "EMP001",
      { employeeId: "EMP001" }
    );
    expect(body.executed).toBe(true);
    expect(createApproval).not.toHaveBeenCalled();
  });

  it("does not execute when approval validation fails", async () => {
    actAs("EMPLOYEE");
    vi.mocked(validateApproval).mockRejectedValue(
      new Error("Approval has expired")
    );

    const result = await resetVpn({
      employeeId: "EMP001",
      approvalId: "APR1",
    });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Approval has expired");
    expect(result.content[0].text).not.toContain("executed");
    expect(auditResults(vi.mocked(audit))).toEqual(["failure"]);
  });

  it("validates against the requested employee, so an approval for another target is rejected", async () => {
    actAs("IT_SUPPORT");
    vi.mocked(validateApproval).mockRejectedValue(
      new Error("Approval target does not match")
    );

    const result = await resetVpn({
      employeeId: "EMP002",
      approvalId: "APR-FOR-EMP001",
    });

    expect(validateApproval).toHaveBeenCalledWith(
      "APR-FOR-EMP001",
      "reset_vpn",
      "EMP002",
      { employeeId: "EMP002" }
    );
    expect(result.isError).toBe(true);
  });

  it("lets IT support request a reset for another employee (approval still required)", async () => {
    actAs("IT_SUPPORT");

    const result = await resetVpn({ employeeId: "EMP002" });

    expect(result.isError).toBeUndefined();
    expect(createApproval).toHaveBeenCalledTimes(1);
  });
});