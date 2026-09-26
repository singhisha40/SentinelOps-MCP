import { z } from "zod";

export const getDeviceSchema = z.object({
  id: z.string().min(1),
});

export const listDevicesSchema = z.object({
  employeeId: z.string().min(1).optional(),
});