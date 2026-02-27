import { requireAdmin } from "@/lib/authz"
import { BarberService } from "@/services/barber.service"
import { createBarberSchema } from "@/validators/barber.validators"

export async function GET(): Promise<Response> {
  await requireAdmin()
  const service = new BarberService()
  const data = await service.listAll()
  return Response.json({ ok: true, data })
}

export async function POST(req: Request): Promise<Response> {
  try {
    await requireAdmin()
    const body = await req.json()
    const input = createBarberSchema.parse(body)

    const service = new BarberService()
    const barber = await service.createBarber(input.name)

    return Response.json({ ok: true, barber }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro"
    const status =
      message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 400
    return Response.json({ ok: false, message }, { status })
  }
}