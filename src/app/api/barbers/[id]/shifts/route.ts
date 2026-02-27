import { type NextRequest } from "next/server"
import { requireAdmin } from "@/lib/authz"
import { BarberService } from "@/services/barber.service"
import { replaceShiftsSchema } from "@/validators/barber.validators"

type Ctx = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, ctx: Ctx): Promise<Response> {
  try {
    await requireAdmin()
    const { id } = await ctx.params

    const service = new BarberService()
    const data = await service.listShifts(id)

    return Response.json({ ok: true, data })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro"
    const status =
      message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 400
    return Response.json({ ok: false, message }, { status })
  }
}

export async function PUT(req: NextRequest, ctx: Ctx): Promise<Response> {
  try {
    await requireAdmin()
    const { id } = await ctx.params

    const body = await req.json()
    const input = replaceShiftsSchema.parse(body)

    const service = new BarberService()
    const data = await service.replaceShifts(id, input.shifts)

    return Response.json({ ok: true, data })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro"
    const status =
      message === "UNAUTHORIZED" ? 401 : message === "FORBIDDEN" ? 403 : 400
    return Response.json({ ok: false, message }, { status })
  }
}
