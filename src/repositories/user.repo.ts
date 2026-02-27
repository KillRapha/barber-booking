import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export class UserRepository {
  async findByCpf(cpf: string) {
    return prisma.user.findUnique({
      where: { cpf },
    })
  }

  async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({ data })
  }
}