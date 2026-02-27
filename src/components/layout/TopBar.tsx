import Link from "next/link"

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-xl font-extrabold leading-tight">{title}</h1>
        {subtitle ? <p className="text-sm text-muted">{subtitle}</p> : null}
      </div>
      <Link
        href="/appointments"
        className="rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold"
      >
        Meus horários
      </Link>
    </div>
  )
}
