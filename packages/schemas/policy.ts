import { z } from "zod";

export const getPolicySchema = z.object({
  operation: z.string().min(1).optional(),
});