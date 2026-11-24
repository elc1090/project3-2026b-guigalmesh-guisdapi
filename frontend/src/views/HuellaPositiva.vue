<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Icone from '../components/ui/Icone.vue'
import Pagina from '../components/ui/Pagina.vue'
import Esqueleto from '../components/ui/Esqueleto.vue'
import Alerta from '../components/ui/Alerta.vue'
import FormActividad from '../components/huella/FormActividad.vue'
import { useActividadesStore } from '../stores/actividades'
import { useEmpresaStore } from '../stores/empresa'
import { tiposActividad, fechasAmbientales, FUENTE_CALENDARIO, tipoPorId } from '../constants/huella'
import { proximasEfemerides, efemeridesDoAno, dataLocal, hojeLocal, paraTextoData, diasEntre } from '../lib/fechasAmbientales'
import { textoInvitacion } from '../lib/invitacion'
import { localeData } from '../i18n/rotulos'
import { ICONE_ARVORE, ICONE_CALENDARIO, ICONE_LAMPADA, ICONE_CHECK, ICONE_SETA } from '../constants/icones'

// Empresas que dejan huella positiva (seção 11 da proposta da turma do Chile):
// resumo do impacto, próximas datas ambientais, atividades da empresa e ideias de atividades.
const { t } = useI18n()
const store = useActividadesStore()
const empresaStore = useEmpresaStore()

const dados = computed(() => store.dado ?? null)
const carregando = computed(() => store.carregando)
const erroCarga = ref('')
const actividades = computed(() => dados.value?.actividades ?? [])
const resumen = computed(() => dados.value?.resumen ?? null)

// ---------- resumo do impacto ----------
const fmt = (n) => Number(n || 0).toLocaleString(localeData(), { maximumFractionDigits: 1 })
const INDICADORES = ['actividades_realizadas', 'participantes', 'kg_residuos', 'arboles_plantados', 'horas_voluntariado', 'espacios_recuperados']

// ---------- datas ambientais ----------
const hoje = hojeLocal()
const proximas = computed(() => proximasEfemerides(fechasAmbientales(), hoje, 6))
const verCalendario = ref(false)
const anoCalendario = hoje.getFullYear()
// nome do mês no idioma escolhido, com inicial maiúscula ("Enero" / "Janeiro")
const nomeMes = (m) => {
  const nome = new Date(2026, m, 1).toLocaleDateString(localeData(), { month: 'long' })
  return nome.charAt(0).toUpperCase() + nome.slice(1)
}
const calendarioPorMes = computed(() => {
  const grupos = Array.from({ length: 12 }, (_, m) => ({ nome: nomeMes(m), datas: [] }))
  efemeridesDoAno(fechasAmbientales(), anoCalendario).forEach((e) => grupos[e.data.getMonth()].datas.push(e))
  return grupos
})
const quando = (dias) => (dias === 0 ? t('huella.hoy') : dias === 1 ? t('huella.manana') : t('huella.enDias', { n: dias }))
const diaMes = (data) => ({ dia: data.getDate(), mes: nomeMes(data.getMonth()).slice(0, 3) })

// ---------- minhas atividades ----------
const planificadas = computed(() =>
  actividades.value.filter((a) => a.estado === 'planificada').sort((a, b) => a.fecha.localeCompare(b.fecha))
)
const realizadas = computed(() =>
  actividades.value.filter((a) => a.estado === 'realizada').sort((a, b) => b.fecha.localeCompare(a.fecha))
)
const fechaLarga = (texto) =>
  dataLocal(texto)?.toLocaleDateString(localeData(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) ?? ''
const atrasada = (a) => a.estado === 'planificada' && diasEntre(hoje, dataLocal(a.fecha)) < 0

// janela do formulário: null = fechada; objeto = valores iniciais
const formInicial = ref(null)
const formTitulo = ref('')
const abrirNova = (inicial = {}) => { formTitulo.value = ''; formInicial.value = { ...inicial } }
const editar = (a) => { formTitulo.value = ''; formInicial.value = { ...a } }
const marcarRealizada = (a) => { formTitulo.value = t('huella.registrarResultados'); formInicial.value = { ...a, estado: 'realizada' } }
const planificarEfemeride = (e) => abrirNova({
  tipo: e.tipo,
  titulo: `${tipoPorId(e.tipo).nombre} – ${e.nombre}`.slice(0, 120),
  fecha: paraTextoData(e.data)
})
const planificarTipo = (tipo) => abrirNova({ tipo: tipo.id, titulo: tipo.nombre })

const aviso = ref('')
let timerAviso = null
const mostrarAviso = (texto) => {
  aviso.value = texto
  clearTimeout(timerAviso)
  timerAviso = setTimeout(() => { aviso.value = '' }, 3500)
}
const aoSalvar = (salvo) => {
  formInicial.value = null
  mostrarAviso(salvo.estado === 'realizada' ? t('huella.avisoRegistrada') : t('huella.avisoPlanificada'))
}

// apagar com confirmação na própria linha
const confirmandoApagar = ref(null)
const erroAcao = ref('')
async function apagar(a) {
  erroAcao.value = ''
  try {
    await store.apagar(a.id)
    confirmandoApagar.value = null
    mostrarAviso(t('huella.avisoEliminada'))
  } catch (e) {
    if (e?.status !== 401) erroAcao.value = t('huella.erroEliminar')
  }
}

// copiar convite
const copiado = ref(null)
async function copiarInvitacion(a) {
  const texto = textoInvitacion(a, empresaStore.dado?.nome ?? '')
  try {
    await navigator.clipboard.writeText(texto)
    copiado.value = a.id
    setTimeout(() => { if (copiado.value === a.id) copiado.value = null }, 2500)
  } catch {
    erroAcao.value = t('huella.erroCopiar', { texto })
  }
}

const resultadosDe = (a) => [
  a.participantes ? t('huella.resParticipantes', { n: fmt(a.participantes) }) : '',
  Number(a.kg_residuos) ? t('huella.resKg', { n: fmt(a.kg_residuos) }) : '',
  a.arboles_plantados ? t('huella.resArboles', { n: fmt(a.arboles_plantados) }) : '',
  Number(a.horas_voluntariado) ? t('huella.resHoras', { n: fmt(a.horas_voluntariado) }) : '',
  a.espacio_recuperado ? t('huella.resEspacio', { e: a.espacio_recuperado }) : ''
].filter(Boolean)

onMounted(() => {
  empresaStore.carregar().catch((e) => console.error('Erro ao carregar empresa:', e))
  store.carregar().catch((e) => {
    if (e?.status === 401) return
    console.error('Erro ao carregar atividades:', e)
    if (store.dado === undefined) erroCarga.value = 'huella.erroCargar'
  })
})
</script>

<template>
  <Pagina
    :icone="ICONE_ARVORE"
    :titulo="t('huella.titulo')"
    :subtitulo="t('huella.subtitulo')"
    largura="larga"
  >
    <template #lateral>
      <button type="button" class="btn-primario btn-compacto w-full lg:w-auto" @click="abrirNova()">
        {{ t('huella.nueva') }}
      </button>
    </template>

    <p v-if="aviso" class="text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3" role="status">
      {{ aviso }}
    </p>

    <!-- 1. Resumo do impacto -->
    <section class="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-2xl p-5 sm:p-7 shadow-sm" aria-labelledby="titulo-impacto">
      <h2 id="titulo-impacto" class="text-lg sm:text-xl font-bold">{{ t('huella.impacto') }}</h2>
      <p class="text-emerald-100/90 text-sm mt-0.5">{{ t('huella.impactoTexto') }}</p>

      <div v-if="carregando" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mt-5" aria-busy="true">
        <Esqueleto v-for="n in 6" :key="n" class="h-20 bg-white/15!" />
      </div>
      <dl v-else-if="resumen" class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 mt-5">
        <div v-for="ind in INDICADORES" :key="ind" class="bg-white/10 border border-white/15 rounded-xl p-3 sm:p-4">
          <dt class="text-xs sm:text-sm text-emerald-100/90 leading-snug">{{ t(`huella.indicadores.${ind}`) }}</dt>
          <dd class="font-display text-2xl sm:text-3xl font-bold mt-1">{{ fmt(resumen[ind]) }}</dd>
        </div>
      </dl>
      <p v-if="resumen && resumen.actividades_realizadas === 0" class="text-sm text-emerald-50 mt-4">
        {{ t('huella.sinRealizadas') }}
      </p>
    </section>

    <Alerta v-if="erroCarga">{{ t(erroCarga) }}</Alerta>
    <Alerta v-if="erroAcao">{{ erroAcao }}</Alerta>

    <!-- 2. Próximas datas ambientais -->
    <section class="cartao p-5 sm:p-6" aria-labelledby="titulo-fechas">
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <span class="selo-icone"><Icone :d="ICONE_CALENDARIO" class="w-5 h-5" /></span>
        <div class="flex-1 min-w-0">
          <h2 id="titulo-fechas" class="text-lg font-semibold text-slate-800">{{ t('huella.proximasFechas') }}</h2>
          <p class="text-sm text-slate-500">{{ t('huella.proximasFechasTexto') }}</p>
        </div>
      </div>

      <ul class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        <li v-for="e in proximas" :key="e.nombre" class="flex gap-3 border border-slate-200/80 rounded-xl p-4">
          <div class="w-14 shrink-0 text-center rounded-xl bg-emerald-50 text-emerald-900 py-2">
            <p class="text-xl font-bold leading-none">{{ diaMes(e.data).dia }}</p>
            <p class="text-xs font-semibold uppercase mt-1">{{ diaMes(e.data).mes }}</p>
          </div>
          <div class="min-w-0 flex-1 flex flex-col gap-1.5">
            <div class="flex flex-wrap items-center gap-1.5">
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{{ quando(e.diasFaltando) }}</span>
              <span v-if="e.chile" class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">Chile</span>
            </div>
            <h3 class="font-semibold text-slate-800 leading-snug">{{ e.nombre }}</h3>
            <p class="text-sm text-slate-500">{{ e.sugerencia }}</p>
            <button type="button" class="mt-auto self-start inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:underline cursor-pointer" @click="planificarEfemeride(e)">
              {{ t('huella.planificarActividad') }}
              <Icone :d="ICONE_SETA" class="w-4 h-4" />
            </button>
          </div>
        </li>
      </ul>

      <div class="flex flex-wrap items-center justify-between gap-3 mt-4">
        <button type="button" class="text-sm font-semibold text-emerald-800 hover:underline cursor-pointer" :aria-expanded="verCalendario" @click="verCalendario = !verCalendario">
          {{ verCalendario ? t('huella.ocultarCalendario') : t('huella.verCalendario', { ano: anoCalendario }) }}
        </button>
        <a :href="FUENTE_CALENDARIO.url" target="_blank" rel="noopener noreferrer" class="text-xs text-slate-500 hover:text-emerald-800 hover:underline">
          {{ t('huella.fuente', { nome: FUENTE_CALENDARIO.nombre }) }}
        </a>
      </div>

      <div v-if="verCalendario" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
        <div v-for="mes in calendarioPorMes" :key="mes.nome" class="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2">{{ mes.nome }}</h3>
          <ul class="space-y-1.5">
            <li v-for="e in mes.datas" :key="e.nombre" class="flex gap-2 text-sm">
              <span class="w-6 shrink-0 font-bold text-slate-700 text-right">{{ e.data.getDate() }}</span>
              <span class="text-slate-600">
                {{ e.nombre }}
                <span v-if="e.chile" class="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-800">Chile</span>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- 3. Minhas atividades -->
    <section class="cartao p-5 sm:p-6" aria-labelledby="titulo-mis-actividades">
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <span class="selo-icone"><Icone :d="ICONE_ARVORE" class="w-5 h-5" /></span>
        <div class="flex-1 min-w-0">
          <h2 id="titulo-mis-actividades" class="text-lg font-semibold text-slate-800">{{ t('huella.misActividades') }}</h2>
          <p class="text-sm text-slate-500">{{ t('huella.misActividadesTexto') }}</p>
        </div>
        <button type="button" class="btn-secundario btn-compacto" @click="abrirNova()">{{ t('huella.nueva') }}</button>
      </div>

      <div v-if="carregando" class="space-y-3" aria-busy="true">
        <Esqueleto v-for="n in 2" :key="n" class="h-20 w-full" />
      </div>

      <p v-else-if="actividades.length === 0" class="text-sm text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl p-4">
        {{ t('huella.sinActividades') }}
      </p>

      <div v-else class="space-y-6">
        <div v-for="grupo in [{ titulo: t('huella.grupoProximas'), itens: planificadas }, { titulo: t('huella.grupoRealizadas'), itens: realizadas }]" :key="grupo.titulo">
          <template v-if="grupo.itens.length">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{{ grupo.titulo }} ({{ grupo.itens.length }})</h3>
            <ul class="space-y-3">
              <li v-for="a in grupo.itens" :key="a.id" class="border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <span class="hidden sm:flex w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 items-center justify-center shrink-0">
                  <Icone :d="tipoPorId(a.tipo).icone" class="w-5 h-5" />
                </span>
                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    <h4 class="font-semibold text-slate-800">{{ a.titulo }}</h4>
                    <span v-if="a.estado === 'realizada'" class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      <Icone :d="ICONE_CHECK" class="w-3 h-3" /> {{ t('huella.realizada') }}
                    </span>
                    <span v-else-if="atrasada(a)" class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{{ t('huella.atrasada') }}</span>
                    <span v-else class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">{{ t('huella.planificada') }}</span>
                  </div>
                  <p class="text-sm text-slate-500 mt-0.5 first-letter:uppercase">
                    {{ fechaLarga(a.fecha) }}<template v-if="a.lugar"> · {{ a.lugar }}</template>
                  </p>
                  <p class="text-xs text-slate-400 mt-0.5">{{ tipoPorId(a.tipo).nombre }}</p>
                  <ul v-if="a.estado === 'realizada' && resultadosDe(a).length" class="flex flex-wrap gap-1.5 mt-2">
                    <li v-for="r in resultadosDe(a)" :key="r" class="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-900 border border-emerald-100">{{ r }}</li>
                  </ul>

                  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm">
                    <template v-if="confirmandoApagar === a.id">
                      <span class="text-slate-700">{{ t('huella.confirmarEliminar') }}</span>
                      <button type="button" class="font-semibold text-red-700 hover:underline cursor-pointer" @click="apagar(a)">{{ t('huella.siEliminar') }}</button>
                      <button type="button" class="font-semibold text-slate-500 hover:underline cursor-pointer" @click="confirmandoApagar = null">{{ t('comum.cancelar') }}</button>
                    </template>
                    <template v-else>
                      <button v-if="a.estado === 'planificada'" type="button" class="font-semibold text-emerald-800 hover:underline cursor-pointer" @click="marcarRealizada(a)">
                        {{ t('huella.registrarResultados') }}
                      </button>
                      <button v-if="a.estado === 'planificada'" type="button" class="font-semibold text-emerald-800 hover:underline cursor-pointer" @click="copiarInvitacion(a)">
                        {{ copiado === a.id ? t('huella.copiada') : t('huella.copiar') }}
                      </button>
                      <button type="button" class="font-semibold text-slate-600 hover:underline cursor-pointer" @click="editar(a)">{{ t('comum.editar') }}</button>
                      <button type="button" class="font-semibold text-slate-500 hover:text-red-700 hover:underline cursor-pointer" @click="confirmandoApagar = a.id">{{ t('huella.eliminar') }}</button>
                    </template>
                  </div>
                </div>
              </li>
            </ul>
          </template>
        </div>
      </div>
    </section>

    <!-- 4. Ideias de atividades -->
    <section aria-labelledby="titulo-ideas" class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="selo-icone"><Icone :d="ICONE_LAMPADA" class="w-5 h-5" /></span>
        <div>
          <h2 id="titulo-ideas" class="text-lg font-semibold text-slate-800">{{ t('huella.ideas') }}</h2>
          <p class="text-sm text-slate-500">{{ t('huella.ideasTexto') }}</p>
        </div>
      </div>

      <ul class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <li v-for="tipo in tiposActividad().filter((x) => x.id !== 'otra')" :key="tipo.id" class="cartao p-5 flex flex-col gap-3">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Icone :d="tipo.icone" class="w-5 h-5" />
            </span>
            <h3 class="font-semibold text-slate-800 leading-snug">{{ tipo.nombre }}</h3>
          </div>
          <p class="text-sm text-slate-500">{{ tipo.descripcion }}</p>
          <ul class="space-y-1.5">
            <li v-for="c in tipo.consejos" :key="c" class="flex gap-2 text-sm text-slate-600">
              <span class="mt-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
              {{ c }}
            </li>
          </ul>
          <div class="mt-auto pt-1 flex flex-wrap items-center justify-between gap-2">
            <div class="flex flex-wrap gap-1.5">
              <span v-for="n in tipo.ods" :key="n" class="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">ODS {{ n }}</span>
            </div>
            <button type="button" class="inline-flex items-center gap-1 text-sm font-semibold text-emerald-800 hover:underline cursor-pointer" @click="planificarTipo(tipo)">
              {{ t('huella.planificar') }} <Icone :d="ICONE_SETA" class="w-4 h-4" />
            </button>
          </div>
        </li>
      </ul>

      <p class="flex gap-3 bg-sky-50 border border-sky-100 rounded-2xl p-4 text-sm text-sky-950">
        <strong class="shrink-0">{{ t('huella.importante') }}</strong>
        {{ t('huella.importanteTexto') }}
      </p>
    </section>

    <FormActividad v-if="formInicial" :inicial="formInicial" :titulo="formTitulo" @fechar="formInicial = null" @salvo="aoSalvar" />
  </Pagina>
</template>
