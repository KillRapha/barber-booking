import { prisma } from "@/lib/prisma"

export const serviceRepo = {
  listActive: () => prisma.service.findMany({ where: { active: true }, orderBy: { priceCents: "asc" } }),
  findById: (id: string) => prisma.service.findUnique({ where: { id } }),
}
