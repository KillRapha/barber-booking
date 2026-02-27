import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { PhoneFrame } from "@/components/layout/PhoneFrame"
import { AppointmentsList } from "@/components/pages/AppointmentsList"

export default async function AppointmentsPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return (
    <PhoneFrame>
      <AppointmentsList />
    </PhoneFrame>
  )
}
