import { normalizeCpf } from "@/lib/cpf"
import { hashPassword, verifyPassword } from "@/lib/crypto"
import { signAuthToken } from "@/lib/jwt"
import type { AuthResult, LoginInput, PublicUser, RegisterInput } from "@/types/auth"
import { UserRepository } from "@/repositories/user.repo"

export class AuthService {
  private readonly users: UserRepository

  constructor(usersRepo?: UserRepository) {
    this.users = usersRepo ?? new UserRepository()
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const cpf = normalizeCpf(input.cpf)

    const exists = await this.users.findByCpf(cpf)
    if (exists) {
      throw new Error("CPF já cadastrado.")
    }

    const passwordHash = await hashPassword(input.password)

    const user = await this.users.create({
      name: input.name.trim(),
      cpf,
      passwordHash,
    })

    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
    }

    const token = signAuthToken({ sub: user.id })

    return { user: publicUser, token }
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const cpf = normalizeCpf(input.cpf)

    const user = await this.users.findByCpf(cpf)
    if (!user) {
      throw new Error("CPF ou senha inválidos.")
    }

    const ok = await verifyPassword(input.password, user.passwordHash)
    if (!ok) {
      throw new Error("CPF ou senha inválidos.")
    }

    const publicUser: PublicUser = {
      id: user.id,
      name: user.name,
      cpf: user.cpf,
    }

    const token = signAuthToken({ sub: user.id })

    return { user: publicUser, token }
  }
}