import type { ButtonHTMLAttributes } from "react"
import { cn } from "@/components/ui/cn"

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost"
  full?: boolean
}

export function Button({ className, variant = "primary", full, ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary: "bg-brand text-white shadow-soft",
    secondary: "bg-white text-ink border border-line",
    ghost: "bg-transparent text-ink",
  }
  return (
    <button
      className={cn(base, variants[variant], full ? "w-full" : "", className)}
      {...props}
    />
  )
}
