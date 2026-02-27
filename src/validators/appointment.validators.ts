import { z } from "zod"

export const createAppointmentSchema = z.object({
  barberId: z.string().min(1),
  serviceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startMin: z.number().int().min(0).max(24 * 60),
})

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>
