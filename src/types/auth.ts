export type PublicUser = {
  id: string
  name: string
  cpf: string
}

export type AuthResult = {
  user: PublicUser
  token: string
}

export type RegisterInput = {
  name: string
  cpf: string
  password: string
}

export type LoginInput = {
  cpf: string
  password: string
}