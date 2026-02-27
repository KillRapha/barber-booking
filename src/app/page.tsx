import Link from "next/link"
import { PhoneFrame } from "@/components/layout/PhoneFrame"

export default function HomePage() {
  return (
    <PhoneFrame>
      <div className="flex min-h-[620px] flex-col px-6 py-10">
        {/* Topo */}
        <header className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-border bg-surface shadow-sm">
            {/* Ícone (SVG) */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary"
              aria-hidden="true"
            >
              <path
                d="M7 7l10 10M7 17L17 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M6 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM18 20a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="leading-tight">
            <p className="text-sm font-semibold text-text">Barber Booking</p>
            <p className="text-xs text-muted">Agendamento rápido</p>
          </div>
        </header>

        {/* Conteúdo */}
        <main className="flex flex-1 flex-col justify-center">
          <h1 className="text-4xl font-extrabold leading-[1.05] text-text">
            Agende seu horário
            <br />
            com rapidez.
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-muted">
            Faça login para agendar e gerenciar seus horários.
          </p>

          {/* ÚNICO botão */}
          <div className="mt-10">
            <Link
              href="/login"
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-primaryText font-medium shadow-sm transition-colors active:scale-[0.99]"
            >
              Entrar
            </Link>
          </div>
        </main>

        {/* Rodapé */}
        <footer className="pt-6 text-center text-xs text-muted">
          Acesso com CPF e senha
        </footer>
      </div>
    </PhoneFrame>
  )
}