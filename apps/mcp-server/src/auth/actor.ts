export type Role =
  | "EMPLOYEE"
  | "IT_SUPPORT"
  | "IT_ADMINISTRATOR"
  | "SECURITY_ADMIN";

export interface Actor {
  id: string;
  role: Role;
  employeeId: string;
}