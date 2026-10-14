import type { Actor } from "./actor.js";

export function getCurrentActor(): Actor {
  const role =
    process.env.SENTINELOPS_ACTOR_ROLE ?? "EMPLOYEE";

  const actorByRole: Record<string, Actor> = {
    EMPLOYEE: {
      id: "EMP001",
      role: "EMPLOYEE",
      employeeId: "EMP001",
    },

    IT_ADMINISTRATOR: {
      id: "ADMIN001",
      role: "IT_ADMINISTRATOR",
      employeeId: "EMP001",
    },

    SECURITY_ADMIN: {
      id: "SECURITY001",
      role: "SECURITY_ADMIN",
      employeeId: "EMP001",
    },

    IT_SUPPORT: {
      id: "SUPPORT001",
      role: "IT_SUPPORT",
      employeeId: "EMP001",
    },
  };

  const actor = actorByRole[role];

  if (!actor) {
    throw new Error(`Unknown actor role: ${role}`);
  }

  return actor;
}