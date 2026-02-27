import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { PhoneFrame } from "@/components/layout/PhoneFrame"
import { NewAppointment } from "@/components/pages/NewAppointment"

export default async function NewAppointmentPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  return (
    <PhoneFrame>
      <NewAppointment />
    </PhoneFrame>
  )
}
