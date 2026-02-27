import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { PhoneFrame } from "@/components/layout/PhoneFrame"
import { Dashboard } from "@/components/pages/Dashboard"

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")

  // ✅ ADMIN vai para o painel
  if (user.role === "ADMIN") redirect("/admin")

  return (
    <PhoneFrame>
      <Dashboard userName={user.name} />
    </PhoneFrame>
  )
}