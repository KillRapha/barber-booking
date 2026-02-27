import type { InputHTMLAttributes } from "react"
import { cn } from "@/components/ui/cn"

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: Props) {
  return (
    <label className="block space-y-2">
      {label ? <span className="text-sm font-semibold text-ink">{label}</span> : null}
      <input
        className={cn(
          "w-full rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-ink/30",
          className
        )}
        {...props}
      />
      {error ? <span className="block text-xs text-red-600">{error}</span> : null}
    </label>
  )
}
