import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()

function onlyDigits(v: string) {
  return v.replace(/\D/g, "")
}

async function main() {
  // USERS
  const adminCpf = onlyDigits("12345678909")
  const clientCpf = onlyDigits("98765432100")

  const adminPasswordHash = await bcrypt.hash("Admin@123", 10)
  const clientPasswordHash = await bcrypt.hash("Client@123", 10)

  await prisma.user.upsert({
    where: { cpf: adminCpf },
    update: { name: "Administrador", passwordHash: adminPasswordHash },
    create: { name: "Administrador", cpf: adminCpf, passwordHash: adminPasswordHash },
  })

  await prisma.user.upsert({
    where: { cpf: clientCpf },
    update: { name: "Cliente", passwordHash: clientPasswordHash },
    create: { name: "Cliente", cpf: clientCpf, passwordHash: clientPasswordHash },
  })

  // SERVICES
  const services = [
    { code: "HAIRCUT", name: "Corte de Cabelo", durationMin: 60, priceCents: 4500 },
    { code: "BEARD", name: "Barba", durationMin: 30, priceCents: 2500 },
    { code: "COMBO", name: "Cabelo + Barba", durationMin: 90, priceCents: 6500 },
  ]

  for (const s of services) {
    await prisma.service.upsert({
      where: { code: s.code },
      update: { name: s.name, durationMin: s.durationMin, priceCents: s.priceCents, active: true },
      create: { ...s, active: true },
    })
  }

  // BARBERS
  const barberNames = ["Tom Marelli", "Dean Scott", "Melissa Bart"]
  const barbers = []

  for (const name of barberNames) {
    const existing = await prisma.barber.findFirst({ where: { name } })
    if (existing) {
      barbers.push(existing)
      continue
    }
    barbers.push(await prisma.barber.create({ data: { name, active: true } }))
  }

  // SHIFTS
  const weekdays = [1, 2, 3, 4, 5, 6]
  const shifts = [
    { startMin: 9 * 60, endMin: 12 * 60 },
    { startMin: 13 * 60, endMin: 18 * 60 },
  ]

  for (const barber of barbers) {
    await prisma.workShift.deleteMany({ where: { barberId: barber.id } })
    for (const wd of weekdays) {
      for (const sh of shifts) {
        await prisma.workShift.create({
          data: { barberId: barber.id, weekday: wd, startMin: sh.startMin, endMin: sh.endMin },
        })
      }
    }
  }

  console.log("Seed concluído.")
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
