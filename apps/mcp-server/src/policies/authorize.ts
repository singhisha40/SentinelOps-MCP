import type { Actor } from "../auth/actor.js";
import { canAccessOwnedResource } from "../auth/ownership.js";
import type { OwnedResource } from "../auth/ownership.js";
import { permissions } from "../auth/permissions.js";
import type { OperationPolicy } from "./policy.js";

export interface AuthorizationDecision {
  allowed: boolean;
  reason: string;
}

export function authorize(
  actor: Actor,
  policy: OperationPolicy,
  target: OwnedResource
): AuthorizationDecision {
  const rolePermissions = permissions[actor.role];

  if (!rolePermissions.includes(policy.operation)) {
    return {
      allowed: false,
      reason: `Role ${actor.role} is not allowed to perform ${policy.operation}`,
    };
  }

  if (!policy.requiredRoles.includes(actor.role)) {
    return {
      allowed: false,
      reason: `Role ${actor.role} is not allowed by policy`,
    };
  }

  if (!canAccessOwnedResource(actor, target)) {
    return {
      allowed: false,
      reason: "Employee does not own this resource",
    };
  }

  return {
    allowed: true,
    reason: "Authorized",
  };
}