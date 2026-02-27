export type AvailabilityResponse = {
  barberId: string
  date: string // YYYY-MM-DD
  slots: Array<{ startMin: number; label: string }>
}
