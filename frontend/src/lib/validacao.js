// Validações simples dos formulários (a validação de verdade é do Supabase/back-end)
export const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

export const SENHA_MINIMO = 6

// 0 = vazia, 1 = débil, 2 = media, 3 = fuerte
export function forcaSenha(senha) {
  if (!senha) return 0
  if (senha.length < SENHA_MINIMO) return 1
  let pontos = 1
  if (senha.length >= 10) pontos++
  if (/[a-zA-Z]/.test(senha) && /\d/.test(senha) && /[^a-zA-Z0-9]/.test(senha)) pontos++
  else if (/[a-zA-Z]/.test(senha) && /\d/.test(senha) && senha.length >= 8) pontos++
  return Math.min(pontos, 3)
}

// foco no primeiro campo com erro (pelo id)
export function focarPrimeiroErro(erros) {
  const campo = Object.keys(erros).find((id) => erros[id])
  if (campo) document.getElementById(campo)?.focus()
}
