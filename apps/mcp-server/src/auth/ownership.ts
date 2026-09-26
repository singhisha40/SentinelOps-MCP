import type { Actor } from "./actor.js";

export interface OwnedResource {
  employee_id: string;
}

export function isOwner(
  actor: Actor,
  resource: OwnedResource
): boolean {
  return actor.employeeId === resource.employee_id;
}

export function canAccessOwnedResource(
  actor: Actor,
  resource: OwnedResource
): boolean {
  if (actor.role === "EMPLOYEE") {
    return isOwner(actor, resource);
  }

  return true;
}