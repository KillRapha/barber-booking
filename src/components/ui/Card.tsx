import type { ReactNode } from "react"
import { cn } from "@/components/ui/cn"

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl2 bg-white border border-line shadow-soft", className)}>{children}</div>
}
