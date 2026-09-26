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
  ],

  IT_SUPPORT: [
    "get_employee",
    "get_device",
    "list_devices",
    "get_ticket",
    "search_tickets",
    "create_ticket",
    "update_ticket",
  ],

  IT_ADMINISTRATOR: [
    "get_employee",
    "get_device",
    "list_devices",
    "get_ticket",
    "search_tickets",
    "create_ticket",
    "update_ticket",
  ],

  SECURITY_ADMIN: [
    "get_employee",
    "get_device",
    "list_devices",
    "get_ticket",
    "search_tickets",
    "create_ticket",
    "update_ticket",
  ],
};