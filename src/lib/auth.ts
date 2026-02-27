import { cookies } from "next/headers"
import { verifyAuthToken } from "@/lib/jwt"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) return null

  try {
    const payload = verifyAuthToken(token)

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        cpf: true,
        role: true
      },
    })

    return user
  } catch {
    return null
  }
}