"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/Input"

type FieldErrors = Partial<Record<"cpf" | "password", string>>

export function LoginForm() {
  const router = useRouter()

  const [cpf, setCpf] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function onSubmit() {
    if (loading) return

    setLoading(true)
    setErrors({})
    setMessage(null)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, password }),
      })

      const data = (await res.json()) as {
        error?: string
        fieldErrors?: FieldErrors
      }

      if (!res.ok) {
        if (data.fieldErrors) setErrors(data.fieldErrors)
        setMessage(data.error ?? "Não foi possível entrar. Verifique os dados.")
        return
      }

      router.push("/dashboard")
    } catch {
      setMessage("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-extrabold text-text">Entrar</h1>
        <p className="text-sm text-muted">Acesse com CPF e senha</p>
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
      >
        <Input
          label="CPF"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          error={errors.cpf}
          autoComplete="username"
        />

        <Input
          label="Senha"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          autoComplete="current-password"
        />

        {message ? (
          <div className="rounded-2xl border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">
            {message}
          </div>
        ) : null}

        <div className="space-y-3 pt-2">
          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <Link
            href="/register"
            className="btn-ghost flex w-full items-center justify-center"
          >
            Criar conta
          </Link>
        </div>
      </form>
    </div>
  )
}