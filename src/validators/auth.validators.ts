import { z } from "zod"
import { isValidCpf, normalizeCpf } from "@/lib/cpf"

const cpfSchema = z
  .string()
  .min(11)
  .transform((v) => normalizeCpf(v))
  .refine((v) => isValidCpf(v), "CPF inválido")

export const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto").max(80),
  cpf: cpfSchema,
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(72),
})

export const loginSchema = z.object({
  cpf: cpfSchema,
  password: z.string().min(6).max(72),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
