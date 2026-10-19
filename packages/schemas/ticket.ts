import { z } from "zod";

export const getTicketSchema = z.object({
  id: z.string().min(1),
});

export const searchTicketsSchema = z.object({
  query: z.string().min(1).optional(),
});

export const createTicketSchema = z.object({
  id: z.string().min(1),
  employeeId: z.string().min(1),
  deviceId: z.string().min(1).optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  category: z.string().min(1).optional(),
  priority: z.string().min(1).default("MEDIUM"),
});

export const updateTicketSchema = z
  .object({
    id: z.string().min(1),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    priority: z.string().min(1).optional(),
    status: z.string().min(1).optional(),
    assignedTo: z.string().min(1).optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.description !== undefined ||
      data.category !== undefined ||
      data.priority !== undefined ||
      data.status !== undefined ||
      data.assignedTo !== undefined,
    {
      message: "At least one field must be provided for update",
    }
  );

export const assignTicketSchema = z.object({
  id: z.string().min(1),
  assigneeId: z.string().min(1),
});

export const closeTicketSchema = z.object({
  id: z.string().min(1),
});

export const reopenTicketSchema = z.object({
  id: z.string().min(1),
});