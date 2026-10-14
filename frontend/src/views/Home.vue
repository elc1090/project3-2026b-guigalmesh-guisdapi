<script setup>
import { ref, computed, onMounted } from 'vue'
import { sessao } from '../lib/auth'
import { apiFetch } from '../lib/api'

const empresa = ref(null)
const ultimoResultado = ref(null)
const carregando = ref(true)

const nomeUsuario = computed(() => {
  return sessao.value?.user?.user_metadata?.nome || 'bienvenido(a)'
})

onMounted(async () => {
  try {
    const [resEmp, resDiag] = await Promise.all([
      apiFetch('/api/empresa'),
      apiFetch('/api/diagnostico/resultado')
    ])
    if (resEmp.ok) empresa.value = await resEmp.json()
    if (resDiag.ok) ultimoResultado.value = await resDiag.json()
  } catch (e) {
    console.error('Erro ao carregar resumo inicial:', e)
  } finally {
    carregando.value = false
  }
})
</script>

<template>
  <div class="max-w-5xl mx-auto py-6 px-4 space-y-8">
    <!-- Banner de Boas-vindas -->
    <div class="bg-emerald-800 text-white rounded-3xl p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      <div>
        <span class="text-xs font-bold uppercase tracking-widest text-emerald-200">Panel principal</span>
        <h1 class="text-3xl font-bold mt-1">Hola, {{ nomeUsuario }}</h1>
        <p class="text-emerald-100 mt-2 max-w-xl">
          Evalúa el nivel de madurez en sostenibilidad de tu organización y descubre oportunidades concretas de mejora en las dimensiones Ambiental, Social, Económica y Gobernanza.
        </p>
      </div>

      <router-link
        :to="empresa ? '/diagnostico' : '/empresa'"
        class="bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-md shrink-0"
      >
        {{ empresa ? 'Ir al diagnóstico →' : 'Registrar mi empresa →' }}
      </router-link>
    </div>

    <div v-if="carregando" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-800"></div>
      <span class="ml-3 text-slate-500 font-medium">Cargando información...</span>
    </div>

    <template v-else>
      <!-- Jornada em 3 Passos -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Passo 1: Empresa -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">1</span>
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="empresa ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'"
              >
                {{ empresa ? 'Completado' : 'Pendiente' }}
              </span>
            </div>
            <h2 class="text-lg font-bold text-slate-800">Perfil de la empresa</h2>
            <p v-if="empresa" class="text-sm text-slate-600 mt-2">
              <strong>{{ empresa.nome }}</strong> ({{ empresa.setor }} · {{ empresa.num_funcionarios }} empleados)
            </p>
            <p v-else class="text-sm text-slate-500 mt-2">
              Registra los datos básicos de tu organización para personalizar la evaluación.
            </p>
          </div>
          <router-link to="/empresa" class="text-sm font-bold text-emerald-800 hover:underline mt-6 inline-block">
            {{ empresa ? 'Editar datos →' : 'Registrar empresa →' }}
          </router-link>
        </div>

        <!-- Passo 2: Diagnóstico -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">2</span>
              <span class="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                4 dimensiones
              </span>
            </div>
            <h2 class="text-lg font-bold text-slate-800">Cuestionario diagnóstico</h2>
            <p class="text-sm text-slate-500 mt-2">
              Responde las 20 preguntas distribuidas entre Gobernanza, Ambiental, Social y Económica.
            </p>
          </div>
          <router-link to="/diagnostico" class="text-sm font-bold text-emerald-800 hover:underline mt-6 inline-block">
            Responder cuestionario →
          </router-link>
        </div>

        <!-- Passo 3: Resultado -->
        <div class="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">3</span>
              <span
                class="text-xs font-semibold px-2.5 py-1 rounded-full"
                :class="ultimoResultado ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'"
              >
                {{ ultimoResultado ? `Nivel ${ultimoResultado.geral.nivel}` : 'Sin evaluar' }}
              </span>
            </div>
            <h2 class="text-lg font-bold text-slate-800">Resultados y análisis</h2>
            <p v-if="ultimoResultado" class="text-sm text-slate-600 mt-2">
              Última puntuación general: <strong>{{ ultimoResultado.geral.pontuacao }} / 100</strong>.
            </p>
            <p v-else class="text-sm text-slate-500 mt-2">
              Visualiza tus gráficos de desempeño y las recomendaciones priorizadas.
            </p>
          </div>
          <router-link to="/resultado" class="text-sm font-bold text-emerald-800 hover:underline mt-6 inline-block">
            Ver resultados →
          </router-link>
        </div>
      </div>
    </template>
  </div>
</template>