import { describe, expect, it } from "vitest";
import { authorize } from "./authorize.js";
import type { Actor } from "../auth/actor.js";
import type { OperationPolicy } from "./policy.js";

describe("authorize", () => {
  const employee: Actor = {
    id: "EMP001",
    role: "EMPLOYEE",
    employeeId: "EMP001",
  };

  const policy: OperationPolicy = {
    operation: "get_device",
    riskLevel: "LOW",
    requiredRoles: ["EMPLOYEE", "IT_SUPPORT"],
    approvalRequired: false,
    approvalCount: 0,
  };

  it("allows an employee to access their own resource", () => {
    const result = authorize(employee, policy, {
      employee_id: "EMP001",
    });

    expect(result.allowed).toBe(true);
  });

  it("rejects an employee accessing another employee's resource", () => {
    const result = authorize(employee, policy, {
      employee_id: "EMP002",
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("Employee does not own this resource");
  });

  it("rejects an employee when their role is not permitted", () => {
    const restrictedPolicy: OperationPolicy = {
      ...policy,
      requiredRoles: ["IT_SUPPORT"],
    };

    const result = authorize(employee, restrictedPolicy, {
        employee_id: "EMP001",
    });

    expect(result.allowed).toBe(false);
  });

  it("rejects EMP001 from accessing EMP002's device", () => {
  const result = authorize(employee, policy, {
    employee_id: "EMP002",
  });

  expect(result.allowed).toBe(false);
  expect(result.reason).toBe("Employee does not own this resource");
});
});

