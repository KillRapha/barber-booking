import { NextResponse } from "next/server"
import { serviceRepo } from "@/repositories/service.repo"

export async function GET() {
  const services = await serviceRepo.listActive()
  return NextResponse.json({
    services: services.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      durationMin: s.durationMin,
      priceCents: s.priceCents,
    })),
  })
}
