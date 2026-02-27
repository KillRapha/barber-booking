import { prisma } from "@/lib/prisma"
import type { Barber } from "@prisma/client"

export class BarberRepository {
  async listActive(): Promise<Barber[]> {
    return prisma.barber.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    })
  }

  async listAll(): Promise<Barber[]> {
    return prisma.barber.findMany({
      orderBy: { name: "asc" },
    })
  }

  async findById(id: string): Promise<Barber | null> {
    return prisma.barber.findUnique({
      where: { id },
    })
  }

  async existsActive(id: string): Promise<boolean> {
    const barber = await prisma.barber.findFirst({
      where: { id, active: true },
      select: { id: true },
    })

    return !!barber
  }

  async create(name: string): Promise<Barber> {
    return prisma.barber.create({
      data: {
        name,
        active: true,
      },
    })
  }

  async setActive(id: string, active: boolean): Promise<Barber> {
    return prisma.barber.update({
      where: { id },
      data: { active },
    })
  }
}

/**
 * Singleton instance (padrão recomendado)
 * Evita múltiplas instâncias espalhadas pelo sistema
 */
export const barberRepo = new BarberRepository()