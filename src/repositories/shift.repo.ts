import { prisma } from "@/lib/prisma"

export type ShiftInput = {
  weekday: number
  startMin: number
  endMin: number
}

export class ShiftRepository {
  async replaceAll(barberId: string, shifts: ShiftInput[]) {
    return prisma.$transaction(async (tx) => {
      await tx.workShift.deleteMany({ where: { barberId } })
      await tx.workShift.createMany({
        data: shifts.map((s) => ({ barberId, ...s })),
      })
    })
  }

  listByBarber(barberId: string) {
    return prisma.workShift.findMany({
      where: { barberId },
      orderBy: [{ weekday: "asc" }, { startMin: "asc" }],
    })
  }

  // ✅ necessário para availability.service.ts
  listByBarberAndWeekday(barberId: string, weekday: number) {
    return prisma.workShift.findMany({
      where: { barberId, weekday },
      orderBy: { startMin: "asc" },
    })
  }
}

export const shiftRepo = new ShiftRepository()