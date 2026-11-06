import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { sessao, sair } from '../lib/auth'

// Dados do usuário logado e logout, usados no menu lateral e no "Más" do celular
export function useUsuario() {
  const router = useRouter()

  const metadados = computed(() => sessao.value?.user?.user_metadata ?? {})
  const email = computed(() => sessao.value?.user?.email || '')
  // "nome" vem do cadastro por e-mail; full_name/name vêm do login com Google
  const nome = computed(() =>
    metadados.value.nome || metadados.value.full_name || metadados.value.name || email.value.split('@')[0] || 'Usuario'
  )
  const inicial = computed(() => nome.value.charAt(0).toUpperCase())

  const sairDaConta = async () => {
    await sair()
    router.push('/login')
  }

  return { nome, email, inicial, sairDaConta }
}
