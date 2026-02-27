import { requireAdmin } from "@/lib/authz"
import { BarberService } from "@/services/barber.service"
import { replaceShiftsSchema } from "@/validators/barber.validators"

type Params = { params: { id: string } }

export async function GET(_: Request, { params }: Params): Promise<Response> {
  try {
    await requireAdmin()
    const service = new BarberService()
    const data = await service.listShifts(params.id)
    return Response.json({ ok: true, data })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro"
    const status =
      message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 400
    return Response.json({ ok: false, message }, { status })
  }
}

export async function PUT(req: Request, { params }: Params): Promise<Response> {
  try {
    await requireAdmin()
    const body = await req.json()
    const input = replaceShiftsSchema.parse(body)

    const service = new BarberService()
    const data = await service.replaceShifts(params.id, input.shifts)

    return Response.json({ ok: true, data })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro"
    const status =
      message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 400
    return Response.json({ ok: false, message }, { status })
  }
}