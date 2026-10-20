import { describe, expect, it } from "vitest";
import { permissions } from "../auth/permissions.js";
import type { Role } from "../auth/actor.js";
import type { Actor } from "../auth/actor.js";
import { authorize } from "./authorize.js";
import { policies } from "./policies.js";
import type { OperationPolicy } from "./policy.js";

const policyMap: Record<string, OperationPolicy> = policies;
const roles = Object.keys(permissions) as Role[];

function actorWithRole(role: Role): Actor {
  return { id: `${role}-ID`, role, employeeId: "EMP001" };
}

describe("policy table integrity", () => {
  it.each(Object.entries(policyMap))(
    "%s: key matches its operation name",
    (key, policy) => {
      expect(policy.operation).toBe(key);
    }
  );

  it.each(Object.entries(policyMap))(
    "%s: requiredRoles and role permissions agree",
    (key, policy) => {
      for (const role of roles) {
        const inPermissions = permissions[role].includes(
          policy.operation
        );
        const inPolicy = policy.requiredRoles.includes(role);

        expect(
          inPermissions,
          `${role} permission vs policy mismatch for ${key}`
        ).toBe(inPolicy);
      }
    }
  );

  it.each(Object.entries(policyMap))(
    "%s: high-risk operations require approval",
    (_key, policy) => {
      if (policy.riskLevel === "HIGH" || policy.riskLevel === "CRITICAL") {
        expect(policy.approvalRequired).toBe(true);
        expect(policy.approvalCount).toBeGreaterThanOrEqual(1);
      }
    }
  );

  it.each(Object.entries(policyMap))(
    "%s: approvalCount is consistent with approvalRequired",
    (_key, policy) => {
      if (!policy.approvalRequired) {
        expect(policy.approvalCount).toBe(0);
      } else {
        expect(policy.approvalCount).toBeGreaterThanOrEqual(1);
      }
    }
  );

  it("every permission entry refers to a defined policy", () => {
    for (const role of roles) {
      for (const operation of permissions[role]) {
        expect(policyMap[operation], `${role}:${operation}`).toBeDefined();
      }
    }
  });
});

describe("specific policies", () => {
  it("reset_vpn is HIGH risk and needs one approval", () => {
    expect(policies.reset_vpn.riskLevel).toBe("HIGH");
    expect(policies.reset_vpn.approvalRequired).toBe(true);
    expect(policies.reset_vpn.approvalCount).toBe(1);
  });

  it("assign_ticket is not available to employees", () => {
    expect(permissions.EMPLOYEE).not.toContain("assign_ticket");
    expect(policies.assign_ticket.requiredRoles).not.toContain(
      "EMPLOYEE"
    );

    const decision = authorize(
      actorWithRole("EMPLOYEE"),
      policies.assign_ticket,
      { employee_id: "EMP001" }
    );

    expect(decision.allowed).toBe(false);
  });

  it.each(["IT_SUPPORT", "IT_ADMINISTRATOR", "SECURITY_ADMIN"] as Role[])(
    "assign_ticket is allowed for %s",
    (role) => {
      const decision = authorize(
        actorWithRole(role),
        policies.assign_ticket,
        { employee_id: "EMP002" }
      );

      expect(decision.allowed).toBe(true);
    }
  );
});

describe("authorize", () => {
  it("denies a role that lacks the operation in the permission map even if the policy lists it", () => {
    const policy: OperationPolicy = {
      ...policies.assign_ticket,
      requiredRoles: ["EMPLOYEE", "IT_SUPPORT"],
    };

    const decision = authorize(actorWithRole("EMPLOYEE"), policy, {
      employee_id: "EMP001",
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain("not allowed to perform");
  });

  it("denies a role that the policy does not list even if the permission map has it", () => {
    const policy: OperationPolicy = {
      ...policies.get_ticket,
      requiredRoles: ["IT_SUPPORT"],
    };

    const decision = authorize(actorWithRole("EMPLOYEE"), policy, {
      employee_id: "EMP001",
    });

    expect(decision.allowed).toBe(false);
    expect(decision.reason).toBe("Role EMPLOYEE is not allowed by policy");
  });

  it("lets staff roles access other employees' resources", () => {
    const decision = authorize(
      actorWithRole("IT_SUPPORT"),
      policies.get_ticket,
      { employee_id: "EMP002" }
    );

    expect(decision.allowed).toBe(true);
  });
});