import type { ReactNode } from "react"

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm rounded-[32px] border border-line bg-background p-5 shadow-soft">
        {children}
      </div>
    </div>
  )
}
