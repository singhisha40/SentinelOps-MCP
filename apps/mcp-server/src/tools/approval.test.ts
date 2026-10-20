import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../approvals/approval.js", () => ({
  createApproval: vi.fn(),
  approveApproval: vi.fn(),
  rejectApproval: vi.fn(),
  getApproval: vi.fn(),
}));
vi.mock("../audit/audit.js", () => ({ audit: vi.fn() }));

import {
  approveApproval,
  getApproval,
  rejectApproval,
} from "../approvals/approval.js";
import { audit } from "../audit/audit.js";
import { registerApprovalTools } from "./approval.js";
import { actAs, auditResults, captureTools } from "../testing/testHelpers.js";

const tools = captureTools(registerApprovalTools);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(approveApproval).mockResolvedValue({ id: "APR1" } as any);
  vi.mocked(rejectApproval).mockResolvedValue({ id: "APR1" } as any);
  vi.mocked(getApproval).mockResolvedValue({
    id: "APR1",
    requestedBy: "EMP001",
  } as any);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe.each([
  ["approve_request", approveApproval],
  ["reject_request", rejectApproval],
] as const)("%s", (toolName, domainFn) => {
  it.each(["EMPLOYEE", "IT_SUPPORT"])(
    "is denied for %s",
    async (role) => {
      actAs(role);

      const result = await tools[toolName]!({ approvalId: "APR1" });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toMatch(/Only an administrator/);
      expect(domainFn).not.toHaveBeenCalled();
      expect(auditResults(vi.mocked(audit))).toEqual(["auth_rejection"]);
    }
  );

  it.each(["IT_ADMINISTRATOR", "SECURITY_ADMIN"])(
    "is allowed for %s",
    async (role) => {
      actAs(role);

      const result = await tools[toolName]!({ approvalId: "APR1" });

      expect(result.isError).toBeUndefined();
      expect(domainFn).toHaveBeenCalledWith(
        "APR1",
        expect.any(String)
      );
      expect(auditResults(vi.mocked(audit))).toEqual(["success"]);
    }
  );
});

describe("approve_request two-person rule", () => {
  it.each([
    ["IT_ADMINISTRATOR", "ADMIN001"],
    ["SECURITY_ADMIN", "SECURITY001"],
  ])(
    "%s cannot approve a request they raised themselves",
    async (role, actorId) => {
      actAs(role);
      vi.mocked(getApproval).mockResolvedValue({
        id: "APR1",
        requestedBy: actorId,
      } as any);

      const result = await tools["approve_request"]!({ approvalId: "APR1" });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toBe(
        "You cannot approve your own request."
      );
      expect(approveApproval).not.toHaveBeenCalled();
      expect(auditResults(vi.mocked(audit))).toEqual(["auth_rejection"]);
    }
  );

  it("an administrator can approve a request raised by someone else", async () => {
    actAs("IT_ADMINISTRATOR");

    const result = await tools["approve_request"]!({ approvalId: "APR1" });

    expect(result.isError).toBeUndefined();
    expect(approveApproval).toHaveBeenCalledWith("APR1", "ADMIN001");
  });

  it("an administrator can still reject their own request (cancel it)", async () => {
    actAs("IT_ADMINISTRATOR");

    const result = await tools["reject_request"]!({ approvalId: "APR1" });

    expect(result.isError).toBeUndefined();
    expect(rejectApproval).toHaveBeenCalled();
  });
});