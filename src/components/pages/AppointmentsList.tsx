"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import type { AppointmentListItem } from "@/types/appointments"
import { minutesToHHmm } from "@/lib/date"

function money(cents: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100)
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

function formatDateBR(iso: string) {
  const parts = iso.split("-").map(Number)
  if (parts.length !== 3) return iso
  const [y, m, d] = parts
  if (!y || !m || !d) return iso
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

function StatusInline({ status }: { status: AppointmentListItem["status"] }) {
  const active = status === "SCHEDULED"
  return (
    <div className="inline-flex items-center gap-2 text-xs">
      <span className={cx("h-2 w-2 rounded-full", active ? "bg-success" : "bg-danger")} aria-hidden="true" />
      <span className={cx("font-semibold", active ? "text-muted" : "text-danger")}>
        {active ? "Ativo" : "Cancelado"}
      </span>
    </div>
  )
}

export function AppointmentsList() {
  const [items, setItems] = useState<AppointmentListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [filter, setFilter] = useState<"all" | "active" | "canceled">("active")
  const [cancelingId, setCancelingId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch("/api/appointments", { cache: "no-store" })
      const data = (await res.json()) as { items?: AppointmentListItem[]; error?: string }

      if (!res.ok) {
        setMessage(data.error ?? "Falha ao carregar.")
        setItems([])
        return
      }

      setItems(data.items ?? [])
    } catch {
      setMessage("Falha de rede ao carregar.")
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function cancel(id: string) {
    if (cancelingId) return
    setCancelingId(id)
    setMessage(null)

    try {
      const res = await fetch(`/api/appointments/${encodeURIComponent(id)}/cancel`, { method: "POST" })
      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        setMessage(data.error ?? "Não foi possível cancelar.")
        return
      }

      await load()
    } catch {
      setMessage("Falha de rede ao cancelar.")
    } finally {
      setCancelingId(null)
    }
  }

  const filtered = useMemo(() => {
    if (filter === "all") return items
    if (filter === "active") return items.filter((i) => i.status === "SCHEDULED")
    return items.filter((i) => i.status !== "SCHEDULED")
  }, [items, filter])

  return (
    <div className="px-5 py-6 pb-10">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm font-semibold text-text">Voltar</Link>
        <Link href="/api/auth/logout" className="text-sm font-semibold text-text">Sair</Link>
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <h1 className="text-2xl font-extrabold leading-tight text-text">Meus agendamentos</h1>
          <p className="mt-1 text-sm text-muted">Visualize e cancele se necessário</p>
        </div>

        <Link
          href="/appointments/new"
          className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-primary px-4 text-sm font-semibold text-primaryText shadow-sm transition active:scale-[0.99]"
        >
          Novo agendamento
        </Link>
      </div>

      {message ? (
        <div className="mt-4 rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
          {message}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-3 gap-2">
        {[
          { key: "active", label: "Ativos" },
          { key: "all", label: "Todos" },
          { key: "canceled", label: "Cancelados" },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key as typeof filter)}
            className={cx(
              "h-10 rounded-2xl border px-2 text-[13px] font-semibold transition whitespace-nowrap overflow-hidden",
              filter === f.key
                ? "border-primary/40 bg-primary/10 text-text"
                : "border-border bg-surface text-text hover:bg-border/40"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-4 space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="h-4 w-40 rounded bg-border/60" />
              <div className="mt-2 h-3 w-28 rounded bg-border/50" />
              <div className="mt-4 h-10 w-full rounded-2xl bg-border/60" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-4 card p-5">
          <p className="text-sm font-semibold text-text">Nenhum agendamento</p>
          <p className="mt-1 text-sm text-muted">
            {filter === "active"
              ? "Você não tem agendamentos ativos."
              : filter === "canceled"
                ? "Você não tem agendamentos cancelados."
                : "Você ainda não tem agendamentos."}
          </p>

          <div className="mt-4">
            <Link href="/appointments/new" className="btn-primary flex w-full items-center justify-center">
              Agendar agora
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((a) => {
            const isActive = a.status === "SCHEDULED"
            const isCanceling = cancelingId === a.id

            return (
              <div
                key={a.id}
                className={cx(
                  "card p-4",
                  !isActive && "border-danger/25 bg-danger/5"
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold leading-snug text-text break-words">
                      {a.serviceName}
                    </p>
                    <p className="mt-1 text-xs text-muted break-words">{a.barberName}</p>
                  </div>

                  <div className="shrink-0">
                    <StatusInline status={a.status} />
                  </div>
                </div>

                <div className="mt-4 space-y-1">
                  <p className="text-sm font-semibold text-text">{formatDateBR(a.date)}</p>
                  <p className="text-sm text-text">
                    {minutesToHHmm(a.startMin)} <span className="text-muted">({a.durationMin} min)</span>
                  </p>
                  <p className="pt-1 text-sm font-extrabold text-text">{money(a.totalPriceCents)}</p>
                </div>

                {isActive ? (
                  <button
                    type="button"
                    onClick={() => cancel(a.id)}
                    disabled={isCanceling}
                    className={cx(
                      "mt-4 inline-flex h-11 w-full items-center justify-center rounded-2xl border border-border bg-surface text-sm font-semibold text-text transition active:scale-[0.99]",
                      "hover:bg-border/40",
                      isCanceling && "opacity-60"
                    )}
                  >
                    {isCanceling ? "Cancelando..." : "Cancelar agendamento"}
                  </button>
                ) : null}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}