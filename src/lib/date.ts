export function minutesToHHmm(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0")
}

export function hhmmToMinutes(value: string): number {
  const [h, m] = value.split(":").map((x) => Number(x))
  return h * 60 + m
}

export function toISODateOnly(d: Date): string {
  // YYYY-MM-DD
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

export function parseISODateOnly(value: string): Date {
  // Use Date at midnight local, but DB uses @db.Date (no time).
  const [y, m, d] = value.split("-").map((x) => Number(x))
  return new Date(y, m - 1, d)
}

export function weekday0Sun(d: Date): number {
  return d.getDay()
}
