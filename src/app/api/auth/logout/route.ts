import { cookies } from "next/headers"

const COOKIE_NAME = "session"

export async function POST(): Promise<Response> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })

  return Response.json({ ok: true })
}