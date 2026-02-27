import { prisma } from "@/lib/prisma"
import { requireUser } from "@/lib/authz"

export async function GET(): Promise<Response> {
  try {
    await requireUser() // cliente logado pode acessar

    const barbers = await prisma.barber.findMany({
      where: { active: true },
      select: { id: true, name: true, active: true },
      orderBy: { name: "asc" },
    })

    return Response.json({ ok: true, data: barbers })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro"
    const status = message === "UNAUTHORIZED" ? 401 : 400
    return Response.json({ ok: false, message }, { status })
  }
}