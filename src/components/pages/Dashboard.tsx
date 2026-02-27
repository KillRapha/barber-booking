"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

type BarberCard = {
  id: string
  name: string
  active: boolean
}

type ApiOk<T> = { ok: true; data: T }
type ApiErr = { ok: false; message: string }

function isOk<T>(v: unknown): v is ApiOk<T> {
  return typeof v === "object" && v !== null && (v as { ok?: unknown }).ok === true
}

function isErr(v: unknown): v is ApiErr {
  return typeof v === "object" && v !== null && (v as { ok?: unknown }).ok === false
}

function normalizeText(v: string) {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function Dashboard({ userName }: { userName: string }) {
  const router = useRouter()

  const [barbers, setBarbers] = useState<BarberCard[]>([])
  const [selectedBarberId, setSelectedBarberId] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const ac = new AbortController()

    async function load() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch("/api/barbers/public", {
          cache: "no-store",
          signal: ac.signal,
        })

        const json: unknown = await res.json()

        if (res.status === 401) {
          router.replace("/login")
          return
        }

        if (res.status === 403) {
          setBarbers([])
          setError("Acesso negado para listar barbeiros.")
          return
        }

        if (isOk<BarberCard[]>(json)) {
          const list = Array.isArray(json.data) ? json.data : []
          setBarbers(list)

          // Se o selecionado não existe mais, limpa
          if (selectedBarberId && !list.some((b) => b.id === selectedBarberId)) {
            setSelectedBarberId(null)
          }

          return
        }

        if (isErr(json)) {
          setBarbers([])
          setError(json.message)
          return
        }

        setBarbers([])
        setError("Resposta inesperada da API.")
      } catch (e) {
        if ((e as { name?: string })?.name === "AbortError") return
        setBarbers([])
        setError("Falha ao carregar barbeiros.")
      } finally {
        setLoading(false)
      }
    }

    load()
    return () => ac.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  const ordered = useMemo(() => {
    return [...barbers].sort((a, b) => {
      if (a.active !== b.active) return a.active ? -1 : 1
      return a.name.localeCompare(b.name, "pt-BR", { sensitivity: "base" })
    })
  }, [barbers])

  const filtered = useMemo(() => {
    const q = normalizeText(query)
    if (!q) return ordered
    return ordered.filter((b) => normalizeText(b.name).includes(q))
  }, [ordered, query])

  const countLabel = useMemo(() => {
    if (loading) return "—"
    return String(filtered.length)
  }, [filtered.length, loading])

  const activeCount = useMemo(() => {
    if (loading) return 0
    return filtered.filter((b) => b.active).length
  }, [filtered, loading])

  function handleSelectBarber(b: BarberCard) {
    if (!b.active) return
    setSelectedBarberId((prev) => (prev === b.id ? null : b.id))
  }

  function goNewAppointment() {
    const qs = selectedBarberId ? `?barberId=${selectedBarberId}` : ""
    router.push(`/appointments/new${qs}`)
  }

  return (
    <div className="px-5 pt-6 pb-10">
      {/* Header (sem botão Agendar) */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted">Bem-vinda,</p>
          <h1 className="truncate text-xl font-semibold text-text">{userName}</h1>
        </div>
      </div>

      {/* Meus agendamentos (Abrir mais nítido) */}
      <div className="mt-5">
        <button
          onClick={() => router.push("/appointments")}
          className="card flex w-full items-center justify-between px-4 py-4 text-left"
        >
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text">Meus agendamentos</p>
            <p className="mt-0.5 text-xs text-muted">Ver e gerenciar horários</p>
          </div>

          <span className="inline-flex items-center rounded-2xl bg-primary px-4 py-2 text-xs font-semibold text-primaryText shadow-sm">
            Abrir
          </span>
        </button>
      </div>

      {/* Busca */}
      <div className="mt-5">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M16.3 16.3 21 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar barbeiro..."
            className="input pl-10 pr-10"
            aria-label="Buscar barbeiro"
          />

          {query ? (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-muted hover:bg-border/40"
              aria-label="Limpar busca"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M7 7l10 10M7 17L17 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Título seção */}
      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text">Barbeiros</h2>

        <div className="flex items-center gap-2">
          {!loading ? (
            <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted">
              {activeCount} disponíveis
            </span>
          ) : null}

          <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-muted">
            {countLabel}
          </span>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="mt-4 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-sm text-text">
          {error}
        </div>
      )}

      {/* Loading (skeleton) */}
      {loading && (
        <div className="mt-4 space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-40 rounded bg-border/60" />
                  <div className="mt-2 h-3 w-24 rounded bg-border/50" />
                </div>
                <div className="h-10 w-28 rounded-2xl bg-border/60" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vazio */}
      {!loading && filtered.length === 0 && !error && (
        <div className="mt-4 card p-5">
          <p className="text-sm font-semibold text-text">Nenhum barbeiro encontrado</p>
          <p className="mt-1 text-sm text-muted">Tente ajustar a busca.</p>

          <div className="mt-4">
          </div>
        </div>
      )}

      {/* Lista (seleciona sem navegar) */}
      {!loading && filtered.length > 0 && (
        <div className="mt-4 space-y-3">
          {filtered.map((b) => {
            const selected = selectedBarberId === b.id

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => handleSelectBarber(b)}
                disabled={!b.active}
                className={cx(
                  "w-full text-left rounded-2xl border p-4 shadow-sm transition active:scale-[0.99]",
                  selected
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-surface",
                  !b.active && "opacity-60"
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-text">{b.name}</p>

                    <div className="mt-1 inline-flex items-center gap-2">
                      <span
                        className={cx("h-2 w-2 rounded-full", b.active ? "bg-success" : "bg-muted")}
                        aria-hidden="true"
                      />
                      <span className="text-xs text-muted">
                        {b.active ? "Disponível" : "Indisponível"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={cx(
                      "inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold",
                      selected
                        ? "bg-primary text-primaryText shadow-sm"
                        : "border border-border bg-surface text-text"
                    )}
                  >
                    {selected ? (
                      <>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M20 6 9 17l-5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        Selecionado
                      </>
                    ) : (
                      "Selecionar"
                    )}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* CTA fixo inferior (leva barberId se tiver selecionado) */}
      <div className="sticky bottom-0 mt-8 bg-bg/80 pb-2 pt-3 backdrop-blur">
        <button onClick={goNewAppointment} className="btn-primary w-full">
          Novo agendamento
        </button>

        {selectedBarberId ? (
          <button
            type="button"
            onClick={() => setSelectedBarberId(null)}
            className="mt-2 w-full rounded-2xl border border-border bg-surface py-3 text-sm font-semibold text-text hover:bg-border/40"
          >
            Limpar seleção
          </button>
        ) : null}
      </div>
    </div>
  )
}