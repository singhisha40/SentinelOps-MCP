import type { Role } from "../auth/actor.js";
import type { RiskLevel } from "./risk.js";
import type { Operation } from "./operation.js";

export interface OperationPolicy {
  operation: Operation;
  riskLevel: RiskLevel;
  requiredRoles: Role[];
  approvalRequired: boolean;
  approvalCount: number;
}