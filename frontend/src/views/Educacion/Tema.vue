<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import Icone from '../../components/ui/Icone.vue'
import Pagina from '../../components/ui/Pagina.vue'
import { temas } from '../../constants/educacion'
import { ICONE_CHECK, ICONE_LAMPADA, ICONE_SETA } from '../../constants/icones'

// Página de um tema da Educación sostenible (/educacion/:tema). O conteúdo vem de constants/educacion.js.
const ExploradorOds = defineAsyncComponent(() => import('../../components/educacion/ExploradorOds.vue'))

const ICONE_VOLTAR = ['M19 12H5', 'm12 19-7-7 7-7']
const ICONE_LINK_EXTERNO = ['M15 3h6v6', 'M10 14 21 3', 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6']
const ICONE_INFO = ['M12 16v-4', 'M12 8h.01', 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0z']

const route = useRoute()
const { t } = useI18n()

// a rota só aceita slugs existentes, então o tema sempre é encontrado
const lista = computed(() => temas())
const indice = computed(() => lista.value.findIndex((x) => x.slug === route.params.tema))
const tema = computed(() => lista.value[indice.value])
const anterior = computed(() => lista.value[indice.value - 1] ?? null)
const seguinte = computed(() => lista.value[indice.value + 1] ?? null)
</script>

<template>
  <Pagina
    v-if="tema"
    :icone="tema.icone"
    :sobretitulo="t('educacion.sobretitulo', { n: indice + 1, total: lista.length })"
    :titulo="tema.titulo"
    :largura="tema.componente === 'ods' ? 'larga' : 'normal'"
  >
    <template #antes>
      <router-link to="/educacion" class="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:underline">
        <Icone :d="ICONE_VOLTAR" class="w-4 h-4" />
        {{ t('educacion.volver') }}
      </router-link>
    </template>

    <p class="text-slate-600 text-base sm:text-lg max-w-4xl">{{ tema.intro }}</p>

    <!-- tema especial: os 17 ODS com filtro por dimensão -->
    <ExploradorOds v-if="tema.componente === 'ods'" />

    <!-- cartões de conteúdo: em colunas tipo "mural" (alturas diferentes sem buracos);
         tema.columnas = 3 usa grade de 3 colunas (ex.: as três dimensões) -->
    <div
      v-if="tema.bloques?.length"
      :class="tema.columnas === 3
        ? 'grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6'
        : 'md:columns-2 gap-4 sm:gap-6 space-y-4 sm:space-y-6'"
    >
      <section
        v-for="bloque in tema.bloques"
        :key="bloque.titulo"
        class="cartao p-5 sm:p-6 flex flex-col gap-3 break-inside-avoid"
      >
        <h2 class="text-lg font-bold text-slate-800">{{ bloque.titulo }}</h2>
        <p v-if="bloque.texto" class="text-sm sm:text-base text-slate-600">{{ bloque.texto }}</p>
        <ul v-if="bloque.items?.length" class="space-y-2">
          <li v-for="item in bloque.items" :key="item" class="flex gap-3 text-sm sm:text-base text-slate-600">
            <span class="mt-1 w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Icone :d="ICONE_CHECK" :stroke-width="3" class="w-3 h-3" />
            </span>
            {{ item }}
          </li>
        </ul>
        <div v-if="bloque.ejemplo || bloque.dato" class="mt-auto bg-amber-50 border border-amber-100 rounded-xl p-4">
          <p class="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-1">
            <Icone :d="ICONE_LAMPADA" class="w-4 h-4 shrink-0" />
            {{ bloque.ejemplo ? t('educacion.ejemplo') : t('educacion.sabias') }}
          </p>
          <p class="text-sm text-slate-600">{{ bloque.ejemplo || bloque.dato }}</p>
        </div>
      </section>
    </div>

    <!-- passos numerados -->
    <section v-if="tema.pasos?.length" class="cartao p-5 sm:p-7">
      <h2 class="text-lg sm:text-xl font-bold text-slate-800 mb-4">{{ t('educacion.pasoAPaso') }}</h2>
      <ol class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <li
          v-for="(paso, i) in tema.pasos"
          :key="paso.nombre"
          class="flex items-start gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-4"
        >
          <span class="w-9 h-9 rounded-full bg-emerald-900 text-white text-sm font-bold flex items-center justify-center shrink-0">
            {{ i + 1 }}
          </span>
          <p class="text-sm text-slate-600">
            <strong class="block text-slate-800 text-base">{{ paso.nombre }}</strong>
            {{ paso.texto }}
          </p>
        </li>
      </ol>
    </section>

    <!-- o que a pyme pode fazer -->
    <section v-if="tema.acciones" class="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 sm:p-7">
      <h2 class="text-lg sm:text-xl font-bold text-emerald-950 mb-3">{{ tema.acciones.titulo }}</h2>
      <ol class="space-y-2">
        <li v-for="(item, i) in tema.acciones.items" :key="item" class="flex gap-3 text-sm sm:text-base text-slate-700">
          <span class="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-bold flex items-center justify-center shrink-0">
            {{ i + 1 }}
          </span>
          {{ item }}
        </li>
      </ol>
    </section>

    <!-- aviso importante -->
    <div v-if="tema.nota" class="flex gap-3 bg-sky-50 border border-sky-100 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-sky-950">
      <Icone :d="ICONE_INFO" class="w-5 h-5 shrink-0 mt-0.5 text-sky-700" />
      <p>{{ tema.nota }}</p>
    </div>

    <!-- fontes oficiais -->
    <section v-if="tema.fuentes?.length">
      <h2 class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{{ t('educacion.fuentes') }}</h2>
      <ul class="flex flex-wrap gap-2">
        <li v-for="fuente in tema.fuentes" :key="fuente.url">
          <a
            :href="fuente.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-sm text-slate-700 hover:border-emerald-300 hover:text-emerald-800 transition"
          >
            {{ fuente.nombre }}
            <Icone :d="ICONE_LINK_EXTERNO" class="w-3.5 h-3.5" />
          </a>
        </li>
      </ul>
    </section>

    <!-- navegação entre temas -->
    <nav class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200" :aria-label="t('educacion.navegacion')">
      <router-link
        v-if="anterior"
        :to="`/educacion/${anterior.slug}`"
        class="cartao block p-4 hover:border-emerald-300 transition"
      >
        <span class="text-xs font-semibold text-slate-500">{{ t('educacion.anterior') }}</span>
        <span class="block font-semibold text-slate-800">{{ anterior.titulo }}</span>
      </router-link>
      <span v-else class="hidden sm:block"></span>
      <router-link
        v-if="seguinte"
        :to="`/educacion/${seguinte.slug}`"
        class="cartao block p-4 sm:text-right hover:border-emerald-300 transition"
      >
        <span class="text-xs font-semibold text-slate-500">{{ t('educacion.siguiente') }}</span>
        <span class="block font-semibold text-slate-800">{{ seguinte.titulo }}</span>
      </router-link>
      <router-link
        v-else
        to="/educacion"
        class="cartao block p-4 sm:text-right hover:border-emerald-300 transition"
      >
        <span class="text-xs font-semibold text-slate-500">{{ t('educacion.terminaste') }}</span>
        <span class="inline-flex items-center gap-1 font-semibold text-slate-800">
          {{ t('educacion.volver') }}
          <Icone :d="ICONE_SETA" class="w-4 h-4" />
        </span>
      </router-link>
    </nav>
  </Pagina>
</template>
