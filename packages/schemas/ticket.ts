import { z } from "zod";

export const getTicketSchema = z.object({
  id: z.string().min(1),
});

export const searchTicketsSchema = z.object({
  query: z.string().optional(),
});

export const createTicketSchema = z.object({
  id: z.string().min(1),
  employeeId: z.string().min(1),
  deviceId: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().optional(),
  priority: z.string().default("MEDIUM"),
});

export const updateTicketSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
});