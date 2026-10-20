import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../audit/audit.js", () => ({ audit: vi.fn() }));

import { audit } from "../audit/audit.js";
import { policies } from "../policies/policies.js";
import { registerGetPolicyTool } from "./getPolicy.js";
import { actAs, auditResults, captureTools } from "../testing/testHelpers.js";

const getPolicy = captureTools(registerGetPolicyTool)["get_policy"]!;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("get_policy", () => {
  it("returns every policy when no operation is given", async () => {
    actAs("EMPLOYEE");

    const result = await getPolicy({});
    const body = JSON.parse(result.content[0].text);

    expect(body.map((p: any) => p.operation).sort()).toEqual(
      Object.keys(policies).sort()
    );
  });

  it("returns one policy with approval details", async () => {
    actAs("EMPLOYEE");

    const result = await getPolicy({ operation: "reset_vpn" });
    const body = JSON.parse(result.content[0].text);

    expect(body.riskLevel).toBe("HIGH");
    expect(body.approvalRequired).toBe(true);
    expect(body.approvalCount).toBe(1);
  });

  it("reports whether the current role may use the operation", async () => {
    actAs("EMPLOYEE");
    const employee = JSON.parse(
      (await getPolicy({ operation: "assign_ticket" })).content[0].text
    );

    actAs("IT_SUPPORT");
    const support = JSON.parse(
      (await getPolicy({ operation: "assign_ticket" })).content[0].text
    );

    expect(employee.allowedForCurrentRole).toBe(false);
    expect(support.allowedForCurrentRole).toBe(true);
  });

  it("rejects unknown operations and lists the known ones", async () => {
    actAs("EMPLOYEE");

    const result = await getPolicy({ operation: "delete_everything" });

    expect(result.isError).toBe(true);
    expect(result.content[0].text).toContain("Unknown operation");
    expect(result.content[0].text).toContain("reset_vpn");
    expect(auditResults(vi.mocked(audit))).toEqual(["failure"]);
  });

  it.each(["constructor", "__proto__", "toString", "hasOwnProperty"])(
    "does not treat the prototype key %s as an operation",
    async (key) => {
      actAs("EMPLOYEE");

      const result = await getPolicy({ operation: key });

      expect(result.isError).toBe(true);
      expect(result.content[0].text).toContain("Unknown operation");
    }
  );

  it("audits successful lookups", async () => {
    actAs("SECURITY_ADMIN");

    await getPolicy({ operation: "get_ticket" });

    expect(auditResults(vi.mocked(audit))).toEqual(["success"]);
  });
});