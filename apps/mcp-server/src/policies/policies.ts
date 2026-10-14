import type { OperationPolicy } from "./policy.js";
import type { Operation } from "./operation.js";

export const policies = {
  get_device: {
    operation: "get_device",
    riskLevel: "LOW",
    requiredRoles: [
      "EMPLOYEE",
      "IT_SUPPORT",
      "IT_ADMINISTRATOR",
      "SECURITY_ADMIN",
    ],
    approvalRequired: false,
    approvalCount: 0,
  },

  get_employee: {
    operation: "get_employee",
    riskLevel: "LOW",
    requiredRoles: [
      "EMPLOYEE",
      "IT_SUPPORT",
      "IT_ADMINISTRATOR",
      "SECURITY_ADMIN",
    ],
    approvalRequired: false,
    approvalCount: 0,
  },

  create_ticket: {
    operation: "create_ticket",
    riskLevel: "LOW",
    requiredRoles: [
      "EMPLOYEE",
      "IT_SUPPORT",
      "IT_ADMINISTRATOR",
      "SECURITY_ADMIN",
    ],
    approvalRequired: false,
    approvalCount: 0,
  },

  update_ticket: {
    operation: "update_ticket",
    riskLevel: "LOW",
    requiredRoles: [
      "EMPLOYEE",
      "IT_SUPPORT",
      "IT_ADMINISTRATOR",
      "SECURITY_ADMIN",
    ],
    approvalRequired: false,
    approvalCount: 0,
  },

  get_ticket: {
    operation: "get_ticket",
    riskLevel: "LOW",
    requiredRoles: [
      "EMPLOYEE",
      "IT_SUPPORT",
      "IT_ADMINISTRATOR",
      "SECURITY_ADMIN",
    ],
    approvalRequired: false,
    approvalCount: 0,
  },

  search_tickets: {
    operation: "search_tickets",
    riskLevel: "LOW",
    requiredRoles: [
      "EMPLOYEE",
      "IT_SUPPORT",
      "IT_ADMINISTRATOR",
      "SECURITY_ADMIN",
    ],
    approvalRequired: false,
    approvalCount: 0,
  },

  list_devices: {
    operation: "list_devices",
    riskLevel: "LOW",
    requiredRoles: [
      "EMPLOYEE",
      "IT_SUPPORT",
      "IT_ADMINISTRATOR",
      "SECURITY_ADMIN",
    ],
    approvalRequired: false,
    approvalCount: 0,
  },

  reset_vpn: {
    operation: "reset_vpn",
    riskLevel: "HIGH",
    requiredRoles: [
      "EMPLOYEE",
      "IT_SUPPORT",
      "IT_ADMINISTRATOR",
      "SECURITY_ADMIN",
    ],
    approvalRequired: true,
    approvalCount: 1,
  },
} satisfies Record<Operation, OperationPolicy>;