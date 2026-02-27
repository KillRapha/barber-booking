export function normalizeCpf(value: string): string {
  return value.replace(/\D/g, "")
}

export function isValidCpf(raw: string): boolean {
  const cpf = normalizeCpf(raw)
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  const calcDigit = (base: string, factor: number): number => {
    let sum = 0
    for (let i = 0; i < base.length; i++) sum += Number(base[i]) * (factor - i)
    const mod = sum % 11
    return mod < 2 ? 0 : 11 - mod
  }

  const d1 = calcDigit(cpf.slice(0, 9), 10)
  const d2 = calcDigit(cpf.slice(0, 10), 11)
  return cpf === cpf.slice(0, 9) + String(d1) + String(d2)
}
