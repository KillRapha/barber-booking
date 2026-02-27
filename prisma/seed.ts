import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "")
}

async function main(): Promise<void> {
  // ✅ ADMIN (troque para um CPF válido seu)
  const adminCpf = normalizeCpf("12345678909")
  const adminPassword = "Admin@123"
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12)

  await prisma.user.upsert({
    where: { cpf: adminCpf },
    update: {
      name: "Administrador",
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
    create: {
      name: "Administrador",
      cpf: adminCpf,
      role: "ADMIN",
      passwordHash: adminPasswordHash,
    },
  })

  // ✅ Services
  const services = [
    { code: "HAIRCUT", name: "Corte de Cabelo", durationMin: 60, priceCents: 4500 },
    { code: "BEARD", name: "Barba", durationMin: 30, priceCents: 2500 },
    { code: "COMBO", name: "Cabelo + Barba", durationMin: 90, priceCents: 6500 },
  ] as const

  for (const s of services) {
    await prisma.service.upsert({
      where: { code: s.code },
      update: {
        name: s.name,
        durationMin: s.durationMin,
        priceCents: s.priceCents,
        active: true,
      },
      create: {
        code: s.code,
        name: s.name,
        durationMin: s.durationMin,
        priceCents: s.priceCents,
        active: true,
      },
    })
  }

  // ✅ Barbers
  const barberNames = ["Tom Marelli", "Dean Scott", "Melissa Bart"] as const
  const barbers = []

  for (const name of barberNames) {
    const barber = await prisma.barber.upsert({
      where: { name },
      update: { active: true },
      create: { name, active: true },
    })
    barbers.push(barber)
  }

  // ✅ Shifts: Mon-Sat 09:00-12:00 and 13:00-18:00
  const weekdays = [1, 2, 3, 4, 5, 6] as const
  const shifts = [
    { startMin: 9 * 60, endMin: 12 * 60 },
    { startMin: 13 * 60, endMin: 18 * 60 },
  ] as const

  for (const barber of barbers) {
    for (const wd of weekdays) {
      for (const sh of shifts) {
        await prisma.workShift.upsert({
          where: {
            barberId_weekday_startMin_endMin: {
              barberId: barber.id,
              weekday: wd,
              startMin: sh.startMin,
              endMin: sh.endMin,
            },
          },
          update: {},
          create: {
            barberId: barber.id,
            weekday: wd,
            startMin: sh.startMin,
            endMin: sh.endMin,
          },
        })
      }
    }
  }

  console.log("✅ Seed concluído.")
  console.log("✅ Admin:")
  console.log(`CPF: ${adminCpf}`)
  console.log(`Senha: ${adminPassword}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })