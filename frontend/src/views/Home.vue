<script setup>
import { computed, onMounted } from 'vue'
import { useEmpresaStore } from '../stores/empresa'
import { useResultadoStore } from '../stores/resultado'
import { usePerguntasStore } from '../stores/perguntas'
import { useUsuario } from '../composables/useUsuario'
import { classeSeloNivel } from '../constants/niveis'
import Esqueleto from '../components/ui/Esqueleto.vue'

const empresaStore = useEmpresaStore()
const resultadoStore = useResultadoStore()
const perguntasStore = usePerguntasStore()
// mesmo nome da barra lateral (inclui o nome vindo do login com Google)
const { nome: nomeUsuario } = useUsuario()

const totalPerguntas = computed(() => perguntasStore.total)
const empresa = computed(() => empresaStore.dado ?? null)
const ultimoResultado = computed(() => resultadoStore.dado ?? null)
// esqueleto só quando ainda não há nada em cache
const carregando = computed(() => empresaStore.carregando || resultadoStore.carregando)

const passos = computed(() => [
  {
    titulo: 'Perfil de la empresa',
    selo: empresa.value ? 'Completado' : 'Pendiente',
    classeSelo: empresa.value ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
    texto: empresa.value
      ? null
      : 'Registra los datos básicos de tu organización para personalizar la evaluación.',
    link: { para: '/empresa', rotulo: empresa.value ? 'Editar datos' : 'Registrar empresa' }
  },
  {
    titulo: 'Cuestionario diagnóstico',
    selo: '4 dimensiones',
    classeSelo: 'bg-slate-100 text-slate-700',
    texto: `Responde ${totalPerguntas.value ? `las ${totalPerguntas.value}` : 'las'} preguntas distribuidas entre Gobernanza, Ambiental, Social y Económica.`,
    link: { para: '/diagnostico', rotulo: 'Responder cuestionario' }
  },
  {
    titulo: 'Resultados y análisis',
    selo: ultimoResultado.value ? `Nivel ${ultimoResultado.value.geral.nivel}` : 'Sin evaluar',
    classeSelo: ultimoResultado.value ? classeSeloNivel(ultimoResultado.value.geral.nivel) : 'bg-slate-100 text-slate-600',
    texto: ultimoResultado.value
      ? null
      : 'Visualiza tus gráficos de desempeño y las recomendaciones priorizadas.',
    link: { para: '/resultado', rotulo: 'Ver resultados' }
  }
])

onMounted(() => {
  empresaStore.carregar().catch((e) => console.error('Erro ao carregar empresa:', e))
  resultadoStore.carregar().catch((e) => console.error('Erro ao carregar resultado:', e))
  perguntasStore.carregar().catch((e) => console.error('Erro ao contar perguntas:', e))
})
</script>

<template>
  <div class="max-w-6xl mx-auto w-full py-1 sm:py-4 space-y-6 sm:space-y-8">
    <section class="bg-linear-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
      <div>
        <p class="text-xs font-bold uppercase tracking-widest text-emerald-200">Panel principal</p>
        <h1 class="text-2xl sm:text-3xl font-bold mt-1 text-balance">Hola, {{ nomeUsuario }}</h1>
        <p class="text-sm sm:text-base text-emerald-100 mt-2 max-w-xl">
          Evalúa el nivel de madurez en sostenibilidad de tu organización y descubre oportunidades concretas de mejora en las dimensiones Ambiental, Social, Económica y Gobernanza.
        </p>
      </div>
      <router-link
        :to="empresa ? '/diagnostico' : '/empresa'"
        class="w-full sm:w-auto inline-flex items-center justify-center bg-white text-emerald-900 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-md shrink-0"
      >
        {{ empresa ? 'Ir al diagnóstico →' : 'Registrar mi empresa →' }}
      </router-link>
    </section>

    <!-- Jornada em 3 passos -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6" :aria-busy="carregando">
      <template v-if="carregando">
        <div v-for="n in 3" :key="n" class="cartao p-6 space-y-4">
          <div class="flex justify-between">
            <Esqueleto class="w-8 h-8 rounded-lg" />
            <Esqueleto class="w-24 h-6 rounded-full" />
          </div>
          <Esqueleto class="h-6 w-3/4" />
          <Esqueleto class="h-4 w-full" />
          <Esqueleto class="h-4 w-2/3" />
        </div>
      </template>

      <article
        v-for="(passo, i) in passos"
        v-else
        :key="passo.titulo"
        class="cartao p-5 sm:p-6 flex flex-col justify-between"
      >
        <div>
          <div class="flex items-center justify-between mb-4">
            <span class="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">{{ i + 1 }}</span>
            <span class="text-xs font-semibold px-2.5 py-1 rounded-full" :class="passo.classeSelo">{{ passo.selo }}</span>
          </div>
          <h2 class="text-lg font-bold text-slate-800">{{ passo.titulo }}</h2>

          <p v-if="passo.texto" class="text-sm text-slate-500 mt-2">{{ passo.texto }}</p>
          <p v-else-if="i === 0" class="text-sm text-slate-600 mt-2">
            <strong>{{ empresa.nome }}</strong> ({{ empresa.setor }} · {{ empresa.num_funcionarios }} empleados)
          </p>
          <p v-else class="text-sm text-slate-600 mt-2">
            Última puntuación general: <strong>{{ ultimoResultado.geral.pontuacao }} / 100</strong>.
          </p>
        </div>
        <router-link :to="passo.link.para" class="text-sm font-bold text-emerald-800 hover:underline mt-6 inline-block">
          {{ passo.link.rotulo }} →
        </router-link>
      </article>
    </div>
  </div>
</template>
