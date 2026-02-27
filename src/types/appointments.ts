import type { AppointmentStatus } from "@prisma/client"

export type AppointmentListItem = {
  id: string
  date: string // YYYY-MM-DD
  startMin: number
  durationMin: number
  status: AppointmentStatus
  barberName: string
  serviceName: string
  totalPriceCents: number
}

export type CreateAppointmentBody = {
  barberId: string
  serviceId: string
  date: string // YYYY-MM-DD
  startMin: number
}

export type CreateAppointmentResponse = { appointmentId: string }
