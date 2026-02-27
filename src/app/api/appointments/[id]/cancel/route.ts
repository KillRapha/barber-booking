import { NextResponse, type NextRequest } from "next/server"
import { requireUser } from "@/lib/authz"
import { appointmentsService } from "@/services/appointments.service"

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireUser()
    const { id } = await params

    await appointmentsService.cancel(user.id, id)

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "UNKNOWN"
    if (msg === "UNAUTHORIZED")
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    if (msg === "NOT_FOUND_OR_ALREADY_CANCELED")
      return NextResponse.json(
        { error: "Agendamento não encontrado ou já cancelado" },
        { status: 404 }
      )
    return NextResponse.json({ error: "Erro ao cancelar" }, { status: 500 })
  }
}