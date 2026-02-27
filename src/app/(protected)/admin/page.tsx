import { redirect } from "next/navigation"
import { requireAdmin } from "@/lib/authz"
import { PhoneFrame } from "@/components/layout/PhoneFrame"

export default async function AdminHome() {
  await requireAdmin()

  return (
    <PhoneFrame>
      <div className="px-5 pt-6 pb-10">
        <h1 className="text-xl font-semibold text-zinc-900">Painel Admin</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Gerencie barbeiros, turnos e serviços.
        </p>

        <div className="mt-6 space-y-3">
          <a
            href="/admin/barbers"
            className="block rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-900"
          >
            Barbeiros
          </a>
          <a
            href="/admin/services"
            className="block rounded-2xl border border-zinc-200 bg-white p-4 text-sm font-semibold text-zinc-900"
          >
            Serviços
          </a>
        </div>
      </div>
    </PhoneFrame>
  )
}