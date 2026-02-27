import { z } from "zod"

export const createBarberSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(80),
})

export const replaceShiftsSchema = z.object({
  shifts: z
    .array(
      z.object({
        weekday: z.number().int().min(0).max(6),
        startMin: z.number().int().min(0).max(1439),
        endMin: z.number().int().min(1).max(1440),
      })
    )
    .min(1, "Informe pelo menos 1 turno")
    .refine(
      (arr) => arr.every((s) => s.endMin > s.startMin),
      "endMin deve ser maior que startMin"
    ),
})