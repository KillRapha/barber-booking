import { getCurrentUser } from "@/lib/auth"

export type CurrentUser = {
  id: string
  name: string
  cpf: string
  role: "ADMIN" | "CLIENT"
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser()
  if (!user) throw new Error("UNAUTHORIZED")
  return user
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser()
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN")
  return user
}