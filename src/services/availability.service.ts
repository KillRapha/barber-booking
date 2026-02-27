import { shiftRepo } from "@/repositories/shift.repo"
import { appointmentRepo } from "@/repositories/appointment.repo"
import { minutesToHHmm, parseISODateOnly, weekday0Sun } from "@/lib/date"

export type Slot = { startMin: number; label: string }

export class AvailabilityService {
  private buildSlots(startMin: number, endMin: number, stepMin: number): number[] {
    const slots: number[] = []
    for (let m = startMin; m + stepMin <= endMin; m += stepMin) slots.push(m)
    return slots
  }

  private overlaps(aStart: number, aDur: number, bStart: number, bDur: number): boolean {
    const aEnd = aStart + aDur
    const bEnd = bStart + bDur
    return aStart < bEnd && bStart < aEnd
  }

  async getAvailability(barberId: string, dateISO: string): Promise<Slot[]> {
    const date = parseISODateOnly(dateISO)
    const weekday = weekday0Sun(date)

    const shifts = await shiftRepo.listByBarberAndWeekday(barberId, weekday)
    if (shifts.length === 0) return []

    const dayAppointments = await appointmentRepo.listByBarberAndDate(barberId, date)

    // step de 30 min (barba=30, corte=60, combo=90).
    // A validação final do "cabe a duração do serviço" acontece na criação do agendamento.
    const step = 30

    const possible = shifts.flatMap((s: { startMin: number; endMin: number }) =>
      this.buildSlots(s.startMin, s.endMin, step)
    )

    const free = possible.filter((start: number) => {
      return !dayAppointments.some((appt: { startMin: number; durationMin: number }) =>
        this.overlaps(start, step, appt.startMin, appt.durationMin)
      )
    })

    return free.map((m: number) => ({ startMin: m, label: minutesToHHmm(m) }))
  }
}

export const availabilityService = new AvailabilityService()