import { cookies } from "next/headers"
import { AuthService } from "@/services/auth.service"
import { loginSchema } from "@/validators/auth.validators"

const COOKIE_NAME = "session"

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json()
    const input = loginSchema.parse(body)

    const auth = new AuthService()
    const result = await auth.login(input)

    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return Response.json({ ok: true, user: result.user })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro inesperado ao logar"
    return Response.json({ ok: false, message }, { status: 401 })
  }
}