import type { Role } from "./actor.js";
import type { Operation } from "../policies/operation.js";

export const permissions: Record<Role, Operation[]> = {
  EMPLOYEE: [
    "get_employee",
    "get_device",
    "list_devices",
    "get_ticket",
    "search_tickets",
    "create_ticket",
    "update_ticket",
    "reset_vpn",
    "close_ticket",
    "reopen_ticket",
    "get_policy",
  ],

  IT_SUPPORT: [
    "get_employee",
    "get_device",
    "list_devices",
    "get_ticket",
    "search_tickets",
    "create_ticket",
    "update_ticket",
    "reset_vpn",
    "assign_ticket",
    "close_ticket",
    "reopen_ticket",
    "get_policy",
  ],

  IT_ADMINISTRATOR: [
    "get_employee",
    "get_device",
    "list_devices",
    "get_ticket",
    "search_tickets",
    "create_ticket",
    "update_ticket",
    "reset_vpn",
    "assign_ticket",
    "close_ticket",
    "reopen_ticket",
    "get_policy",
  ],

  SECURITY_ADMIN: [
    "get_employee",
    "get_device",
    "list_devices",
    "get_ticket",
    "search_tickets",
    "create_ticket",
    "update_ticket",
    "reset_vpn",
    "assign_ticket",
    "close_ticket",
    "reopen_ticket",
    "get_policy",
  ],
};