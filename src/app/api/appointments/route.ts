import { NextResponse } from "next/server"
import { requireUser } from "@/lib/authz"
import { createAppointmentSchema } from "@/validators/appointment.validators"
import { appointmentsService } from "@/services/appointments.service"

export async function GET() {
  try {
    const user = await requireUser()
    const items = await appointmentsService.listForUser(user.id)
    return NextResponse.json({ items })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN"
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    return NextResponse.json({ error: "Erro ao carregar" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser()
    const body = await req.json()
    const parsed = createAppointmentSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })

    const result = await appointmentsService.create({ userId: user.id, ...parsed.data })
    return NextResponse.json(result, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN"
    if (msg === "UNAUTHORIZED") return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    if (msg === "SLOT_UNAVAILABLE") return NextResponse.json({ error: "Horário indisponível" }, { status: 409 })
    if (msg === "BARBER_NOT_FOUND") return NextResponse.json({ error: "Barbeiro inválido" }, { status: 400 })
    if (msg === "SERVICE_NOT_FOUND") return NextResponse.json({ error: "Serviço inválido" }, { status: 400 })
    return NextResponse.json({ error: "Erro ao agendar" }, { status: 500 })
  }
}
