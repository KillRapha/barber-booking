"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

import { MdContentCut } from "react-icons/md"
import { GiBeard, GiRazor } from "react-icons/gi"

import type { BarberListItem } from "@/types/barbers"
import type { ServiceItem } from "@/types/services"
import type { AvailabilityResponse } from "@/types/availability"
import { minutesToHHmm, toISODateOnly } from "@/lib/date"

type ApiErr = { ok?: false; message?: string; error?: string }
type ApiOk<T> = { ok?: true; data?: T }

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function money(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

function normalizeList<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function getErrorMessage(json: unknown, fallback: string): string {
  if (!json || typeof json !== "object") return fallback
  const j = json as ApiErr
  return j.message ?? j.error ?? fallback
}

function formatDateBR(iso: string) {
  const [y, m, d] = iso.split("-").map(Number)
  if (!y || !m || !d) return iso
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

/**
 * IMPORTANTÍSSIMO:
 * Para não exibir horários já ocupados, a API precisa indicar isso.
 * Aqui eu considero indisponível se vier: available=false, booked=true, isAvailable=false.
 */
function slotIsUnavailable(slot: unknown): boolean {
  const s = slot as Record<string, unknown>
  if (s.available === false) return true
  if (s.booked === true) return true
  if (s.isAvailable === false) return true
  return false
}

function ServiceIcon({ code }: { code: string }) {
  const common = "h-6 w-6 text-primary"
  if (code === "HAIRCUT") return <MdContentCut className={common} aria-hidden="true" />
  if (code === "BEARD") return <GiBeard className={common} aria-hidden="true" />
  return <GiRazor className={common} aria-hidden="true" />
}

export function NewAppointment() {
  const router = useRouter()
  const search = useSearchParams()

  const preselectedBarberId = search.get("barberId") ?? ""
  const barberLocked = Boolean(preselectedBarberId)

  const [services, setServices] = useState<ServiceItem[]>([])
  const [barbers, setBarbers] = useState<BarberListItem[]>([])

  const [serviceId, setServiceId] = useState("")
  const [barberId, setBarberId] = useState(preselectedBarberId)
  const [date, setDate] = useState(() => toISODateOnly(new Date()))

  const [slots, setSlots] = useState<AvailabilityResponse["slots"]>([])
  const [startMin, setStartMin] = useState<number | null>(null)

  const [loadingBase, setLoadingBase] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  // Carrega barbeiros + serviços
  useEffect(() => {
    let alive = true

    const run = async () => {
      setLoadingBase(true)
      setMessage(null)

      try {
        const [bRes, sRes] = await Promise.all([
          fetch("/api/barbers/public", { cache: "no-store" }),
          fetch("/api/services", { cache: "no-store" }),
        ])

        const bJson = await safeJson(bRes)
        const sJson = await safeJson(sRes)

        if (!alive) return

        if (!bRes.ok) {
          setBarbers([])
          setMessage(getErrorMessage(bJson, "Falha ao carregar barbeiros."))
        } else {
          const obj = bJson as ApiOk<unknown> & { barbers?: unknown }
          setBarbers(normalizeList<BarberListItem>(obj.data ?? obj.barbers))
        }

        if (!sRes.ok) {
          setServices([])
          setMessage((prev) => prev ?? getErrorMessage(sJson, "Falha ao carregar serviços."))
        } else {
          const obj = sJson as ApiOk<unknown> & { services?: unknown }
          setServices(normalizeList<ServiceItem>(obj.data ?? obj.services))
        }
      } catch {
        if (!alive) return
        setBarbers([])
        setServices([])
        setMessage("Falha de rede ao carregar dados.")
      } finally {
        if (!alive) return
        setLoadingBase(false)
      }
    }

    run()
    return () => {
      alive = false
    }
  }, [])

  const service = useMemo(() => services.find((s) => s.id === serviceId) ?? null, [services, serviceId])
  const barber = useMemo(() => barbers.find((b) => b.id === barberId) ?? null, [barbers, barberId])

  // Carrega horários disponíveis
  useEffect(() => {
    let alive = true

    const load = async () => {
      if (!barberId) {
        setSlots([])
        setStartMin(null)
        return
      }

      setLoadingSlots(true)
      setStartMin(null)
      setMessage(null)

      try {
        const url = new URL("/api/availability", window.location.origin)
        url.searchParams.set("barberId", barberId)
        url.searchParams.set("date", date)

        const res = await fetch(url.toString(), { cache: "no-store" })
        const json = await safeJson(res)

        if (!alive) return

        if (!res.ok) {
          setSlots([])
          setMessage(getErrorMessage(json, "Falha ao carregar horários."))
          return
        }

        const data = json as AvailabilityResponse
        const list = Array.isArray(data?.slots) ? data.slots : []

        // Remove horários ocupados (se a API marcar)
        const availableOnly = list.filter((s) => !slotIsUnavailable(s))
        setSlots(availableOnly)
      } catch {
        if (!alive) return
        setSlots([])
        setMessage("Falha de rede ao carregar horários.")
      } finally {
        if (!alive) return
        setLoadingSlots(false)
      }
    }

    load()
    return () => {
      alive = false
    }
  }, [barberId, date])

  async function confirm() {
    try {
      if (!serviceId || !barberId || startMin === null) {
        setMessage("Selecione serviço, barbeiro e horário.")
        return
      }

      setMessage(null)

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, barberId, date, startMin }),
      })

      const json = await safeJson(res)

      if (!res.ok) {
        setMessage(getErrorMessage(json, "Não foi possível agendar."))
        return
      }

      router.push("/appointments")
    } catch {
      setMessage("Falha de rede ao confirmar agendamento.")
    }
  }

  const canConfirm = Boolean(serviceId && barberId && startMin !== null)
  const confirmLabel = service ? `Confirmar • ${money(service.priceCents)}` : "Confirmar agendamento"

  return (
    <div className="px-5 py-6 pb-[120px]">
      {/* Topo */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm font-semibold text-text">
          Voltar
        </Link>
        <div className="text-xs text-muted">Novo agendamento</div>
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {message}
        </div>
      ) : null}

      {/* SERVIÇO (horizontal + cards maiores) */}
      <section className="mt-6">
        <h1 className="text-lg font-extrabold text-text">Serviço</h1>
        <p className="mt-1 text-sm text-muted">Escolha um serviço</p>

        {loadingBase ? (
          <div className="mt-4 flex gap-3 overflow-hidden animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="card min-w-[160px] p-4">
                <div className="h-12 w-12 rounded-2xl bg-border/60" />
                <div className="mt-4 h-4 w-24 rounded bg-border/60" />
                <div className="mt-2 h-3 w-16 rounded bg-border/50" />
                <div className="mt-4 h-4 w-20 rounded bg-border/60" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 -mx-5 px-5">
            <div className="flex gap-3 overflow-x-auto pb-2">
              {services.map((s) => {
                const active = s.id === serviceId
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setServiceId(s.id)}
                    className={cx(
                      "card min-w-[170px] p-4 text-left transition active:scale-[0.99]",
                      active && "border-primary/40 bg-primary/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10">
                        <ServiceIcon code={s.code} />
                      </div>

                      {active ? (
                        <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primaryText">
                          Selecionado
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-4 text-sm font-semibold text-text">{s.name}</p>

                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs text-muted">{s.durationMin} min</p>
                      <p className="text-sm font-extrabold text-text">{money(s.priceCents)}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* DETALHES */}
      <section className="mt-7">
        <h2 className="text-lg font-extrabold text-text">Detalhes</h2>
        <p className="mt-1 text-sm text-muted">Barbeiro, data e horário</p>

        <div className="mt-4 space-y-3">
          {/* Barbeiro (travado se veio no query param) */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted">Barbeiro</p>
              {barberLocked ? (
                <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] text-muted">
                  Selecionado no painel
                </span>
              ) : null}
            </div>

            {barberLocked ? (
              <div className="mt-2 flex h-12 items-center rounded-2xl border border-border bg-surface px-3 text-sm text-text">
                {barber?.name ?? "Carregando..."}
              </div>
            ) : (
              <select
                className="mt-2 h-12 w-full rounded-2xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary/40"
                value={barberId}
                onChange={(e) => setBarberId(e.target.value)}
              >
                <option value="">Selecione...</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id} disabled={!b.active}>
                    {b.name}
                    {!b.active ? " (indisponível)" : ""}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Data */}
          <div className="card p-4">
            <p className="text-xs font-semibold text-muted">Data</p>
            <input
              type="date"
              className="mt-2 h-12 w-full rounded-2xl border border-border bg-surface px-3 text-sm text-text outline-none focus:border-primary/40"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className="mt-2 text-xs text-muted">{formatDateBR(date)}</p>
          </div>

          {/* Horários */}
          <div className="card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted">Horário</p>
              {loadingSlots ? <span className="text-xs text-muted">Carregando...</span> : null}
            </div>

            {!barberId ? (
              <p className="mt-3 text-sm text-muted">Selecione um barbeiro para ver os horários.</p>
            ) : loadingSlots ? (
              <div className="mt-4 grid grid-cols-3 gap-2 animate-pulse">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="h-11 rounded-2xl bg-border/60" />
                ))}
              </div>
            ) : slots.length === 0 ? (
              <p className="mt-3 text-sm text-muted">Sem horários disponíveis para esta data.</p>
            ) : (
              <div className="mt-4 grid grid-cols-3 gap-2">
                {slots.map((s) => {
                  const active = startMin === s.startMin
                  return (
                    <button
                      key={s.startMin}
                      type="button"
                      onClick={() => setStartMin(s.startMin)}
                      className={cx(
                        "h-11 rounded-2xl border px-3 text-sm font-semibold transition active:scale-[0.99]",
                        active
                          ? "border-primary bg-primary text-primaryText shadow-sm"
                          : "border-border bg-surface text-text hover:bg-border/40"
                      )}
                    >
                      {s.label}
                    </button>
                  )
                })}
              </div>
            )}

            {barber && startMin !== null ? (
              <p className="mt-3 text-xs text-muted">
                {barber.name} • {formatDateBR(date)} • {minutesToHHmm(startMin)}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Resumo */}
      <section className="mt-7">
        <div className="card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-muted">Resumo</p>
              <p className="mt-1 text-sm font-semibold text-text">
                {service ? service.name : "Selecione um serviço"}
              </p>
              <p className="mt-1 text-xs text-muted">
                {barber ? barber.name : "Selecione um barbeiro"}
                {startMin !== null ? ` • ${minutesToHHmm(startMin)}` : ""}
              </p>
              <p className="mt-1 text-xs text-muted">{formatDateBR(date)}</p>
            </div>

            <div className="text-right">
              <p className="text-xs font-semibold text-muted">Total</p>
              <p className="mt-1 text-sm font-extrabold text-text">
                {service ? money(service.priceCents) : "—"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA (sempre visível) */}
      <div className="fixed bottom-0 left-0 right-0 bg-bg/90 backdrop-blur border-t border-border">
        <div className="mx-auto w-full max-w-md px-5 pb-[max(env(safe-area-inset-bottom),12px)] pt-3">
          <button
            type="button"
            onClick={confirm}
            disabled={!canConfirm}
            className={cx(
              "w-full h-12 rounded-2xl text-sm font-semibold transition active:scale-[0.99]",
              canConfirm
                ? "bg-primary text-primaryText shadow-sm"
                : "border border-border bg-surface text-muted opacity-70"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}