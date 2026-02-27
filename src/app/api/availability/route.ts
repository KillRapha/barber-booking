import { NextResponse } from "next/server"
import { availabilityQuerySchema } from "@/validators/availability.validators"
import { availabilityService } from "@/services/availability.service"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const parsed = availabilityQuerySchema.safeParse({
    barberId: url.searchParams.get("barberId"),
    date: url.searchParams.get("date"),
  })

  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
  }

  try {
    const slots = await availabilityService.getAvailability(parsed.data.barberId, parsed.data.date)
    return NextResponse.json({ barberId: parsed.data.barberId, date: parsed.data.date, slots })
  } catch {
    return NextResponse.json({ error: "Falha ao calcular disponibilidade" }, { status: 500 })
  }
}
