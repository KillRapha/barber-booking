import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Barber Booking",
  description: "Agendamento mobile-first para barbearia",
  themeColor: "#2563EB",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`h-full ${inter.variable}`}>
      <body className="min-h-full bg-bg text-text [font-family:var(--font-sans)]">
        {children}
      </body>
    </html>
  )
}