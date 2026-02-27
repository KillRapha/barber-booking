import { prisma } from "@/lib/prisma"
import { appointmentRepo } from "@/repositories/appointment.repo"
import { barberRepo } from "@/repositories/barber.repo"
import { serviceRepo } from "@/repositories/service.repo"
import { parseISODateOnly } from "@/lib/date"

export class AppointmentsService {
  private overlaps(aStart: number, aDur: number, bStart: number, bDur: number): boolean {
    const aEnd = aStart + aDur
    const bEnd = bStart + bDur
    return aStart < bEnd && bStart < aEnd
  }

  async listForUser(userId: string) {
    const items = await appointmentRepo.listByUser(userId)
    return items.map((a) => ({
      id: a.id,
      date: a.date.toISOString().slice(0, 10),
      startMin: a.startMin,
      durationMin: a.durationMin,
      status: a.status,
      barberName: a.barber.name,
      serviceName: a.service.name,
      totalPriceCents: a.totalPriceCents,
    }))
  }

  async create(input: { userId: string; barberId: string; serviceId: string; date: string; startMin: number }) {
    const barber = await barberRepo.findById(input.barberId)
    if (!barber || !barber.active) throw new Error("BARBER_NOT_FOUND")

    const service = await serviceRepo.findById(input.serviceId)
    if (!service || !service.active) throw new Error("SERVICE_NOT_FOUND")

    const date = parseISODateOnly(input.date)

    // Transação para garantir consistência (evita corrida)
    const created = await prisma.$transaction(async (tx) => {
      const existing = await tx.appointment.findMany({
        where: { barberId: input.barberId, date, status: "SCHEDULED" },
        select: { startMin: true, durationMin: true },
      })

      const conflict = existing.some((a) => this.overlaps(input.startMin, service.durationMin, a.startMin, a.durationMin))
      if (conflict) throw new Error("SLOT_UNAVAILABLE")

      const appt = await tx.appointment.create({
        data: {
          userId: input.userId,
          barberId: input.barberId,
          serviceId: input.serviceId,
          date,
          startMin: input.startMin,
          durationMin: service.durationMin,
          totalPriceCents: service.priceCents,
        },
      })
      return appt
    })

    return { appointmentId: created.id }
  }

  async cancel(userId: string, appointmentId: string) {
    const result = await appointmentRepo.cancelByIdForUser(appointmentId, userId)
    if (result.count === 0) throw new Error("NOT_FOUND_OR_ALREADY_CANCELED")
  }
}

export const appointmentsService = new AppointmentsService()
