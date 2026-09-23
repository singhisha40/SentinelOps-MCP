import { z } from "zod";

export const getEmployeeSchema = z.object({
  id: z.string().min(1),
});