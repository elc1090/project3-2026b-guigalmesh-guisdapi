<template>
  <div class="grid grid-cols-4 gap-8 h-full w-full">

    <CardCategory title="Gobernanza" route="/diagnostico/gobernanza">
      <IconGobernanza class="w-36 h-36 stroke-emerald-800" />
    </CardCategory>

    <CardCategory title="Ambiental" route="/diagnostico/ambiental">
      <IconAmbiental class="w-36 h-36 stroke-emerald-800" />
    </CardCategory>

    <CardCategory title="Social" route="/diagnostico/social">
      <IconSocial class="w-36 h-36 stroke-emerald-800" />
    </CardCategory>

    <CardCategory title="Económica" route="/diagnostico/economica">
      <IconEconomica class="w-36 h-36 stroke-emerald-800" />
    </CardCategory>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../../lib/api'
import CardCategory from '../../components/CardCategory.vue'
import IconGobernanza from '../../components/ui/IconGobernanza.vue'
import IconEconomica from '../../components/ui/IconEconomica.vue'
import IconAmbiental from '../../components/ui/IconAmbiental.vue'
import IconSocial from '../../components/ui/IconSocial.vue'

const router = useRouter()

const respostas = ref({
  pergunta1: '1',
  pergunta2: '1'
})

const resultado = ref(null)
const erro = ref('')

const enviarRespostas = async () => {
  erro.value = ''
  resultado.value = null

  try {
    const response = await apiFetch('/api/diagnostico', {
      method: 'POST',
      body: JSON.stringify(respostas.value)
    })

    // Sessão ausente ou expirada: manda para o login
    if (response.status === 401 || response.status === 403) {
      router.push('/login')
      return
    }

    const data = await response.json()

    if (!response.ok) {
      console.error('Erro do back-end:', data)
      erro.value = 'No fue posible guardar el resultado. Inténtalo de nuevo.'
      return
    }

    resultado.value = data
  } catch (e) {
    console.error('Erro de comunicação com o Back-end:', e)
    erro.value = 'No se pudo conectar con el servidor.'
  }
}
</script>
