<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BackgroundAurora from '../components/ui/BackgroundAurora.vue'
import Icone from '../components/ui/Icone.vue'
import { NOME_APP } from '../constants/marca'
import { ICONE_BROTO, ICONE_CHECKLIST, ICONE_LAMPADA, ICONE_GLOBO } from '../constants/icones'

// Moldura das telas de login e cadastro.
// Desktop: marca e benefícios à esquerda, formulário num card de vidro à direita.
// Celular: marca no topo e o formulário numa folha que sobe até o fim da tela.
// As duas rotas usam este mesmo componente, então ele não é recriado ao trocar de aba
// (é isso que deixa o seletor deslizar).
const route = useRoute()

const ABAS = [
  { para: '/login', rotulo: 'Iniciar sesión' },
  { para: '/cadastro', rotulo: 'Crear cuenta' }
]
const indiceAba = computed(() => Math.max(0, ABAS.findIndex((aba) => aba.para === route.path)))

const BENEFICIOS = [
  { icone: ICONE_CHECKLIST, titulo: 'Diagnóstico en 4 dimensiones', texto: 'Gobernanza, ambiental, social y económica, en pocos minutos.' },
  { icone: ICONE_LAMPADA, titulo: 'Recomendaciones prácticas', texto: 'Acciones concretas según el nivel de madurez de tu empresa.' },
  { icone: ICONE_GLOBO, titulo: 'Alineado con los ODS', texto: 'Conecta la gestión de tu empresa con la Agenda 2030.' }
]
</script>

<template>
  <div class="relative min-h-dvh bg-emerald-800 overflow-hidden flex flex-col">
    <BackgroundAurora />

    <!-- no desktop as duas colunas ficam juntas no centro (largura máxima), não nas extremidades -->
    <div class="relative z-10 flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-center w-full lg:max-w-6xl lg:mx-auto lg:px-10 lg:py-12 lg:gap-16 xl:gap-20">

    <!-- marca: faixa no topo (celular) / coluna da esquerda (desktop) -->
    <section class="relative z-10 text-white px-6 pt-[calc(2rem+env(safe-area-inset-top))] pb-8 lg:flex-1 lg:px-0 lg:py-0">
      <div class="flex items-center justify-center lg:justify-start gap-3">
        <div class="w-11 h-11 lg:w-14 lg:h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center shadow-inner">
          <Icone :d="ICONE_BROTO" class="w-6 h-6 lg:w-7 lg:h-7" />
        </div>
        <span class="font-display font-extrabold tracking-wider text-2xl lg:text-4xl">{{ NOME_APP }}</span>
      </div>

      <p class="mt-3 lg:mt-8 text-center lg:text-left text-sm text-emerald-100/90 lg:font-display lg:text-4xl lg:font-semibold lg:text-white lg:leading-tight lg:max-w-lg">
        Mide, mejora y comunica la sostenibilidad de tu pyme.
      </p>

      <ul class="hidden lg:flex flex-col gap-6 mt-12 max-w-md">
        <li v-for="beneficio in BENEFICIOS" :key="beneficio.titulo" class="flex gap-4">
          <span class="w-11 h-11 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
            <Icone :d="beneficio.icone" class="w-5 h-5" />
          </span>
          <div>
            <p class="font-semibold">{{ beneficio.titulo }}</p>
            <p class="text-sm text-emerald-100/80 mt-0.5">{{ beneficio.texto }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- formulário: folha (celular) / card de vidro (desktop) -->
    <section class="relative z-10 flex-1 flex lg:flex-none lg:w-[460px] xl:w-[480px]">
      <div
        class="w-full bg-slate-50 rounded-t-3xl shadow-2xl px-6 pt-6 pb-[calc(2rem+env(safe-area-inset-bottom))]
               lg:bg-white/92 lg:backdrop-blur-xl lg:backdrop-saturate-150 lg:border lg:border-white/70 lg:rounded-3xl lg:p-10"
      >
        <div class="max-w-md mx-auto">
          <!-- seletor login | cadastro, com a pílula branca deslizando -->
          <nav class="relative grid grid-cols-2 p-1 rounded-full bg-slate-200/70 mb-8" aria-label="Acceso">
            <span
              aria-hidden="true"
              class="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform duration-300 ease-[cubic-bezier(0.3,1.35,0.5,1)] motion-reduce:transition-none"
              :style="{ transform: `translateX(${indiceAba * 100}%)` }"
            ></span>
            <router-link
              v-for="(aba, i) in ABAS"
              :key="aba.para"
              :to="aba.para"
              replace
              class="relative text-center py-2 rounded-full text-sm font-semibold transition-colors"
              :class="indiceAba === i ? 'text-emerald-900' : 'text-slate-500 hover:text-slate-700'"
            >
              {{ aba.rotulo }}
            </router-link>
          </nav>

          <router-view v-slot="{ Component, route: rota }">
            <Transition name="pagina" mode="out-in">
              <component :is="Component" :key="rota.path" />
            </Transition>
          </router-view>
        </div>
      </div>
    </section>
    </div>
  </div>
</template>
