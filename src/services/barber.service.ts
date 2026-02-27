import { BarberRepository } from "@/repositories/barber.repo"
import { ShiftRepository, ShiftInput } from "@/repositories/shift.repo"

export class BarberService {
  constructor(
    private readonly barbers = new BarberRepository(),
    private readonly shifts = new ShiftRepository()
  ) {}

  async createBarber(name: string) {
    return this.barbers.create(name.trim())
  }

  async listAll() {
    return this.barbers.listAll()
  }

  async replaceShifts(barberId: string, shifts: ShiftInput[]) {
    // regra simples: impedir sobreposição no mesmo dia
    const byDay = new Map<number, ShiftInput[]>()
    for (const s of shifts) {
      const list = byDay.get(s.weekday) ?? []
      list.push(s)
      byDay.set(s.weekday, list)
    }

    for (const [weekday, list] of byDay.entries()) {
      const sorted = [...list].sort((a, b) => a.startMin - b.startMin)
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1]
        const cur = sorted[i]
        if (cur.startMin < prev.endMin) {
          throw new Error(`Turnos sobrepostos no dia ${weekday}.`)
        }
      }
    }

    await this.shifts.replaceAll(barberId, shifts)
    return this.shifts.listByBarber(barberId)
  }

  async listShifts(barberId: string) {
    return this.shifts.listByBarber(barberId)
  }
}