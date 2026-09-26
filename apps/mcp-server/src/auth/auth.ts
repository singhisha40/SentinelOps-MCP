import type { Actor } from "./actor.js";

export function getCurrentActor(): Actor {
  return {
    id: "EMP001",
    role: "EMPLOYEE",
    employeeId: "EMP001",
  };
}