import { prisma } from "@/lib/prisma"
import type { AppointmentStatus } from "@prisma/client"

export const appointmentRepo = {
  listByUser: (userId: string) =>
    prisma.appointment.findMany({
      where: { userId },
      orderBy: [{ date: "desc" }, { startMin: "desc" }],
      include: { barber: true, service: true },
    }),

  listByBarberAndDate: (barberId: string, date: Date) =>
    prisma.appointment.findMany({
      where: { barberId, date, status: "SCHEDULED" satisfies AppointmentStatus },
      select: { startMin: true, durationMin: true },
    }),

  create: (data: {
    userId: string
    barberId: string
    serviceId: string
    date: Date
    startMin: number
    durationMin: number
    totalPriceCents: number
  }) => prisma.appointment.create({ data }),

  cancelByIdForUser: (id: string, userId: string) =>
    prisma.appointment.updateMany({ where: { id, userId, status: "SCHEDULED" }, data: { status: "CANCELED" } }),
}
