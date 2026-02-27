import { z } from "zod"

export const availabilityQuerySchema = z.object({
  barberId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
})

export type AvailabilityQuery = z.infer<typeof availabilityQuerySchema>
